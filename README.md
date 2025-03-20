# adzlanos — Web-based Desktop Environment

A modern web-based desktop environment inspired by classic Mac OS System 7, built with React and modern web technologies. Features multiple built-in applications and a familiar desktop interface. Works on all devices—including mobile, tablet, and desktop.

## Tech Stack

- React 18 with TypeScript
- Vite for blazing fast development
- TailwindCSS for styling
- shadcn/ui components
- Framer Motion for animations
- npm as package manager

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Features

### Desktop Environment

- Authentic Mac OS System 7-style window management
- Multiple resizable and draggable windows
- Desktop icons
- Window minimize/maximize controls
- Menu bar with Apple menu
- Local storage persistence

### Built-in Applications

- **Finder**: File system navigation with Documents and Applications folders
- **TextEdit**: Plain text editing with save/open functionality
- **Minesweeper**: Classic game implementation with medium difficulty

## Core Features

- Window management system with z-index handling
- Application state management
- Local storage persistence
- File system with Documents and Applications
- System-wide UI elements

## Project Structure

```
project/
├── src/
│   ├── apps/           # Individual applications
│   │   ├── finder/     # File system app
│   │   ├── textedit/   # Text editor app
│   │   └── minesweeper/# Game implementation
│   ├── components/     # Shared React components
│   │   ├── layout/     # Core layout components
│   │   ├── ui/         # shadcn/ui components
│   │   └── windows/    # Window management
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Shared utilities
├── public/             # Static assets
└── ...config files
```

## Development

The project uses:

- TypeScript for type safety
- ESLint for code quality
- Tailwind for utility-first CSS
- shadcn/ui components built on Radix UI primitives

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
