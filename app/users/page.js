'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Trash2, Shield, ChevronLeft, Loader2, Key, Check, X, ShieldCheck, ShieldOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'operator' });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [show2FAModal, setShow2FAModal] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [totpToken, setTotpToken] = useState('');
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [disable2FAUserId, setDisable2FAUserId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [allServers, setAllServers] = useState([]);
    const [showAccessModal, setShowAccessModal] = useState(null); // stores user object
    const [updatingAccess, setUpdatingAccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAccessAndFetch();
    }, []);

    const checkAccessAndFetch = async () => {
        try {
            // Check user role first
            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();

            if (!meData.success || meData.user.role !== 'admin') {
                router.push('/');
                return;
            }

            // Fetch users and servers
            const [usersRes, serversRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/servers')
            ]);

            const usersData = await usersRes.json();
            const serversData = await serversRes.json();

            if (usersData.success) {
                setUsers(usersData.data);
            }
            if (serversData.success) {
                setAllServers(serversData.data);
            }
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError('');
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setNewUser({ username: '', password: '', role: 'operator' });
                fetchUsers();
            } else {
                setError(data.message || 'Failed to add user');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setAdding(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteUserId) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/users/${deleteUserId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            } else {
                console.error(data.message);
            }
        } catch (err) {
            console.error('Delete failed');
        } finally {
            setDeleting(false);
            setDeleteUserId(null);
        }
    };

    const setup2FA = async (userId) => {
        setError('');
        try {
            const res = await fetch(`/api/users/${userId}/2fa`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setQrData(data.data);
                setShow2FAModal(userId);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('2FA setup failed');
        }
    };

    const verify2FA = async () => {
        setError('');
        try {
            const res = await fetch(`/api/users/${show2FAModal}/2fa`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: totpToken }),
            });
            const data = await res.json();
            if (data.success) {
                setShow2FAModal(null);
                setQrData(null);
                setTotpToken('');
                fetchUsers();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Verification failed');
        }
    };

    const handleUpdateAccess = async (userId, allowedServers) => {
        setUpdatingAccess(true);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allowedServers }),
            });
            const data = await res.json();
            if (data.success) {
                setShowAccessModal(null);
                fetchUsers();
            } else {
                setError(data.message || 'Failed to update access');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setUpdatingAccess(false);
        }
    };

    const confirmDisable2FA = async () => {
        if (!disable2FAUserId) return;
        try {
            const res = await fetch(`/api/users/${disable2FAUserId}/2fa`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            } else {
                console.error(data.message);
            }
        } catch (err) {
            console.error('Disable 2FA failed');
        } finally {
            setDisable2FAUserId(null);
        }
    };

    const roleColors = {
        admin: 'bg-red-500/20 text-red-400 border-red-500/30',
        operator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        viewer: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 md:px-6 bg-neutral-900/50">
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={() => router.push('/')} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center hidden sm:flex">
                            <Users className="text-primary w-5 h-5" />
                        </div>
                        <h1 className="font-semibold text-base md:text-lg">Users</h1>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm md:text-base"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Add User</span>
                </button>
            </header>

            <main className="flex-1 p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p>Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-3xl">
                        <Users className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No users configured</h3>
                        <p className="text-neutral-500 mt-2">Add users to enable role-based access control.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="text-xs text-neutral-400 uppercase bg-neutral-900/50">
                                    <tr>
                                        <th className="text-left p-4">Username</th>
                                        <th className="text-left p-4">Role</th>
                                        <th className="text-left p-4">Assigned Servers</th>
                                        <th className="text-center p-4">2FA</th>
                                        <th className="text-left p-4">Last Login</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-neutral-800 hover:bg-neutral-900/30">
                                            <td className="p-4 font-medium">{user.username}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${roleColors[user.role]}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {user.role === 'admin' ? (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 w-fit">
                                                        <Shield className="w-3 h-3 text-primary" />
                                                        All Servers
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowAccessModal(user)}
                                                        className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 hover:border-primary/50 transition-all w-fit"
                                                    >
                                                        <Shield className="w-3 h-3 text-primary" />
                                                        {user.allowedServers?.length || 0} Servers
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {user.totpEnabled ? (
                                                    <button
                                                        onClick={() => setDisable2FAUserId(user._id)}
                                                        className="inline-flex items-center gap-1 text-green-400 hover:text-red-400"
                                                        title="Click to disable"
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setup2FA(user._id)}
                                                        className="inline-flex items-center gap-1 text-neutral-500 hover:text-primary"
                                                        title="Setup 2FA"
                                                    >
                                                        <ShieldOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-4 text-neutral-500 text-sm">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => setShowAccessModal(user)}
                                                            className="p-2 text-neutral-400 hover:text-primary transition-colors"
                                                            title="Manage Server Access"
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteUserId(user._id)}
                                                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                            {users.map((user) => (
                                <div key={user._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-lg">{user.username}</div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium border uppercase tracking-wider ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-neutral-500">
                                            2FA: {user.totpEnabled ? (
                                                <span className="text-green-500 font-medium">Enabled</span>
                                            ) : (
                                                <span className="text-neutral-600">Disabled</span>
                                            )}
                                        </div>
                                        {user.role === 'admin' ? (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 rounded-lg text-[10px] text-neutral-400 border border-neutral-700 w-fit">
                                                <Shield className="w-2.5 h-2.5 text-primary" />
                                                All Servers
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 rounded-lg text-[10px] text-neutral-400 border border-neutral-700 w-fit">
                                                <Shield className="w-2.5 h-2.5 text-primary" />
                                                {user.allowedServers?.length || 0} Servers
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {user.totpEnabled ? (
                                                <button
                                                    onClick={() => setDisable2FAUserId(user._id)}
                                                    className="p-2 bg-green-500/10 text-green-400 rounded-lg"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setup2FA(user._id)}
                                                    className="p-2 bg-neutral-800 text-neutral-400 rounded-lg"
                                                >
                                                    <ShieldOff className="w-4 h-4" />
                                                </button>
                                            )}
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => setShowAccessModal(user)}
                                                    className="p-2 bg-primary/10 text-primary rounded-lg"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDeleteUserId(user._id)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-neutral-600 font-mono">
                                        Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteUserId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Delete User?</h2>
                            <p className="text-neutral-400 text-sm mb-6">
                                This action cannot be undone. The user will be permanently removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteUserId(null)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Disable 2FA Confirmation Modal */}
            {disable2FAUserId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldOff className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Disable 2FA?</h2>
                            <p className="text-neutral-400 text-sm mb-6">
                                This will remove two-factor authentication from this user account.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDisable2FAUserId(null)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDisable2FA}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <ShieldOff className="w-4 h-4" /> Disable 2FA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="font-bold">Add User</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-neutral-500">✕</button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">Username</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">Role</label>
                                <select
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="admin">Admin (Full access)</option>
                                    <option value="operator">Operator (Connect & manage servers)</option>
                                    <option value="viewer">Viewer (Read-only)</option>
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700">Cancel</button>
                                <button type="submit" disabled={adding} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl font-bold disabled:opacity-50">
                                    {adding ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FAModal && qrData && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden my-4">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2">
                                <Key className="text-primary w-5 h-5" />
                                Setup 2FA
                            </h2>
                            <button onClick={() => { setShow2FAModal(null); setQrData(null); setError(''); }} className="text-neutral-500">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-neutral-400 mb-3">Scan with Google Authenticator</p>
                                <img src={qrData.qrCode} alt="QR Code" className="mx-auto rounded-xl bg-white p-2 w-48" />
                                <p className="text-xs text-neutral-500 font-mono mt-2 break-all">Secret: {qrData.secret}</p>
                            </div>

                            {qrData.recoveryCodes && qrData.recoveryCodes.length > 0 && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                    <p className="text-sm font-bold text-yellow-400 mb-2">⚠️ Save Recovery Codes</p>
                                    <p className="text-xs text-neutral-400 mb-3">Use these one-time codes if you lose access to your authenticator app.</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {qrData.recoveryCodes.map((code, i) => (
                                            <code key={i} className="bg-neutral-950 px-2 py-1 rounded text-xs font-mono text-center">{code}</code>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code to verify"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest"
                                    value={totpToken}
                                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button
                                onClick={verify2FA}
                                disabled={totpToken.length !== 6}
                                className="w-full bg-primary text-white py-2.5 rounded-xl font-bold disabled:opacity-50"
                            >
                                Verify & Enable
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Access Modal */}
            {showAccessModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Shield className="text-primary w-6 h-6" /> Manage Access
                                </h2>
                                <p className="text-xs text-neutral-500 mt-1">Assign servers to <b>{showAccessModal.username}</b></p>
                            </div>
                            <button onClick={() => setShowAccessModal(null)} className="text-neutral-500 hover:text-white p-2">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-3">
                            {allServers.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">
                                    <ShieldOff className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p>No servers found to assign.</p>
                                </div>
                            ) : (
                                allServers.map((server) => {
                                    const isAssigned = (showAccessModal.allowedServers || []).some(id => id.toString() === server._id.toString());
                                    return (
                                        <label
                                            key={server._id}
                                            className={`
                                                flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
                                                ${isAssigned ? 'bg-primary/10 border-primary/50 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAssigned ? 'bg-primary text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{server.name}</div>
                                                    <div className="text-xs opacity-60 font-mono">{server.host}</div>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isAssigned}
                                                onChange={(e) => {
                                                    const currentAllowed = showAccessModal.allowedServers || [];
                                                    const updated = e.target.checked
                                                        ? [...currentAllowed, server._id.toString()]
                                                        : currentAllowed.filter(id => id.toString() !== server._id.toString());
                                                    setShowAccessModal({ ...showAccessModal, allowedServers: updated });
                                                }}
                                            />
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isAssigned ? 'bg-primary border-primary' : 'border-neutral-800'}`}>
                                                {isAssigned && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex gap-3">
                            <button
                                onClick={() => setShowAccessModal(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-neutral-800 hover:bg-neutral-800 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateAccess(showAccessModal._id, showAccessModal.allowedServers)}
                                disabled={updatingAccess}
                                className="flex-[2] bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary/20"
                            >
                                {updatingAccess ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
