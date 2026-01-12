'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, FolderOpen, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';

const FileManager = dynamic(() => import('@/components/FileManager'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-500">Initializing File Manager...</div>
});

export default function FilesPage() {
    const { id } = useParams();
    const router = useRouter();

    return (
        <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
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
                            <FolderOpen className="text-primary w-5 h-5" />
                        </div>
                        <h1 className="font-semibold text-lg">SFTP File Manager</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 bg-neutral-800/50 px-3 py-1.5 rounded-full border border-neutral-700">
                    <Shield className="w-3 h-3 text-green-500" />
                    Secure Connection
                </div>
            </header>

            <main className="flex-1 p-4 bg-neutral-950 overflow-hidden">
                <FileManager serverId={id} />
            </main>

            <footer className="h-10 border-t border-neutral-800 bg-neutral-900/20 px-6 flex items-center text-[10px] text-neutral-600 font-mono tracking-wider uppercase">
                SFTP Session // Server ID: {id}
            </footer>
        </div>
    );
}
