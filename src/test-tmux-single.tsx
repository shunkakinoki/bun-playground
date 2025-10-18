#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import { Multiplexer } from './Multiplexer.js';
import type { Layout } from './types/multiplexer.js';

const layout: Layout = {
  type: 'pane',
  id: 'single',
  command: 'sh',
  args: ['-c', 'echo "Test Output"; echo "Line 2"; ls -la | head -5'],
  title: 'Single Pane Test',
  focus: true,
};

render(<Multiplexer layout={layout} width={80} height={25} />);
