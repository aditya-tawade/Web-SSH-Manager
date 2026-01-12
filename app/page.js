'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Server as ServerIcon, Terminal, Trash2, Globe, User, LogOut, Loader2, ShieldCheck, Key, Upload, FolderOpen, Command, Search, Clock, Wifi, WifiOff, X, Users, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newServer, setNewServer] = useState({ name: '', host: '', username: '', port: 22, privateKey: '' });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [deleteModalId, setDeleteModalId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [serverStatus, setServerStatus] = useState({});
    const [connectionHistory, setConnectionHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const searchRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        fetchServers();
        loadConnectionHistory();
        fetchUserRole();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            // Ctrl/Cmd + N for new server
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setShowAddModal(true);
            }
            // Escape to close modals
            if (e.key === 'Escape') {
                setShowAddModal(false);
                setDeleteModalId(null);
                setShowHistory(false);
            }
            // Ctrl/Cmd + H for history
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                setShowHistory(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const loadConnectionHistory = () => {
        try {
            const history = JSON.parse(localStorage.getItem('connectionHistory') || '[]');
            setConnectionHistory(history);
        } catch {
            setConnectionHistory([]);
        }
    };

    const addToHistory = (server) => {
        const entry = {
            serverId: server._id,
            serverName: server.name,
            host: server.host,
            timestamp: new Date().toISOString()
        };
        const history = JSON.parse(localStorage.getItem('connectionHistory') || '[]');
        const filtered = history.filter(h => h.serverId !== server._id);
        const updated = [entry, ...filtered].slice(0, 10);
        localStorage.setItem('connectionHistory', JSON.stringify(updated));
        setConnectionHistory(updated);
    };

    const fetchUserRole = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success) {
                setUserRole(data.user.role);
            }
        } catch {
            console.error('Failed to fetch user role');
        }
    };

    const fetchServers = async () => {
        try {
            const res = await fetch('/api/servers');
            const data = await res.json();
            if (data.success) {
                setServers(data.data);
                // Ping all servers
                data.data.forEach(server => pingServer(server._id));
            }
        } catch (err) {
            console.error('Failed to fetch servers');
        } finally {
            setLoading(false);
        }
    };

    const pingServer = async (serverId) => {
        try {
            const res = await fetch(`/api/servers/${serverId}/ping`);
            const data = await res.json();
            setServerStatus(prev => ({ ...prev, [serverId]: data }));
        } catch {
            setServerStatus(prev => ({ ...prev, [serverId]: { online: false } }));
        }
    };

    const handleAddServer = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError('');
        try {
            const res = await fetch('/api/servers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newServer),
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setNewServer({ name: '', host: '', username: '', port: 22, privateKey: '' });
                fetchServers();
            } else {
                setError(data.message || 'Failed to add server');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setAdding(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModalId) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/servers/${deleteModalId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchServers();
            }
        } catch (err) {
            console.error('Delete failed');
        } finally {
            setDeleting(false);
            setDeleteModalId(null);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const connectToTerminal = (server) => {
        addToHistory(server);
        router.push(`/terminal/${server._id}`);
    };

    // Filter servers based on search
    const filteredServers = servers.filter(server =>
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Terminal className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">UnifiedSSH</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium">
                        <ServerIcon className="w-5 h-5" />
                        Servers
                    </button>
                    <button
                        onClick={() => router.push('/terminal')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                    >
                        <Terminal className="w-5 h-5" />
                        Multi-Terminal
                    </button>
                    <button
                        onClick={() => router.push('/commands')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                    >
                        <Command className="w-5 h-5" />
                        Quick Commands
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                    >
                        <Clock className="w-5 h-5" />
                        History
                    </button>

                    <div className="border-t border-neutral-800 my-2 mx-2"></div>

                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={() => router.push('/users')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                User Management
                            </button>
                            <button
                                onClick={() => router.push('/audit')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                Audit Logs
                            </button>
                        </>
                    )}
                </nav>

                {/* Keyboard shortcuts hint */}
                <div className="p-4 border-t border-neutral-800 text-xs text-neutral-600">
                    <div className="flex justify-between mb-1"><span>Search</span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded">⌘K</kbd></div>
                    <div className="flex justify-between mb-1"><span>New Server</span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded">⌘N</kbd></div>
                    <div className="flex justify-between"><span>History</span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded">⌘H</kbd></div>
                </div>

                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold">Active Servers</h1>
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search servers... (⌘K)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Server
                    </button>
                </header>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p>Fetching server matrix...</p>
                        </div>
                    ) : filteredServers.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-3xl">
                            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ServerIcon className="w-8 h-8 text-neutral-500" />
                            </div>
                            <h3 className="text-lg font-medium">{searchQuery ? 'No servers match your search' : 'No servers configured'}</h3>
                            <p className="text-neutral-500 mt-2 mb-6 max-w-xs mx-auto">
                                {searchQuery ? 'Try a different search term' : 'Get started by adding your first remote server to the dashboard.'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                                >
                                    Connect a server now <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredServers.map((server) => {
                                const status = serverStatus[server._id];
                                return (
                                    <div key={server._id} className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden">
                                        {/* Status indicator */}
                                        <div className="absolute top-4 left-4">
                                            {status === undefined ? (
                                                <div className="w-2.5 h-2.5 rounded-full bg-neutral-600 animate-pulse" title="Checking..." />
                                            ) : status.online ? (
                                                <div className="flex items-center gap-1.5" title={`Online (${status.latency}ms)`}>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                    <span className="text-xs text-green-500">{status.latency}ms</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5" title="Offline">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                                    <span className="text-xs text-red-500">Offline</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => setDeleteModalId(server._id)}
                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6 mt-4">
                                            <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{server.name}</h3>
                                                <p className="text-neutral-500 text-sm flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {server.username}@{server.host}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => connectToTerminal(server)}
                                                className="flex-1 bg-neutral-800 hover:bg-primary text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Terminal className="w-4 h-4" />
                                                Connect
                                            </button>
                                            <button
                                                onClick={() => router.push(`/files/${server._id}`)}
                                                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                                title="SFTP File Manager"
                                            >
                                                <FolderOpen className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Server Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="text-primary w-6 h-6" /> Add Remote Server
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleAddServer} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Server Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Production Web #1"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-all"
                                        value={newServer.name}
                                        onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Host / IP Address</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="192.168.1.1 or example.com"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-all"
                                        value={newServer.host}
                                        onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">SSH Username</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="root"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-all"
                                        value={newServer.username}
                                        onChange={(e) => setNewServer({ ...newServer, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Port</label>
                                    <input
                                        type="number"
                                        placeholder="22"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-all"
                                        value={newServer.port}
                                        onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-neutral-400 flex items-center justify-between">
                                    <span>SSH Private Key</span>
                                    <span className="text-xs text-neutral-600 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Encrypted at rest
                                    </span>
                                </label>

                                <div className="flex gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm font-medium">Upload Key File</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".pem,.key,.pub,*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setNewServer({ ...newServer, privateKey: event.target.result });
                                                    };
                                                    reader.readAsText(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                <textarea
                                    required
                                    rows={6}
                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----... (paste or upload)"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all font-mono text-xs"
                                    value={newServer.privateKey}
                                    onChange={(e) => setNewServer({ ...newServer, privateKey: e.target.value })}
                                />
                                {newServer.privateKey && (
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Key loaded ({newServer.privateKey.length} characters)
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-800 hover:bg-neutral-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex-[2] bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {adding ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Testing Connection...</>
                                    ) : (
                                        <><ShieldCheck className="w-5 h-5" /> Save & Verify</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Delete Server?</h2>
                            <p className="text-neutral-400 text-sm mb-6">
                                This action cannot be undone. The server configuration will be permanently removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModalId(null)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2">
                                <Clock className="text-primary w-5 h-5" />
                                Connection History
                            </h2>
                            <button onClick={() => setShowHistory(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 max-h-80 overflow-y-auto">
                            {connectionHistory.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500">
                                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No recent connections</p>
                                </div>
                            ) : (
                                connectionHistory.map((entry, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setShowHistory(false);
                                            router.push(`/terminal/${entry.serverId}`);
                                        }}
                                        className="w-full p-3 text-left hover:bg-neutral-800 rounded-xl transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                                            <Terminal className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{entry.serverName}</p>
                                            <p className="text-xs text-neutral-500">{entry.host}</p>
                                        </div>
                                        <span className="text-xs text-neutral-600">
                                            {new Date(entry.timestamp).toLocaleDateString()}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
