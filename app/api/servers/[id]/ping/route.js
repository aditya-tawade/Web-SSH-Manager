import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Server from '@/models/Server';
import { Client } from 'ssh2';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long!!';

function decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

export async function GET(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const server = await Server.findById(id);

        if (!server) {
            return NextResponse.json({ success: false, online: false, message: 'Server not found' }, { status: 404 });
        }

        const privateKey = decrypt(server.encryptedPrivateKey);

        return new Promise((resolve) => {
            const conn = new Client();
            const timeout = setTimeout(() => {
                conn.end();
                resolve(NextResponse.json({ success: true, online: false, latency: null }));
            }, 5000);

            const startTime = Date.now();

            conn.on('ready', () => {
                clearTimeout(timeout);
                const latency = Date.now() - startTime;
                conn.end();
                resolve(NextResponse.json({ success: true, online: true, latency }));
            }).on('error', () => {
                clearTimeout(timeout);
                resolve(NextResponse.json({ success: true, online: false, latency: null }));
            }).connect({
                host: server.host,
                port: server.port || 22,
                username: server.username,
                privateKey: privateKey,
                readyTimeout: 5000
            });
        });
    } catch (error) {
        return NextResponse.json({ success: false, online: false, message: error.message }, { status: 400 });
    }
}
