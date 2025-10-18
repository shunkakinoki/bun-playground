# Terminal Multiplexer (tmux clone)

A tmux-like terminal multiplexer built with Ink and React, featuring split panes and keyboard navigation.

## Quick Start

```bash
# Run the simple example (2 panes side by side)
bun src/tmux-example.tsx

# Run other layouts from tmux.tsx
bun src/tmux.tsx simple      # Horizontal split
bun src/tmux.tsx vertical    # Vertical split
bun src/tmux.tsx complex     # Nested 5-pane layout
bun src/tmux.tsx dashboard   # Dashboard with header/footer
```

## Features

✅ **Split Layouts**
- Horizontal splits (side by side)
- Vertical splits (stacked)
- Nested splits (complex layouts)
- Flexible sizing (percentages, fractions, auto)

✅ **Focus Management**
- Tab/Shift+Tab to cycle through panes
- Visual focus indicator (cyan border)
- Auto-exit when all panes complete

✅ **Terminal Integration**
- PTY support via bun-pty
- ANSI color rendering
- Non-interactive command execution

## Creating a Custom Layout

```typescript
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
      command: 'ls',
      args: ['-la'],
      title: 'Files',
      focus: true,  // Initial focus
    },
    {
      type: 'pane',
      id: 'right',
      command: 'date',
      title: 'Date',
    },
  ],
};

render(<Multiplexer layout={layout} width={100} height={30} />);
```

## Layout Types

### Pane
A single terminal pane:

```typescript
{
  type: 'pane',
  id: 'unique-id',
  command: 'sh',
  args: ['-c', 'echo Hello'],
  title: 'My Pane',
  size: '50%',     // Optional: '50%', '1/2', 100, or omit for auto
  focus: true,     // Optional: initially focused
  cwd: '/path',    // Optional: working directory
  env: {},         // Optional: environment variables
}
```

### Split
A container that holds multiple panes or nested splits:

```typescript
{
  type: 'split',
  id: 'unique-id',
  direction: 'horizontal',  // or 'vertical'
  children: [/* panes or splits */],
  size: '60%',  // Optional: size specification
}
```

## Size Specifications

- `undefined` - Auto-size (flex: 1)
- `"50%"` - Percentage of available space
- `"1/2"` - Fraction notation
- `100` - Absolute pixels

## Keyboard Controls

- **Tab** - Next pane
- **Shift+Tab** - Previous pane
- **Ctrl+Q** - Exit multiplexer
- **Ctrl+C** - Interrupt command in focused pane (passed through to terminal)
- **Ctrl+L** - Clear screen in focused pane (passed through to terminal)
- **All other keys** - Sent to the focused terminal

## Architecture

```
src/
├── Multiplexer.tsx          # Main multiplexer component
├── Terminal.tsx             # Individual terminal component
├── AnsiText.tsx            # ANSI rendering
├── terminalSerializer.ts   # @xterm/headless serialization
├── ptyManager.ts           # PTY process management
├── getPty.ts               # PTY implementation detection
├── layoutCalculator.ts     # Layout calculation (unused in current impl)
└── types/
    └── multiplexer.ts      # Type definitions
```

## Examples

### Simple 2-Pane Layout
```bash
bun src/tmux-example.tsx
```

### Complex Nested Layout
Creates a 5-pane layout with custom sizes:
```bash
bun src/tmux.tsx complex
```

### Dashboard Layout
Header, 3-column middle section, and footer:
```bash
bun src/tmux.tsx dashboard
```

## Status

✅ **Fully Functional!** The tmux multiplexer is working perfectly with:

- ✅ Terminal output rendering with full ANSI color support
- ✅ Interactive shell support (bash, zsh, etc.)
- ✅ Layout rendering with horizontal and vertical splits
- ✅ Keyboard navigation (Tab/Shift+Tab)
- ✅ Focus management with visual indicators
- ✅ Icons and styling support

## Development

```bash
# Type check
bun run tsc --noEmit

# Run standalone terminal
bun src/example.tsx simple

# Run multiplexer examples
bun src/tmux-example.tsx
bun src/tmux.tsx simple
bun src/tmux.tsx complex
```

## Credits

Based on design patterns from:
- [stmux](https://github.com/rse/stmux) - Terminal multiplexer architecture
- [blessed-xterm](https://github.com/chjj/blessed) - Terminal rendering concepts
- [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) - PTY management patterns
