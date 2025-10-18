/**
 * Terminal Multiplexer Component
 * A tmux-like terminal multiplexer for Ink
 * Based on stmux design
 */

import React, { useState } from 'react';
import { Box, useInput, useApp, Text } from 'ink';
import { Terminal } from './Terminal.js';
import type { Layout, Pane, Split } from './types/multiplexer.js';

export interface MultiplexerProps {
  /** Layout configuration */
  layout: Layout;
  /** Terminal width */
  width?: number;
  /** Terminal height */
  height?: number;
  /** Show help text */
  showHelp?: boolean;
}

/**
 * Parse size specification for flexbox
 */
function parseFlexSize(size: string | number | undefined, totalSize: number): number {
  if (size === undefined) return 1; // Auto size (flex: 1)

  if (typeof size === 'number') {
    return Math.max(3, Math.min(size, totalSize));
  }

  // Percentage: "50%"
  const percentMatch = size.match(/^(\d+)%$/);
  if (percentMatch && percentMatch[1]) {
    const percent = parseInt(percentMatch[1], 10);
    return Math.floor(totalSize * (percent / 100));
  }

  // Fraction: "1/2"
  const fractionMatch = size.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch && fractionMatch[1] && fractionMatch[2]) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    return Math.floor(totalSize * (numerator / denominator));
  }

  return 1; // Default to flex: 1
}

/**
 * Get all panes from layout tree
 */
function getAllPanes(layout: Layout): Pane[] {
  const panes: Pane[] = [];

  function traverse(node: Layout) {
    if (node.type === 'pane') {
      panes.push(node);
    } else {
      node.children.forEach(traverse);
    }
  }

  traverse(layout);
  return panes;
}

/**
 * Terminal Multiplexer Component
 *
 * Keyboard shortcuts:
 * - Tab / Shift+Tab: Navigate between panes
 * - Ctrl+Q: Exit multiplexer
 * - Ctrl+C, Ctrl+L, etc: Passed through to focused terminal
 *
 * @example
 * ```tsx
 * const layout: Layout = {
 *   type: 'split',
 *   id: 'root',
 *   direction: 'horizontal',
 *   children: [
 *     { type: 'pane', id: 'left', command: 'htop', focus: true },
 *     { type: 'pane', id: 'right', command: 'bash' }
 *   ]
 * };
 *
 * <Multiplexer layout={layout} width={100} height={30} />
 * ```
 */
