import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Server from '@/models/Server';
import { encrypt } from '@/lib/encryption';
import { Client } from 'ssh2';

export async function GET() {
    await dbConnect();
    try {
        const servers = await Server.find({}).sort({ createdAt: -1 });
        // Don't leak the keys even encrypted to the list frontend
        const safeServers = servers.map(s => ({
            _id: s._id,
            name: s.name,
            host: s.host,
            username: s.username,
            port: s.port,
            createdAt: s.createdAt
        }));
        return NextResponse.json({ success: true, data: safeServers });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { name, host, username, privateKey, port } = body;

        if (!name || !host || !username || !privateKey) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Connection validation
        const connPromise = new Promise((resolve, reject) => {
            const conn = new Client();
            conn.on('ready', () => {
                conn.end();
                resolve(true);
            }).on('error', (err) => {
                reject(err);
            }).connect({
                host,
                port: port || 22,
                username,
                privateKey,
                readyTimeout: 10000
            });
        });

        try {
            await connPromise;
        } catch (sshErr) {
            return NextResponse.json({ success: false, message: `SSH Connection failed: ${sshErr.message}` }, { status: 400 });
        }

        const encryptedKey = encrypt(privateKey);

        const server = await Server.create({
            name,
            host,
            username,
            port: port || 22,
            encryptedPrivateKey: encryptedKey,
        });

        return NextResponse.json({ success: true, data: { _id: server._id, name: server.name } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
