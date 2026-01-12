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
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-1.5 md:p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <FolderOpen className="text-primary w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <h1 className="font-semibold text-sm md:text-lg whitespace-nowrap">File Manager</h1>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-medium text-neutral-500 bg-neutral-800/50 px-3 py-1.5 rounded-full border border-neutral-700">
                    <Shield className="w-3 h-3 text-green-500" />
                    Secure SFTP
                </div>
            </header>

            <main className="flex-1 p-2 md:p-4 bg-neutral-950 overflow-hidden">
                <FileManager serverId={id} />
            </main>

            <footer className="h-8 border-t border-neutral-800 bg-neutral-900/20 px-4 md:px-6 flex items-center justify-between text-[8px] md:text-[10px] text-neutral-600 font-mono tracking-wider uppercase">
                <span className="truncate mr-4">SFTP Session Active</span>
                <span className="hidden sm:inline">Server: {id}</span>
            </footer>
        </div>
    );
}
