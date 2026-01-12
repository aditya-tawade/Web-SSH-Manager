import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Antigravity SSH - Secure Server Management',
    description: 'Manage and connect to your servers securely via browser terminal.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
