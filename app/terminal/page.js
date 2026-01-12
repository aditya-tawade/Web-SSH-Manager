'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Terminal as TerminalIcon, ChevronLeft, Shield, Command, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SSHTerminal = dynamic(() => import('@/components/Terminal'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-500">Initializing Terminal...</div>
});

export default function MultiTerminalPage() {
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [servers, setServers] = useState([]);
    const [showServerPicker, setShowServerPicker] = useState(false);
    const router = useRouter();
    const tabIdCounter = useRef(1);

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
        }
    };

    const addTab = (server) => {
        const newTab = {
            id: `tab-${tabIdCounter.current++}`,
            serverId: server._id,
            serverName: server.name,
            host: server.host,
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTab(newTab.id);
        setShowServerPicker(false);
    };

    const closeTab = (tabId, e) => {
        e.stopPropagation();
        setTabs(prev => {
            const newTabs = prev.filter(t => t.id !== tabId);
            if (activeTab === tabId && newTabs.length > 0) {
                setActiveTab(newTabs[newTabs.length - 1].id);
            } else if (newTabs.length === 0) {
                setActiveTab(null);
            }
            return newTabs;
        });
    };

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="text-primary w-5 h-5" />
                        <h1 className="font-semibold">Multi-Session Terminal</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                    <Shield className="w-3 h-3 text-green-500" />
                    {tabs.length} Active Session{tabs.length !== 1 ? 's' : ''}
                </div>
            </header>

            {/* Tab Bar */}
            <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center px-2 gap-1 overflow-x-auto">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 border border-transparent'
                            }`}
                    >
                        <TerminalIcon className="w-3.5 h-3.5" />
                        <span className="max-w-[120px] truncate">{tab.serverName}</span>
                        <button
                            onClick={(e) => closeTab(tab.id, e)}
                            className="ml-1 p-0.5 hover:bg-neutral-700 rounded"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={() => setShowServerPicker(true)}
                    className="flex items-center gap-1 px-3 py-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Tab
                </button>
            </div>

            {/* Terminal Area */}
            <main className="flex-1 bg-neutral-950 relative overflow-hidden">
                {tabs.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                        <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mb-6">
                            <TerminalIcon className="w-10 h-10 text-neutral-600" />
                        </div>
                        <p className="text-lg font-medium mb-2">No active sessions</p>
                        <p className="text-sm text-neutral-600 mb-6">Click "New Tab" to connect to a server</p>
                        <button
                            onClick={() => setShowServerPicker(true)}
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Open Terminal
                        </button>
                    </div>
                ) : (
                    tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`absolute inset-0 p-2 ${activeTab === tab.id ? 'block' : 'hidden'}`}
                        >
                            <SSHTerminal serverId={tab.serverId} sessionId={tab.id} />
                        </div>
                    ))
                )}
            </main>

            {/* Server Picker Modal */}
            {showServerPicker && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2">
                                <TerminalIcon className="text-primary w-5 h-5" />
                                Select Server
                            </h2>
                            <button onClick={() => setShowServerPicker(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 max-h-80 overflow-y-auto">
                            {servers.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500">
                                    <p>No servers configured</p>
                                    <button
                                        onClick={() => { setShowServerPicker(false); router.push('/'); }}
                                        className="text-primary hover:underline mt-2"
                                    >
                                        Add a server first
                                    </button>
                                </div>
                            ) : (
                                servers.map(server => (
                                    <button
                                        key={server._id}
                                        onClick={() => addTab(server)}
                                        className="w-full p-3 text-left hover:bg-neutral-800 rounded-xl transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                                            <TerminalIcon className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{server.name}</p>
                                            <p className="text-xs text-neutral-500">{server.username}@{server.host}</p>
                                        </div>
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
