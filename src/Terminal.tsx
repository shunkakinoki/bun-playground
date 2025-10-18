import React, { useEffect, useState, useRef } from 'react';
import { Box, useInput, useFocus } from 'ink';
import { PtyManager, type PtyConfig } from './ptyManager.js';
import { AnsiText } from './AnsiText.js';
import type { AnsiOutput } from './terminalSerializer.js';

/**
 * Props for Terminal component
 */
export interface TerminalProps {
  /** Command to execute */
  command: string;
  /** Command arguments */
  args?: string[];
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Terminal width in columns */
  cols?: number;
  /** Terminal height in rows */
  rows?: number;
  /** Enable interactive mode (allows user input) */
  interactive?: boolean;
  /** Callback when process exits */
  onExit?: (code: number, signal?: number) => void;
  /** Callback when data is received */
  onData?: (output: AnsiOutput) => void;
}

/**
 * Interactive Terminal component for Ink
 *
 * Renders an interactive terminal that:
 * - Spawns a PTY process
 * - Parses ANSI escape codes using @xterm/headless
 * - Renders styled output in Ink
 * - Supports interactive input when focused
 *
 * Implementation details:
 * - Uses node-pty to spawn and manage the process
 * - Uses @xterm/headless to parse ANSI codes (serializable)
 * - Streams output through a separate process
 * - Supports keyboard input in interactive mode
 *
 * @example
 * ```tsx
 * <Terminal
 *   command="bash"
 *   args={['-c', 'ls -la']}
 *   cols={80}
 *   rows={24}
 *   interactive={true}
 *   onExit={(code) => console.log('Exited with code:', code)}
 * />
 * ```
 */
export const Terminal: React.FC<TerminalProps> = ({
  command,
  args = [],
  cwd,
  env,
  cols = 80,
  rows = 24,
  interactive = false,
  onExit,
  onData,
}) => {
  const [output, setOutput] = useState<AnsiOutput>([]);
  const [exited, setExited] = useState(false);
  const ptyManagerRef = useRef<PtyManager | null>(null);
  const { isFocused } = useFocus({ autoFocus: interactive });

  // Initialize PTY manager
  useEffect(() => {
    let mounted = true;

    const config: PtyConfig = {
      command,
      args,
      cwd,
      env,
      cols,
      rows,
    };

    // Create PTY manager asynchronously
    PtyManager.create(config, (event) => {
      if (!mounted) return;

      if (event.type === 'data') {
        setOutput(event.output);
        onData?.(event.output);
      } else if (event.type === 'exit') {
        setExited(true);
        onExit?.(event.code, event.signal);
      }
    }).then((ptyManager) => {
      if (mounted) {
        ptyManagerRef.current = ptyManager;
      } else {
        // Component was unmounted before PTY was created
        ptyManager.dispose();
      }
    }).catch((error) => {
      console.error('Failed to create PTY manager:', error);
    });

    // Cleanup on unmount
    return () => {
      mounted = false;
      ptyManagerRef.current?.dispose();
    };
  }, [command, JSON.stringify(args), cwd, JSON.stringify(env), cols, rows]);

  // Handle terminal resize
  useEffect(() => {
    ptyManagerRef.current?.resize(cols, rows);
  }, [cols, rows]);

  // Handle keyboard input in interactive mode
  useInput(
    (input, key) => {
      if (!interactive || !isFocused || exited) return;

      const ptyManager = ptyManagerRef.current;
      if (!ptyManager) return;

      // Handle special keys
      if (key.return) {
        ptyManager.write('\r');
      } else if (key.backspace || key.delete) {
        ptyManager.write('\x7f');
      } else if (key.escape) {
        ptyManager.write('\x1b');
      } else if (key.tab) {
        ptyManager.write('\t');
      } else if (key.upArrow) {
        ptyManager.write('\x1b[A');
      } else if (key.downArrow) {
        ptyManager.write('\x1b[B');
      } else if (key.rightArrow) {
        ptyManager.write('\x1b[C');
      } else if (key.leftArrow) {
        ptyManager.write('\x1b[D');
      } else if (key.ctrl && input === 'c') {
        ptyManager.write('\x03'); // Ctrl+C
      } else if (key.ctrl && input === 'd') {
        ptyManager.write('\x04'); // Ctrl+D
      } else if (key.ctrl && input === 'z') {
        ptyManager.write('\x1a'); // Ctrl+Z
      } else if (input) {
        // Regular character input
        ptyManager.write(input);
      }
    },
    { isActive: interactive && isFocused && !exited }
  );

  return (
    <Box
      flexDirection="column"
      borderStyle={interactive ? 'round' : undefined}
      borderColor={isFocused ? 'cyan' : 'gray'}
      paddingX={interactive ? 1 : 0}
    >
      <AnsiText output={output} width={cols} height={rows} />
    </Box>
  );
};
