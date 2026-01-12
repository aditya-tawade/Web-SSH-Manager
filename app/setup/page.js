'use client';

import { useState } from 'react';
import { Terminal, Shield, User, Key, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setStep(3);
            } else {
                setError(data.message || 'Setup failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                        <Terminal className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Welcome to UnifiedSSH</h1>
                    <p className="text-neutral-400">Let's set up your secure SSH management system</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-neutral-800'
                                }`}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center">
                        <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-4">First-Time Setup</h2>
                        <p className="text-neutral-400 mb-8">
                            No administrator account found. Let's create one to secure your dashboard.
                        </p>
                        <button
                            onClick={() => setStep(2)}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                        <h2 className="text-2xl font-bold mb-2 text-center">Create Admin Account</h2>
                        <p className="text-neutral-400 text-center mb-8">
                            This will be your primary login for the dashboard
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Username
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="admin"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">
                                    <Key className="w-4 h-4 inline mr-2" />
                                    Password
                                </label>
                                <input
                                    required
                                    type="password"
                                    placeholder="At least 8 characters"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">
                                    <Key className="w-4 h-4 inline mr-2" />
                                    Confirm Password
                                </label>
                                <input
                                    required
                                    type="password"
                                    placeholder="Re-enter password"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>

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
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
                                ) : (
                                    <><Shield className="w-5 h-5" /> Create Admin Account</>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Setup Complete!</h2>
                        <p className="text-neutral-400 mb-8">
                            Your admin account has been created. You can now log in and start managing your servers.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all"
                        >
                            Go to Login
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-neutral-600 text-sm mt-8">
                    UnifiedSSH • Secure Server Management
                </p>
            </div>
        </div>
    );
}
