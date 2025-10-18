#!/usr/bin/env bun
import React from 'react';
import { render, Box, Text } from 'ink';
import { Multiplexer } from './Multiplexer.js';
import type { Layout } from './types/multiplexer.js';

const layout: Layout = {
  type: 'pane',
  id: 'debug',
  command: 'echo',
  args: ['Hello from tmux!'],
  title: 'Debug Test',
  focus: true,
};

console.log('Starting tmux with echo command...');
render(<Multiplexer layout={layout} width={60} height={15} />);
