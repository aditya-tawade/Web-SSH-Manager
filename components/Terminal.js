'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { io } from 'socket.io-client';

export default function SSHScanner({ serverId }) {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const socketRef = useRef(null);
    const fitAddonRef = useRef(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        let term = null;
        let fitAddon = null;
        let socket = null;
        let resizeObserver = null;
        let isMounted = true;

        const handleResize = () => {
            if (!fitAddon || !term || !socket) return;
            try {
                fitAddon.fit();
                socket.emit('ssh-resize', {
                    cols: term.cols,
                    rows: term.rows
                });
            } catch (e) {
                console.warn('Resize fit failed:', e);
            }
        };

        const initTerminal = () => {
            if (!terminalRef.current || !isMounted) return;

            const rect = terminalRef.current.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                requestAnimationFrame(initTerminal);
                return;
            }

            term = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#0a0a0a',
                    foreground: '#ffffff',
                },
                fontFamily: '"Cascadia Code", Menlo, monospace',
                fontSize: 14,
            });

            fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(terminalRef.current);

            try {
                fitAddon.fit();
            } catch (e) {
                console.warn('Initial fit failed:', e);
            }

            xtermRef.current = term;
            fitAddonRef.current = fitAddon;

            term.writeln('\x1b[33m⚡ Initializing SSH Tunnel...\x1b[0m');

            socket = io({
                path: '/api/ssh/socket',
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                term.writeln('\x1b[32m✔ Gateway connected\x1b[0m');
                socket.emit('ssh-connect', { serverId });
            });

            socket.on('ssh-ready', () => {
                term.writeln('\x1b[32m✔ SSH session established\x1b[0m\r\n');
            });

            socket.on('ssh-data', (data) => {
                term.write(data);
            });

            socket.on('ssh-error', (err) => {
                term.writeln(`\r\n\x1b[31m✖ SSH Error: ${err}\x1b[0m`);
            });

            socket.on('disconnect', () => {
                term.writeln('\r\n\x1b[31m✖ Gateway disconnected\x1b[0m');
            });

            term.onData((data) => {
                socket.emit('ssh-input', data);
            });

            resizeObserver = new ResizeObserver(() => {
                handleResize();
            });
            resizeObserver.observe(terminalRef.current);
            window.addEventListener('resize', handleResize);
        };

        initTerminal();

        return () => {
            isMounted = false;
            window.removeEventListener('resize', handleResize);
            if (resizeObserver) resizeObserver.disconnect();
            if (socket) socket.disconnect();
            if (term) term.dispose();
        };
    }, [serverId]);

    return (
        <div className="w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
            <div ref={terminalRef} className="w-full h-full p-2" />
        </div>
    );
}
