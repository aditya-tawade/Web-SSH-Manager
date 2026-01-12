# Antigravity SSH

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/MongoDB-Ready-green?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</div>

<br />

A **secure, web-based SSH management system** that lets you connect to remote servers directly from your browser. Built with modern technologies and designed for self-hosting.

## ✨ Features

- 🔐 **Secure Authentication** - ENV-based login with JWT tokens
- 🖥️ **Browser Terminal** - Full xterm.js terminal with WebSocket streaming  
- 🔒 **Encrypted Storage** - AES-256 encryption for SSH private keys
- ✅ **Connection Validation** - Verify SSH credentials before saving
- 🎨 **Modern UI** - Dark-themed dashboard with smooth animations
- 🐳 **Docker Ready** - One-command deployment with Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- Docker & Docker Compose (optional)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/antigravity-ssh.git
cd antigravity-ssh

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

### Docker Deployment

```bash
# Configure environment
cp .env.example .env

# Start with Docker Compose
docker-compose up --build
```

## ⚙️ Configuration

Create a `.env` file based on `.env.example`:

```env
# Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_here

# Database
MONGODB_URI=mongodb://localhost:27017/ssh-server

# Encryption (32 characters for AES-256)
ENCRYPTION_KEY=your_32_character_encryption_key
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── servers/       # Server CRUD endpoints
│   ├── login/             # Login page
│   └── terminal/          # Terminal page
├── components/            # React components
├── lib/                   # Utilities (db, encryption)
├── models/                # Mongoose models
├── server.js              # Custom server with WebSocket
├── Dockerfile             # Docker configuration
└── docker-compose.yml     # Docker Compose setup
```

## 🔒 Security

- Private keys are **AES-256 encrypted** before storage
- Keys are **never exposed** to the frontend after saving
- JWT tokens stored in **HTTP-only cookies**
- All routes protected via middleware

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
- [Lucide](https://lucide.dev/) - Icons