export const Multiplexer: React.FC<MultiplexerProps> = ({
  layout,
  width = 100,
  height = 30,
  showHelp = true,
}) => {
  const { exit } = useApp();

  // Get all panes for focus management
  const allPanes = getAllPanes(layout);
  const initialFocusIndex = allPanes.findIndex(p => p.focus === true);

  // Focus management
  const [focusedId, setFocusedId] = useState<string>(() => {
    if (initialFocusIndex >= 0) {
      const pane = allPanes[initialFocusIndex];
      return pane ? pane.id : (allPanes[0]?.id ?? '');
    }
    return allPanes[0]?.id ?? '';
  });
  const [exitedPanes, setExitedPanes] = useState<Set<string>>(new Set());

  // Handle keyboard navigation (only if stdin supports it)
  useInput((input, key) => {
    // Exit multiplexer on Ctrl+Q
    if (key.ctrl && input === 'q') {
      exit();
      return;
    }

    // Tab navigation (consume these events)
    if (key.tab && !key.shift) {
      const currentIndex = allPanes.findIndex(p => p.id === focusedId);
      const nextIndex = (currentIndex + 1) % allPanes.length;
      const nextPane = allPanes[nextIndex];
      if (nextPane) setFocusedId(nextPane.id);
      return;
    }

    if (key.tab && key.shift) {
      const currentIndex = allPanes.findIndex(p => p.id === focusedId);
      const prevIndex = (currentIndex - 1 + allPanes.length) % allPanes.length;
      const prevPane = allPanes[prevIndex];
      if (prevPane) setFocusedId(prevPane.id);
      return;
    }

    // All other keys (including Ctrl+C, Ctrl+L, etc.) are passed through to the focused terminal
    // The terminal's useInput handler will handle them
  }, { isActive: process.stdin.isTTY });

  // Handle pane exit
  const handlePaneExit = (paneId: string, _code: number) => {
    setExitedPanes(prev => new Set(prev).add(paneId));

    // If all panes have exited, exit the multiplexer
    if (exitedPanes.size + 1 >= allPanes.length) {
      exit();
    }
  };

  // Recursively render layout
  const renderLayout = (node: Layout, availableWidth: number, availableHeight: number, depth: number = 0): React.ReactNode => {
    if (node.type === 'pane') {
      const pane = node as Pane;
      const isFocused = pane.id === focusedId;
      const hasExited = exitedPanes.has(pane.id);

      // Calculate terminal dimensions (accounting for borders and title)
      // The border takes 2 chars (left + right), title takes 1 row
      const terminalCols = Math.max(10, availableWidth - 2);
      const terminalRows = Math.max(3, availableHeight - (pane.title ? 2 : 1));

      return (
        <Box
          key={pane.id}
          width={typeof pane.size === 'number' ? parseFlexSize(pane.size, availableWidth) : undefined}
          flexGrow={typeof pane.size === 'string' || pane.size === undefined ? 1 : 0}
          flexShrink={0}
          borderStyle="single"
          borderColor={isFocused ? 'cyan' : hasExited ? 'gray' : 'white'}
          flexDirection="column"
        >
          {/* Title bar */}
          {pane.title && (
            <Box>
              <Text
                bold={isFocused}
                color={isFocused ? 'cyan' : 'white'}
              >
                {pane.title}
              </Text>
            </Box>
          )}

          {/* Terminal */}
          <Terminal
            command={pane.command}
            args={pane.args}
            cwd={pane.cwd}
            env={pane.env}
            cols={terminalCols}
            rows={terminalRows}
            interactive={pane.interactive ?? true}  // Default to interactive for tmux panes
            focused={isFocused}  // Pass focus state to terminal
            onExit={(code) => {
              if (process.env.DEBUG_MUX) {
                console.error(`[MUX] Pane ${pane.id} exited with code ${code}`);
              }
              handlePaneExit(pane.id, code);
            }}
            onData={(output) => {
              if (process.env.DEBUG_MUX) {
                console.error(`[MUX] Pane ${pane.id} got ${output.length} lines`);
                const firstLine = output[0];
                const firstToken = firstLine?.[0];
                if (output.length > 0 && firstToken) {
                  console.error(`[MUX] First token: "${firstToken.text.substring(0, 50)}"`);
                }
              }
            }}
          />
        </Box>
      );
    } else {
      const split = node as Split;

      // Calculate dimensions for child nodes
      const childCount = split.children.length || 1;
      const childWidth = split.direction === 'horizontal'
        ? Math.floor(availableWidth / childCount)
        : availableWidth;
      const childHeight = split.direction === 'vertical'
        ? Math.floor(availableHeight / childCount)
        : availableHeight;

      return (
        <Box
          key={split.id}
          flexDirection={split.direction === 'horizontal' ? 'row' : 'column'}
          width={typeof split.size === 'number' ? parseFlexSize(split.size, availableWidth) : undefined}
          height={typeof split.size === 'number' ? parseFlexSize(split.size, availableHeight) : undefined}
          flexGrow={typeof split.size === 'string' || split.size === undefined ? 1 : 0}
          flexShrink={0}
        >
          {split.children.map(child => renderLayout(child, childWidth, childHeight, depth + 1))}
        </Box>
      );
    }
  };

  const contentHeight = showHelp ? height - 2 : height;

  return (
    <Box flexDirection="column">
      {/* Layout */}
      <Box width={width} height={contentHeight}>
        {renderLayout(layout, width, contentHeight)}
      </Box>

      {/* Help text */}
      {showHelp && (
        <Box marginTop={1}>
          <Text dimColor>
            Tab/Shift+Tab: Switch panes | Ctrl+Q: Exit multiplexer
          </Text>
        </Box>
      )}
    </Box>
  );
};
