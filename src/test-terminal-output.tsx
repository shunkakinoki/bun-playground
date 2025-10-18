#!/usr/bin/env bun
import React from 'react';
import { render, Box, Text } from 'ink';
import { Terminal } from './Terminal.js';

const App: React.FC = () => {
  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Testing Terminal Output</Text>
      <Text>Running: echo "Hello World"</Text>
      <Text dimColor>{'─'.repeat(50)}</Text>
      <Terminal
        command="sh"
        args={['-c', 'echo "Hello from terminal"; echo "Line 2"; echo "Line 3"']}
        cols={50}
        rows={10}
        onExit={(code) => {
          console.error(`Process exited with code: ${code}`);
        }}
        onData={(output) => {
          console.error('Got output:', output.length, 'lines');
        }}
      />
    </Box>
  );
};

render(<App />);
