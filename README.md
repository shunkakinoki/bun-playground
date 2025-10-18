# Interactive Terminal for Ink

A complete, interactive terminal component for [Ink](https://github.com/vadimdemedes/ink) applications. This library provides a `<Terminal />` component that renders terminal output with full ANSI color support and enables interactive command execution.

## Features

- ✨ **Full ANSI Support**: Colors, bold, italic, underline, and all text styling
- 🎮 **Interactive Mode**: Keyboard input support for interactive shells
- 🔄 **Serializable**: Terminal state can be serialized and deserialized
- 📦 **Headless Rendering**: Uses `@xterm/headless` for accurate ANSI parsing
- ⚡ **Streaming Output**: Efficiently streams process output through PTY
- 🎯 **TypeScript**: Fully typed with TypeScript

## Architecture

This implementation is based on reference implementations from:
- **stmux** - Terminal multiplexing for Node.js
- **blessed-xterm** - XTerm widget for Blessed
- **gemini-cli** - Google's Gemini CLI terminal handling

### Components

1. **Terminal Serializer** (`terminalSerializer.ts`)
   - Serializes `@xterm/headless` Terminal to `AnsiOutput` format
   - Parses cell attributes (bold, italic, colors, etc.)
   - Converts terminal buffer to structured data

2. **PTY Manager** (`ptyManager.ts`)
   - Dynamically detects PTY implementation (`bun-pty`, `@lydell/node-pty`, or `node-pty`)
   - Falls back to `child_process` if no PTY available
   - Streams data to headless terminal for parsing
   - Handles interactive input and resize events
   - Provides event-based API

3. **PTY Detection** (`getPty.ts`)
   - Auto-detects best available PTY implementation
   - Tries `bun-pty` first (native Bun support with Rust FFI)
   - Falls back to `@lydell/node-pty` or `node-pty` if needed
   - Returns null if no PTY available (uses `child_process`)

4. **AnsiText Component** (`AnsiText.tsx`)
   - Renders `AnsiOutput` in Ink with styling
   - Supports all text attributes and colors
   - Handles multi-line output

5. **Terminal Component** (`Terminal.tsx`)
   - Main component that orchestrates everything
   - Manages PTY lifecycle
   - Handles keyboard input for interactivity
   - Provides simple props-based API

## Installation

```bash
bun add @xterm/headless bun-pty ink react
```

**Note**: This implementation uses `bun-pty`, which is specifically built for Bun using Rust FFI. It provides full PTY functionality with proper event handling in Bun's event loop.

## Usage

### Simple Command Execution

```tsx
import { Terminal } from './src/Terminal';

<Terminal
  command="ls"
  args={['-la']}
  cols={80}
  rows={24}
  onExit={(code) => console.log('Exited:', code)}
/>
```

### Interactive Shell

```tsx
<Terminal
  command="bash"
  args={['-i']}
  cols={80}
  rows={24}
  interactive={true}
  onExit={(code) => console.log('Shell exited:', code)}
/>
```

### Custom Environment and CWD

```tsx
<Terminal
  command="node"
  args={['script.js']}
  cwd="/path/to/project"
  env={{ NODE_ENV: 'development' }}
  cols={80}
  rows={24}
/>
```

## Examples

Run the included examples:

```bash
# Simple command execution
bun src/example.tsx simple

# Interactive bash shell
bun src/example.tsx interactive

# Colored output demonstration
bun src/example.tsx colored

# Streaming output with delays
bun src/example.tsx streaming
```

## API

### `<Terminal>` Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `command` | `string` | required | Command to execute |
| `args` | `string[]` | `[]` | Command arguments |
| `cwd` | `string` | `process.cwd()` | Working directory |
| `env` | `Record<string, string>` | `process.env` | Environment variables |
| `cols` | `number` | `80` | Terminal width in columns |
| `rows` | `number` | `24` | Terminal height in rows |
| `interactive` | `boolean` | `false` | Enable keyboard input |
| `onExit` | `(code, signal?) => void` | - | Exit callback |
| `onData` | `(output) => void` | - | Data callback |

### `<AnsiText>` Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `AnsiOutput` | required | Serialized terminal output |
| `width` | `number` | - | Maximum width |
| `height` | `number` | - | Maximum height (lines) |

### `PtyManager` Class

```typescript
const ptyManager = new PtyManager(config, (event) => {
  if (event.type === 'data') {
    console.log('Output:', event.output);
  } else if (event.type === 'exit') {
    console.log('Exit code:', event.code);
  }
});

// Write to stdin
ptyManager.write('echo hello\n');

// Resize terminal
ptyManager.resize(100, 30);

// Kill process
ptyManager.kill();
```

## How It Works

1. **PTY Detection**: Dynamically detects available PTY implementation
2. **Process Spawning**: Uses PTY or falls back to `child_process`
3. **ANSI Parsing**: Process output is written to `@xterm/headless` Terminal
4. **Serialization**: Terminal buffer is serialized to `AnsiOutput` format
5. **Rendering**: Ink components render the serialized output with styling
6. **Interactivity**: Keyboard input is captured and written to process stdin

### Data Flow

```
PTY/Process → Headless Terminal → Serializer → AnsiOutput → Ink Render
     ↑                                                             |
     └──────────────── User Input (interactive) ───────────────────┘
```

### PTY Implementation Fallback

```
Try bun-pty → Try @lydell/node-pty → Try node-pty → Fall back to child_process
```

## Important Notes

### Serialization

The terminal output is **serializable** because it uses `@xterm/headless` which doesn't require a DOM. The output is converted to a plain JavaScript object (`AnsiOutput`) that can be:
- JSON serialized
- Passed between processes
- Stored in state management
- Sent over network

### Interactive Mode

When `interactive={true}`:
- Component must be focused to receive input
- Border changes color when focused (cyan when focused, gray otherwise)
- Keyboard events are captured and sent to PTY stdin
- Special keys (arrows, Ctrl+C, etc.) are properly encoded

### Performance

- Output updates are debounced at ~60fps to prevent excessive rendering
- Terminal buffer is efficiently serialized only when needed
- PTY process runs in a separate process for isolation

### Bun Compatibility

This implementation is optimized for **Bun**:
- Uses `bun-pty` which is built specifically for Bun using Rust FFI
- Provides full PTY functionality with proper event handling
- Gracefully falls back to `child_process` if PTY unavailable
- Fully tested with Bun 1.3.0+

**Why bun-pty?** Standard PTY libraries (`node-pty`, `@lydell/node-pty`) have event loop compatibility issues with Bun. `bun-pty` solves this by using Bun's native FFI capabilities.

## Credits

Implementation inspired by:
- [stmux](https://github.com/rse/stmux) - Terminal multiplexing
- [blessed-xterm](https://github.com/rse/blessed-xterm) - XTerm for Blessed
- [gemini-cli](https://github.com/google-gemini/gemini-cli) - Terminal serialization approach

## License

MIT