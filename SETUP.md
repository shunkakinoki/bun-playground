# Project Setup & Objectives

## Project Overview

This project implements a **tmux-like terminal multiplexer** for Ink (React CLI framework). It allows running multiple terminal sessions in split panes with keyboard navigation, similar to tmux or GNU Screen.

## Objectives

### Primary Goal
Build a fully functional terminal multiplexer that:
- Displays multiple terminal panes with split layouts (horizontal/vertical)
- Supports interactive shells (bash, zsh, etc.)
- Renders ANSI escape codes with full color support
- Provides keyboard navigation between panes
- Passes all keyboard input (including control sequences) to focused terminals

### Current Status: ✅ Complete

All objectives achieved:
- ✅ Split pane layouts (horizontal and vertical)
- ✅ Nested splits for complex layouts
- ✅ Interactive terminal support with PTY
- ✅ Full ANSI color rendering
- ✅ Keyboard focus management
- ✅ Control sequence support (Ctrl+C, Ctrl+L, etc.)
- ✅ Visual focus indicators
- ✅ Auto-exit when all panes complete

## Architecture

### Core Components

```
src/
├── Multiplexer.tsx          # Main multiplexer with layout & focus management
├── Terminal.tsx             # Individual terminal component with PTY
├── AnsiText.tsx            # ANSI rendering for colored output
├── terminalSerializer.ts   # @xterm/headless serialization
├── ptyManager.ts           # PTY process lifecycle management
├── getPty.ts               # PTY implementation detection (bun-pty)
├── layoutCalculator.ts     # Layout calculation utilities
└── types/
    └── multiplexer.ts      # TypeScript type definitions
```

### Technology Stack

- **Ink** - React for CLIs
- **React** - Component architecture
- **@xterm/headless** - Terminal emulation & ANSI parsing
- **bun-pty** - PTY (pseudo-terminal) support for Bun
- **Bun** - Runtime and bundler

### Key Design Decisions

1. **Flexbox Layout** - Uses Ink's Box flexbox instead of absolute positioning
2. **Recursive Rendering** - Layout tree traversal for nested splits
3. **Focus Management** - Explicit `focused` prop passed to terminals
4. **Control Key Passthrough** - Ctrl+A-Z passed to focused terminal, except Ctrl+Q (exit)
5. **Interactive by Default** - Terminals default to interactive mode in multiplexer

## Implementation Details

### Input Flow

```
User Keyboard Input
  ↓
Multiplexer useInput (Tab/Shift+Tab/Ctrl+Q only)
  ↓ (all other keys)
Terminal useInput (only if focused=true)
  ↓
PTY Manager
  ↓
Spawned Process
```

### Focus System

- **Multiplexer** manages focus state via `focusedId` string
- **Tab/Shift+Tab** cycles through panes
- **Terminal** receives `focused` prop to enable/disable input
- **Visual indicator** - Cyan border on focused pane

### ANSI Rendering Pipeline

```
PTY Output
  ↓
@xterm/headless Terminal (parseAnsi)
  ↓
terminalSerializer (serialize buffer)
  ↓
AnsiOutput (structured tokens with styles)
  ↓
AnsiText component
  ↓
Ink Text components with colors/styles
```

## Usage

### Quick Start

```bash
# Simple 2-pane horizontal split
bun src/tmux-example.tsx

# Pre-configured layouts
bun src/tmux.tsx simple      # Horizontal split
bun src/tmux.tsx vertical    # Vertical split
bun src/tmux.tsx complex     # 5-pane nested layout
bun src/tmux.tsx dashboard   # Header + columns + footer
```

### Creating Custom Layouts

