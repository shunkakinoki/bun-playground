#!/usr/bin/env bun
/**
 * Terminal Multiplexer (tmux clone)
 * Demonstrates the Multiplexer component with various layouts
 */

import React from 'react';
import { render } from 'ink';
import { Multiplexer } from './Multiplexer.js';
import type { Layout } from './types/multiplexer.js';

/**
 * Example 1: Simple horizontal split (2 panes side by side)
 */
const simpleHorizontal: Layout = {
  type: 'split',
  id: 'root',
  direction: 'horizontal',
  children: [
    {
      type: 'pane',
      id: 'left',
      command: 'sh',
      args: ['-c', 'echo "Left Pane\n---\n"; ls -la; echo "\n--- Done ---"'],
      title: 'Files',
      focus: true,
    },
    {
      type: 'pane',
      id: 'right',
      command: 'sh',
      args: ['-c', 'echo "Right Pane\n---\n"; date; echo ""; uname -a'],
      title: 'System Info',
    },
  ],
};

/**
 * Example 2: Simple vertical split (2 panes stacked)
 */
const simpleVertical: Layout = {
  type: 'split',
  id: 'root',
  direction: 'vertical',
  children: [
    {
      type: 'pane',
      id: 'top',
      command: 'sh',
      args: ['-c', 'echo "Top Pane"; ps aux | head -n 20'],
      title: 'Processes',
      focus: true,
    },
    {
      type: 'pane',
      id: 'bottom',
      command: 'sh',
      args: ['-c', 'echo "Bottom Pane"; df -h'],
      title: 'Disk Usage',
    },
  ],
};

/**
 * Example 3: Complex nested layout (like tmux)
 */
const complexLayout: Layout = {
  type: 'split',
  id: 'root',
  direction: 'horizontal',
  children: [
    {
      type: 'split',
      id: 'left-split',
      direction: 'vertical',
      size: '60%',
      children: [
        {
          type: 'pane',
          id: 'main',
          command: 'sh',
          args: ['-c', 'echo "Main Pane (Large)\n"; ls -la'],
          title: 'Main',
          size: '70%',
          focus: true,
        },
        {
          type: 'pane',
          id: 'bottom-left',
          command: 'sh',
          args: ['-c', 'echo "Bottom Left\n"; date; echo ""; cal'],
          title: 'Calendar',
        },
      ],
    },
    {
      type: 'split',
      id: 'right-split',
      direction: 'vertical',
      children: [
        {
          type: 'pane',
          id: 'top-right',
          command: 'sh',
          args: ['-c', 'echo "Top Right\n"; echo "System: $(uname -s)"; echo "Arch: $(uname -m)"'],
          title: 'System',
        },
        {
          type: 'pane',
          id: 'middle-right',
          command: 'sh',
          args: ['-c', 'echo "Middle Right\n"; df -h | head -n 5'],
          title: 'Disk',
        },
        {
          type: 'pane',
          id: 'bottom-right',
          command: 'sh',
          args: ['-c', 'echo "Bottom Right\n"; echo "Current directory:"; pwd'],
          title: 'Location',
        },
      ],
    },
  ],
};

/**
 * Example 4: Dashboard layout
 */
const dashboardLayout: Layout = {
  type: 'split',
  id: 'root',
  direction: 'vertical',
  children: [
    {
      type: 'pane',
      id: 'header',
      command: 'sh',
      args: ['-c', 'echo "=== System Dashboard ===\n"; date; echo "Host: $(hostname)"'],
      title: 'Header',
      size: '20%',
      focus: true,
    },
    {
      type: 'split',
      id: 'middle',
      direction: 'horizontal',
      children: [
        {
          type: 'pane',
          id: 'left-panel',
          command: 'sh',
          args: ['-c', 'echo "Files:\n"; ls -lh | head -n 15'],
          title: 'Files',
          size: '1/3',
        },
        {
          type: 'pane',
          id: 'center-panel',
          command: 'sh',
          args: ['-c', 'echo "Processes:\n"; ps aux | head -n 15'],
          title: 'Processes',
          size: '1/3',
        },
        {
          type: 'pane',
          id: 'right-panel',
          command: 'sh',
          args: ['-c', 'echo "Network:\n"; ifconfig 2>/dev/null | head -n 15 || ip addr | head -n 15'],
          title: 'Network',
        },
      ],
    },
    {
      type: 'pane',
      id: 'footer',
      command: 'sh',
      args: ['-c', 'echo "=== Footer ===\n"; echo "Ready."'],
      title: 'Status',
      size: '15%',
    },
  ],
};

/**
 * Main app - select layout based on argument
 */
const App: React.FC = () => {
  const layoutType = process.argv[2] || 'simple';

  let layout: Layout;
  let title: string;

  switch (layoutType) {
    case 'vertical':
      layout = simpleVertical;
      title = 'Simple Vertical Split';
      break;
    case 'complex':
      layout = complexLayout;
      title = 'Complex Nested Layout';
      break;
    case 'dashboard':
      layout = dashboardLayout;
      title = 'Dashboard Layout';
      break;
    case 'simple':
    default:
      layout = simpleHorizontal;
      title = 'Simple Horizontal Split';
      break;
  }

  console.log(`\nLaunching: ${title}\n`);

  return <Multiplexer layout={layout} enterFullScreen={true} />;
};

render(<App />, {
  patchConsole: false,
  exitOnCtrlC: false,
});
