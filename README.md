# UnifiedSSH

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/MongoDB-Ready-green?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</div>

<br />

A **secure, web-based SSH management system** that lets you connect to remote servers directly from your browser. Built with modern technologies and designed for self-hosting.

## ✨ Features

- 🔐 **Role-Based Access** - Admin, Operator, and Viewer roles
- 🛡️ **Two-Factor Authentication** - TOTP-based 2FA with Google Authenticator
- 🖥️ **Multi-Tab Terminal** - Multiple SSH sessions in tabs
- 🔒 **Encrypted Storage** - AES-256 encryption for SSH private keys
- 📂 **SFTP File Manager** - Browse, upload, download files
- ⚡ **Quick Commands** - Save and execute frequently-used commands
- 📊 **Audit Logs** - Track who connected to which server and when
- 🔍 **Search & Shortcuts** - Find servers fast with keyboard shortcuts
- 🐳 **Docker Ready** - One-command deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/aditya-tawade/Web-SSH-Manager.git
cd Web-SSH-Manager

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Start development server
npm run dev
```

### First-Time Setup

1. Visit `http://localhost:3000`
2. You'll be redirected to the **Setup Wizard**
3. Create your admin account
4. Log in and start managing servers!

### Enable 2FA (Optional but Recommended)

1. Go to **User Management** in the sidebar
2. Click the shield icon next to your user
3. Scan the QR code with Google Authenticator
4. Enter the 6-digit code to verify

## ⚙️ Configuration

Create a `.env` file based on `.env.example`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ssh-server

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_here_change_this

# Encryption Key (exactly 32 characters for AES-256)
ENCRYPTION_KEY=12345678901234567890123456789012
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management + 2FA
│   │   ├── servers/       # Server CRUD + ping
│   │   ├── commands/      # Quick commands
│   │   ├── groups/        # Server groups
│   │   ├── audit/         # Audit logs
│   │   └── setup/         # First-time setup
│   ├── login/             # Login page
│   ├── setup/             # Setup wizard
│   ├── terminal/          # Multi-tab terminal
│   ├── commands/          # Quick commands page
│   ├── users/             # User management
│   ├── audit/             # Audit logs viewer
│   └── files/             # SFTP file manager
├── components/            # React components
├── lib/                   # Utilities
├── models/                # Mongoose models
└── server.js              # WebSocket server
```

## 🔒 Security Features

| Feature | Description |
|---------|-------------|
| **2FA** | TOTP-based two-factor authentication |
| **RBAC** | Role-based access control (admin/operator/viewer) |
| **Encrypted Keys** | AES-256 encryption for SSH private keys |
| **Audit Logs** | Track all user activities |
| **Secure Sessions** | JWT tokens in HTTP-only cookies |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + K` | Focus search |
| `⌘/Ctrl + N` | Add new server |
| `⌘/Ctrl + H` | Toggle history |
| `Escape` | Close modals |

## 🔑 2FA Recovery

If you lose access to your authenticator app, you have two recovery options:

### Option 1: Recovery Codes

When you enable 2FA, 10 one-time recovery codes are generated. Save these somewhere safe!

- At login, enter a recovery code instead of the 6-digit TOTP token
- Format: `XXXX-XXXX` (e.g., `A1B2-C3D4`)
- Each code can only be used once

### Option 2: CLI Reset Script (Server Access Required)

If you have server access, run this command to disable 2FA:

```bash
node scripts/reset-2fa.js <username>

# Example:
node scripts/reset-2fa.js admin
```

This will disable 2FA for the user. They can log in with just their password and re-enable 2FA.

### Option 3: Direct Database Access

Connect to MongoDB and run:

```javascript
db.users.updateOne(
  { username: "admin" },
  { $set: { totpEnabled: false, totpSecret: null, recoveryCodes: [] } }
)
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [ssh2](https://github.com/mscdex/ssh2) - SSH client
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [otplib](https://github.com/yeojz/otplib) - TOTP authentication
