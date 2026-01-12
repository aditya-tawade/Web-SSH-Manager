'use client';

import { useState, useEffect, useRef } from 'react';
import { Folder, File, ChevronLeft, ChevronRight, Upload, Download, RefreshCw, Home, Loader2, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

export default function FileManager({ serverId }) {
    const [currentPath, setCurrentPath] = useState('/');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const socketRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const socket = io({ path: '/api/ssh/socket' });
        socketRef.current = socket;

        socket.on('connect', () => {
            loadDirectory('/');
        });

        socket.on('sftp-list', ({ path, files }) => {
            setCurrentPath(path);
            setFiles(files.sort((a, b) => {
                if (a.type === 'directory' && b.type !== 'directory') return -1;
                if (a.type !== 'directory' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
            }));
            setLoading(false);
            setError('');
        });

        socket.on('sftp-error', (err) => {
            setError(err);
            setLoading(false);
        });

        socket.on('sftp-download', ({ data, filename }) => {
            const link = document.createElement('a');
            link.href = `data:application/octet-stream;base64,${data}`;
            link.download = filename;
            link.click();
        });

        socket.on('sftp-upload-success', () => {
            setUploading(false);
            loadDirectory(currentPath);
        });

        return () => {
            socket.disconnect();
        };
    }, [serverId]);

    const loadDirectory = (path) => {
        setLoading(true);
        setError('');
        socketRef.current?.emit('sftp-list', { serverId, path });
    };

    const navigateTo = (item) => {
        if (item.type === 'directory') {
            const newPath = currentPath === '/'
                ? `/${item.name}`
                : `${currentPath}/${item.name}`;
            loadDirectory(newPath);
        }
    };

    const goUp = () => {
        if (currentPath === '/') return;
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        const newPath = parts.length === 0 ? '/' : '/' + parts.join('/');
        loadDirectory(newPath);
    };

    const downloadFile = (item) => {
        if (item.type === 'file') {
            const remotePath = currentPath === '/'
                ? `/${item.name}`
                : `${currentPath}/${item.name}`;
            socketRef.current?.emit('sftp-download', { serverId, remotePath });
        }
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            setUploading(true);
            socketRef.current?.emit('sftp-upload', {
                serverId,
                remotePath: currentPath,
                filename: file.name,
                data: base64
            });
        };
        reader.readAsDataURL(file);
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '—';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="h-full flex flex-col bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="h-12 border-b border-neutral-800 flex items-center gap-2 px-3 bg-neutral-900/50">
                <button onClick={() => loadDirectory('/')} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400" title="Home">
                    <Home className="w-4 h-4" />
                </button>
                <button onClick={goUp} disabled={currentPath === '/'} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 disabled:opacity-30" title="Go Up">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm font-mono text-neutral-300 truncate">
                    {currentPath}
                </div>
                <button onClick={() => loadDirectory(currentPath)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400" title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <label className="cursor-pointer">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
                </label>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto">
                {error ? (
                    <div className="p-8 text-center text-red-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>{error}</p>
                    </div>
                ) : loading ? (
                    <div className="p-8 text-center text-neutral-500">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                        <p>Loading...</p>
                    </div>
                ) : files.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                        <Folder className="w-8 h-8 mx-auto mb-2" />
                        <p>Directory is empty</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-neutral-900 text-neutral-400 text-xs uppercase">
                            <tr>
                                <th className="text-left p-3 font-medium">Name</th>
                                <th className="text-right p-3 font-medium w-24">Size</th>
                                <th className="text-right p-3 font-medium w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-neutral-800/50 hover:bg-neutral-900/50 cursor-pointer"
                                    onClick={() => navigateTo(item)}
                                >
                                    <td className="p-3 flex items-center gap-2">
                                        {item.type === 'directory' ? (
                                            <Folder className="w-4 h-4 text-primary" />
                                        ) : (
                                            <File className="w-4 h-4 text-neutral-500" />
                                        )}
                                        <span className="truncate">{item.name}</span>
                                    </td>
                                    <td className="p-3 text-right text-neutral-500">
                                        {item.type === 'file' ? formatSize(item.size) : '—'}
                                    </td>
                                    <td className="p-3 text-right">
                                        {item.type === 'file' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); downloadFile(item); }}
                                                className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                        {item.type === 'directory' && (
                                            <ChevronRight className="w-4 h-4 text-neutral-600" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
