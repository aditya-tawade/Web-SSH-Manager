# Contributing to Antigravity SSH

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Configure** environment: `cp .env.example .env`
5. **Start** development: `npm run dev`

## 📋 How to Contribute

### Reporting Bugs

- Check existing issues first
- Use the bug report template
- Include steps to reproduce
- Add screenshots if applicable

### Suggesting Features

- Open an issue with the feature request template
- Describe the use case
- Explain expected behavior

### Code Contributions

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a Pull Request

## 💻 Development Guidelines

### Code Style

- Use consistent formatting
- Add comments for complex logic
- Follow existing patterns

### Commit Messages

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

### Pull Requests

- Reference related issues
- Provide clear description
- Include screenshots for UI changes
- Ensure all checks pass

## 🔧 Development Setup

```bash
# Start MongoDB (if local)
docker run -d -p 27017:27017 mongo

# Run development server
npm run dev
```

## 📁 Key Areas

| Area | Description |
|------|-------------|
| `app/` | Next.js pages and API routes |
| `components/` | React components |
| `lib/` | Utilities and helpers |
| `models/` | Database models |
| `server.js` | WebSocket server |

## ❓ Questions?

Open a discussion or issue. We're happy to help!
