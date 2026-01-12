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
            if (sshConn) sshConn.end();
        });
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
