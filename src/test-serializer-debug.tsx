#!/usr/bin/env bun
import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import { Terminal } from './Terminal.js';
import type { AnsiOutput } from './terminalSerializer.js';

const App: React.FC = () => {
  const [output, setOutput] = useState<AnsiOutput | null>(null);

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Debug Terminal Serializer</Text>
      <Terminal
        command="sh"
        args={['-c', 'echo "Hello World"; echo "Second line"']}
        cols={50}
        rows={10}
        onExit={(code) => {
          console.error(`\nExited with code: ${code}`);
        }}
        onData={(data) => {
          console.error(`\nGot ${data.length} lines`);
          data.forEach((line, i) => {
            console.error(`Line ${i}: ${line.length} tokens`);
            line.forEach((token, j) => {
              console.error(`  Token ${j}: "${token.text}" (len=${token.text.length})`);
            });
          });
          setOutput(data);
        }}
      />
      {output && (
        <Box marginTop={1}>
          <Text color="yellow">Output captured: {output.length} lines</Text>
        </Box>
      )}
    </Box>
  );
};

render(<App />);
