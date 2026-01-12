'use client';

import { useState, useEffect } from 'react';
import { Plus, Server as ServerIcon, Terminal, Trash2, Globe, User, LogOut, Loader2, ShieldCheck, Key, Upload } from 'lucide-react';
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
    const router = useRouter();

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            const res = await fetch('/api/servers');
            const data = await res.json();
            if (data.success) {
                setServers(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch servers');
        } finally {
            setLoading(false);
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

    const connectToTerminal = (id) => {
        router.push(`/terminal/${id}`);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Terminal className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Antigravity</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium">
                        <ServerIcon className="w-5 h-5" />
                        Servers
                    </button>
                    {/* Future sections like Settings, Users can be added here */}
                </nav>

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
                    <h1 className="text-xl font-semibold">Active Servers</h1>
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
                    ) : servers.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-3xl">
                            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ServerIcon className="w-8 h-8 text-neutral-500" />
                            </div>
                            <h3 className="text-lg font-medium">No servers configured</h3>
                            <p className="text-neutral-500 mt-2 mb-6 max-w-xs mx-auto">Get started by adding your first remote server to the dashboard.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                            >
                                Connect a server now <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {servers.map((server) => (
                                <div key={server._id} className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => setDeleteModalId(server._id)}
                                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
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

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => connectToTerminal(server._id)}
                                            className="flex-1 bg-neutral-800 hover:bg-primary text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Terminal className="w-4 h-4" />
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            ))}
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

                                {/* Upload Button */}
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

                                {/* Textarea for paste or display */}
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
        </div>
    );
}
