const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { Client } = require('ssh2');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

// Encryption secret (should match lib/encryption.js)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long!!';

function decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Minimal Server model for SSH logic (avoids full import issues)
const ServerSchema = new mongoose.Schema({
    name: String,
    host: String,
    port: Number,
    username: String,
    encryptedPrivateKey: String,
});

const MongoServer = mongoose.models.Server || mongoose.model('Server', ServerSchema);

// Audit Log model for tracking SSH connections
const AuditLogSchema = new mongoose.Schema({
    userId: String,
    username: String,
    action: String,
    serverId: String,
    serverName: String,
    ipAddress: String,
    timestamp: { type: Date, default: Date.now },
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

async function logAudit(data) {
    try {
        await AuditLog.create(data);
    } catch (error) {
        console.error('Audit log error:', error);
    }
}

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(server, {
        path: '/api/ssh/socket',
    });

    io.on('connection', (socket) => {
        console.log('New WebSocket connection:', socket.id);
        let sshConn = null;
        let connectedServer = null;

        socket.on('ssh-connect', async ({ serverId }) => {
            try {
                if (!mongoose.connection.readyState) {
                    await mongoose.connect(process.env.MONGODB_URI);
                }

                const serverInfo = await MongoServer.findById(serverId);
                if (!serverInfo) {
                    socket.emit('ssh-error', 'Server not found');
                    return;
                }

                const privateKey = decrypt(serverInfo.encryptedPrivateKey);

                sshConn = new Client();

                sshConn.on('ready', () => {
                    socket.emit('ssh-ready');
                    connectedServer = serverInfo;

                    // Log SSH connection
                    logAudit({
                        action: 'ssh_connect',
                        serverId: serverInfo._id.toString(),
                        serverName: serverInfo.name,
                        ipAddress: socket.handshake.address,
                    });

                    sshConn.shell((err, stream) => {
                        if (err) {
                            socket.emit('ssh-error', `Shell error: ${err.message}`);
                            return;
                        }

                        socket.on('ssh-input', (data) => {
                            if (stream.writable) stream.write(data);
                        });

                        socket.on('ssh-resize', ({ cols, rows }) => {
                            stream.setWindow(rows, cols);
                        });

                        stream.on('data', (data) => {
                            socket.emit('ssh-data', data.toString('utf-8'));
                        });

                        stream.on('close', () => {
                            socket.emit('ssh-error', 'SSH Session Closed');
                            sshConn.end();
                        });
                    });
                }).on('error', (err) => {
                    socket.emit('ssh-error', `SSH Connection error: ${err.message}`);
                }).connect({
                    host: serverInfo.host,
                    port: serverInfo.port || 22,
                    username: serverInfo.username,
                    privateKey: privateKey,
                    readyTimeout: 20000
                });

            } catch (err) {
                socket.emit('ssh-error', `System error: ${err.message}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (sshConn) {
                sshConn.end();

                // Log SSH disconnect
                if (connectedServer) {
                    logAudit({
                        action: 'ssh_disconnect',
                        serverId: connectedServer._id.toString(),
                        serverName: connectedServer.name,
                        ipAddress: socket.handshake.address,
                    });
                }
            }
        });

        socket.on('sftp-list', async ({ serverId, path }) => {
            try {
                if (!mongoose.connection.readyState) {
                    await mongoose.connect(process.env.MONGODB_URI);
                }

                const serverInfo = await MongoServer.findById(serverId);
                if (!serverInfo) {
                    socket.emit('sftp-error', 'Server not found');
                    return;
                }

                const privateKey = decrypt(serverInfo.encryptedPrivateKey);
                const conn = new Client();

                conn.on('ready', () => {
                    conn.sftp((err, sftp) => {
                        if (err) {
                            socket.emit('sftp-error', err.message);
                            conn.end();
                            return;
                        }

                        sftp.readdir(path || '/', (err, list) => {
                            if (err) {
                                socket.emit('sftp-error', err.message);
                            } else {
                                const files = list.map(f => ({
                                    name: f.filename,
                                    type: f.longname.startsWith('d') ? 'directory' : 'file',
                                    size: f.attrs.size,
                                    modified: new Date(f.attrs.mtime * 1000).toISOString(),
                                }));
                                socket.emit('sftp-list', { path, files });
                            }
                            conn.end();
                        });
                    });
                }).on('error', (err) => {
                    socket.emit('sftp-error', err.message);
                }).connect({
                    host: serverInfo.host,
                    port: serverInfo.port || 22,
                    username: serverInfo.username,
                    privateKey: privateKey,
                    readyTimeout: 20000
                });
            } catch (err) {
                socket.emit('sftp-error', err.message);
            }
        });

        socket.on('sftp-download', async ({ serverId, remotePath }) => {
            try {
                if (!mongoose.connection.readyState) {
                    await mongoose.connect(process.env.MONGODB_URI);
                }

                const serverInfo = await MongoServer.findById(serverId);
                if (!serverInfo) {
                    socket.emit('sftp-error', 'Server not found');
                    return;
                }

                const privateKey = decrypt(serverInfo.encryptedPrivateKey);
                const conn = new Client();

                conn.on('ready', () => {
                    conn.sftp((err, sftp) => {
                        if (err) {
                            socket.emit('sftp-error', err.message);
                            conn.end();
                            return;
                        }

                        const chunks = [];
                        const readStream = sftp.createReadStream(remotePath);

                        readStream.on('data', (chunk) => {
                            chunks.push(chunk);
                        });

                        readStream.on('end', () => {
                            const buffer = Buffer.concat(chunks);
                            socket.emit('sftp-download', {
                                path: remotePath,
                                data: buffer.toString('base64'),
                                filename: remotePath.split('/').pop()
                            });
                            conn.end();
                        });

                        readStream.on('error', (err) => {
                            socket.emit('sftp-error', err.message);
                            conn.end();
                        });
                    });
                }).on('error', (err) => {
                    socket.emit('sftp-error', err.message);
                }).connect({
                    host: serverInfo.host,
                    port: serverInfo.port || 22,
                    username: serverInfo.username,
                    privateKey: privateKey,
                    readyTimeout: 20000
                });
            } catch (err) {
                socket.emit('sftp-error', err.message);
            }
        });

        socket.on('sftp-upload', async ({ serverId, remotePath, filename, data }) => {
            try {
                if (!mongoose.connection.readyState) {
                    await mongoose.connect(process.env.MONGODB_URI);
                }

                const serverInfo = await MongoServer.findById(serverId);
                if (!serverInfo) {
                    socket.emit('sftp-error', 'Server not found');
                    return;
                }

                const privateKey = decrypt(serverInfo.encryptedPrivateKey);
                const conn = new Client();

                conn.on('ready', () => {
                    conn.sftp((err, sftp) => {
                        if (err) {
                            socket.emit('sftp-error', err.message);
                            conn.end();
                            return;
                        }

                        const fullPath = remotePath.endsWith('/') ? remotePath + filename : remotePath + '/' + filename;
                        const buffer = Buffer.from(data, 'base64');
                        const writeStream = sftp.createWriteStream(fullPath);

                        writeStream.on('close', () => {
                            socket.emit('sftp-upload-success', { path: fullPath });
                            conn.end();
                        });

                        writeStream.on('error', (err) => {
                            socket.emit('sftp-error', err.message);
                            conn.end();
                        });

                        writeStream.write(buffer);
                        writeStream.end();
                    });
                }).on('error', (err) => {
                    socket.emit('sftp-error', err.message);
                }).connect({
                    host: serverInfo.host,
                    port: serverInfo.port || 22,
                    username: serverInfo.username,
                    privateKey: privateKey,
                    readyTimeout: 20000
                });
            } catch (err) {
                socket.emit('sftp-error', err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (sshConn) sshConn.end();
        });
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
