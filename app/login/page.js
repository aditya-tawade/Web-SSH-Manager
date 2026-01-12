'use client';

import { useState } from 'react';
import { Terminal, Loader2, Shield, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [formData, setFormData] = useState({ username: '', password: '', totpToken: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [requires2FA, setRequires2FA] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.requires2FA) {
                setRequires2FA(true);
                setLoading(false);
                return;
            }

            if (data.success) {
                router.push('/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                        <Terminal className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">UnifiedSSH</h1>
                    <p className="text-neutral-400">Secure Server Management</p>
                </div>

                {/* Login Form */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-neutral-400 block mb-2">Username</label>
                            <input
                                required
                                type="text"
                                placeholder="Enter username"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-400 block mb-2">Password</label>
                            <input
                                required
                                type="password"
                                placeholder="Enter password"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {requires2FA && (
                            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                                <label className="text-sm font-medium text-primary flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4" />
                                    Two-Factor Authentication
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-center font-mono text-lg tracking-widest"
                                    value={formData.totpToken}
                                    onChange={(e) => setFormData({ ...formData, totpToken: e.target.value })}
                                    maxLength={6}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                            ) : requires2FA ? (
                                <><Shield className="w-5 h-5" /> Verify & Sign In</>
                            ) : (
                                <><Key className="w-5 h-5" /> Sign In</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-neutral-600 text-sm mt-8">
                    Secure • Encrypted • Open Source
                </p>
            </div>
        </div>
    );
}
