#!/usr/bin/env bun
/**
 * Simple tmux Multiplexer Example
 * Run with: bun src/tmux-example.tsx
 */

import { render } from 'ink';
import { Multiplexer } from './Multiplexer.js';
import type { Layout } from './types/multiplexer.js';

/**
 * Simple 2-pane horizontal split with interactive shells
 */
const layout: Layout = {
  type: 'split',
  id: 'root',
  direction: 'horizontal',
  children: [
    {
      type: 'pane',
      id: 'left',
      command: 'bash',
      args: ['-i'],  // Interactive shell
      title: 'Left Shell',
      focus: true,
    },
    {
      type: 'pane',
      id: 'right',
      command: 'bash',
      args: ['-i'],  // Interactive shell
      title: 'Right Shell',
    },
  ],
};

console.log('Starting tmux multiplexer...');
console.log('Use Tab/Shift+Tab to switch panes');
console.log('Press Ctrl+Q to exit multiplexer\n');

render(<Multiplexer layout={layout} width={100} height={25} />);
