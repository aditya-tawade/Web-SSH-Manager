'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Shield, Clock, Filter, Loader2, Terminal, LogIn, LogOut, Server, Trash2, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const url = filter ? `/api/audit?action=${filter}` : '/api/audit';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    const actionIcons = {
        login: <LogIn className="w-4 h-4 text-green-400" />,
        logout: <LogOut className="w-4 h-4 text-neutral-400" />,
        ssh_connect: <Terminal className="w-4 h-4 text-blue-400" />,
        ssh_disconnect: <Terminal className="w-4 h-4 text-neutral-400" />,
        sftp_access: <FolderOpen className="w-4 h-4 text-purple-400" />,
        server_create: <Server className="w-4 h-4 text-green-400" />,
        server_delete: <Trash2 className="w-4 h-4 text-red-400" />,
    };

    const actionLabels = {
        login: 'Login',
        logout: 'Logout',
        ssh_connect: 'SSH Connect',
        ssh_disconnect: 'SSH Disconnect',
        sftp_access: 'SFTP Access',
        server_create: 'Server Created',
        server_delete: 'Server Deleted',
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/')} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <FileText className="text-primary w-5 h-5" />
                        </div>
                        <h1 className="font-semibold text-lg">Audit Logs</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-neutral-500" />
                    <select
                        className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="login">Logins</option>
                        <option value="ssh_connect">SSH Connections</option>
                        <option value="sftp_access">SFTP Access</option>
                        <option value="server_create">Server Created</option>
                        <option value="server_delete">Server Deleted</option>
                    </select>
                </div>
            </header>

            <main className="flex-1 p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p>Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-3xl">
                        <FileText className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No audit logs yet</h3>
                        <p className="text-neutral-500 mt-2">Activity will appear here once users start interacting.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {logs.map((log, index) => (
                            <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                                    {actionIcons[log.action] || <Shield className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{log.username}</span>
                                        <span className="text-neutral-500">•</span>
                                        <span className="text-sm text-neutral-400">{actionLabels[log.action] || log.action}</span>
                                    </div>
                                    {log.serverName && (
                                        <p className="text-sm text-neutral-500 mt-0.5">Server: {log.serverName}</p>
                                    )}
                                </div>
                                <div className="text-right text-sm text-neutral-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                    {log.ipAddress && <p className="text-xs">{log.ipAddress}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
