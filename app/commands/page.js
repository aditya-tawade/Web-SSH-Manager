'use client';

import { useState, useEffect } from 'react';
import { Plus, Command, Trash2, Play, ChevronLeft, Loader2, Copy, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandsPage() {
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCommand, setNewCommand] = useState({ name: '', command: '', description: '' });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchCommands();
    }, []);

    const fetchCommands = async () => {
        try {
            const res = await fetch('/api/commands');
            const data = await res.json();
            if (data.success) {
                setCommands(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch commands');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCommand = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError('');
        try {
            const res = await fetch('/api/commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCommand),
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setNewCommand({ name: '', command: '', description: '' });
                fetchCommands();
            } else {
                setError(data.message || 'Failed to add command');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/commands/${id}`, { method: 'DELETE' });
            fetchCommands();
        } catch (err) {
            console.error('Delete failed');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Command className="text-primary w-5 h-5" />
                        </div>
                        <h1 className="font-semibold text-lg">Quick Commands</h1>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Command
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p>Loading commands...</p>
                    </div>
                ) : commands.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-3xl">
                        <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Command className="w-8 h-8 text-neutral-500" />
                        </div>
                        <h3 className="text-lg font-medium">No commands saved</h3>
                        <p className="text-neutral-500 mt-2 mb-6 max-w-xs mx-auto">Save frequently-used commands for quick execution.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                            Add your first command <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {commands.map((cmd) => (
                            <div key={cmd._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-primary/30 transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold">{cmd.name}</h3>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cmd._id)}
                                        className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {cmd.description && (
                                    <p className="text-sm text-neutral-500 mb-3">{cmd.description}</p>
                                )}

                                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-sm text-neutral-300 mb-3 overflow-x-auto">
                                    {cmd.command}
                                </div>

                                <button
                                    onClick={() => copyToClipboard(cmd.command)}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Command
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2">
                                <Command className="text-primary w-5 h-5" />
                                Add Quick Command
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleAddCommand} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Update System"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                                    value={newCommand.name}
                                    onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">Command</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="sudo apt update && sudo apt upgrade -y"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none font-mono text-sm"
                                    value={newCommand.command}
                                    onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">Description (optional)</label>
                                <input
                                    type="text"
                                    placeholder="Updates all system packages"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                                    value={newCommand.description}
                                    onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