```typescript
import { render } from 'ink';
import { Multiplexer } from './Multiplexer.js';
import type { Layout } from './types/multiplexer.js';

const layout: Layout = {
  type: 'split',
  id: 'root',
  direction: 'horizontal',  // or 'vertical'
  children: [
    {
      type: 'pane',
      id: 'left',
      command: 'bash',
      args: ['-i'],
      title: 'Left Shell',
      focus: true,  // Initially focused
    },
    {
      type: 'pane',
      id: 'right',
      command: 'htop',
      title: 'System Monitor',
    },
  ],
};

render(<Multiplexer layout={layout} width={120} height={30} />);
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| **Tab** | Focus next pane |
| **Shift+Tab** | Focus previous pane |
| **Ctrl+Q** | Exit multiplexer |
| **Ctrl+C** | Interrupt command in focused pane |
| **Ctrl+L** | Clear screen in focused pane |
| **Ctrl+D** | EOF/logout in focused pane |
| **All other keys** | Sent to focused terminal |

## Recent Updates

### Latest Changes (2025-10-18)

1. **Full Control Sequence Support**
   - Added comprehensive Ctrl+A through Ctrl+Z mapping
   - Control sequences (Ctrl+L, Ctrl+C, etc.) now work in terminals

2. **Focus Management Improvements**
   - Added explicit `focused` prop to Terminal component
   - Multiplexer passes focus state to each terminal
   - Only focused terminal receives keyboard input

3. **Exit Key Change**
   - Changed from Ctrl+C to Ctrl+Q to exit multiplexer
   - Allows Ctrl+C to work normally in terminals (interrupt commands)

4. **Interactive Mode Default**
   - Terminals in multiplexer default to `interactive={true}`
   - Consistent with tmux behavior

## Development

### Type Checking

```bash
bun run tsc --noEmit
```

### Testing

```bash
# Standalone terminal (no multiplexer)
bun src/example.tsx simple
bun src/example.tsx colored

# Multiplexer tests
bun src/tmux-example.tsx
bun src/tmux.tsx complex

# Debug mode
DEBUG_TERM=1 bun src/tmux-example.tsx
DEBUG_MUX=1 bun src/tmux-example.tsx
```

### PTY Configuration

Currently using **bun-pty** (Rust FFI-based PTY for Bun):

```typescript
// src/getPty.ts
export const getPty = async (): Promise<PtyImplementation> => {
  try {
    const bunPty = 'bun-pty';
    const module = await import(bunPty);
    return { module, name: 'bun-pty' };
  } catch (_e) {
    // Fallback to other implementations
    return null;
  }
};
```

## Troubleshooting

### Common Issues

1. **Terminal output not displaying**
   - Ensure `interactive={true}` for shell panes
   - Check `focused` prop is being passed correctly
   - Verify PTY is spawning (use `DEBUG_TERM=1`)

2. **Keyboard input not working**
   - Ensure terminal has `interactive={true}`
   - Check `focused={true}` for the active pane
   - Verify `useInput` is active (`process.stdin.isTTY`)

3. **Control sequences not working**
   - Update to latest Terminal.tsx with full ctrlMap
   - Ensure Multiplexer doesn't consume the key event
   - Check terminal is focused

## References

### Inspiration & Patterns

- **stmux** - Terminal multiplexer architecture
- **tmux** - Split pane UX and keyboard shortcuts
- **blessed-xterm** - Terminal rendering concepts
- **Google Gemini CLI** - PTY management patterns

### Documentation

- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [@xterm/headless](https://github.com/xtermjs/xterm.js)
- [bun-pty](https://github.com/huseeiin/bun-pty)
- [PTY Specification](https://en.wikipedia.org/wiki/Pseudoterminal)

## Future Enhancements (Optional)

Potential features to add:

- **Pane resizing** - Drag borders to resize
- **Scrollback buffer** - Terminal history scrolling
- **Pane zoom** - Maximize/restore single pane
- **Session persistence** - Save/restore layouts
- **Mouse support** - Click to focus panes
- **Custom themes** - Configurable colors
- **Status bar** - Show pane info/stats
- **Command palette** - Quick actions menu

## Project Structure

```
bun-playground/
├── src/
│   ├── Multiplexer.tsx       # Main multiplexer component
│   ├── Terminal.tsx          # Terminal with PTY support
│   ├── AnsiText.tsx         # ANSI color rendering
│   ├── terminalSerializer.ts # Terminal serialization
│   ├── ptyManager.ts        # PTY lifecycle
│   ├── getPty.ts            # PTY implementation
│   ├── layoutCalculator.ts # Layout utilities
│   ├── tmux-example.tsx     # Simple example
│   ├── tmux.tsx             # Multiple layouts
│   ├── example.tsx          # Standalone terminal demo
│   └── types/
│       └── multiplexer.ts   # Type definitions
├── TMUX.md                  # User documentation
├── SETUP.md                 # This file
├── CLAUDE.md                # Bun-specific instructions
├── package.json
└── tsconfig.json
```

## Contact & Contribution

For issues, improvements, or questions about this implementation, refer to the conversation history or codebase documentation.

---

**Last Updated**: 2025-10-18
**Status**: Production-ready
**Version**: 1.0.0
