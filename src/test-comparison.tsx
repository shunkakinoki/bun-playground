#!/usr/bin/env bun
/**
 * Side-by-side comparison: Standalone Terminal vs Multiplexer
 */
import React from 'react';
import { render, Box, Text } from 'ink';
import { Terminal } from './Terminal.js';
import { Multiplexer } from './Multiplexer.js';
import type { Layout } from './types/multiplexer.js';

const TestComparison: React.FC = () => {
  const [standaloneOutput, setStandaloneOutput] = React.useState<string>('waiting...');
  const [muxOutput, setMuxOutput] = React.useState<string>('waiting...');

  const layout: Layout = {
    type: 'pane',
    id: 'mux-test',
    command: 'echo',
    args: ['MUX OUTPUT'],
    title: 'Multiplexer',
  };

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Comparison Test</Text>
      <Text dimColor>{'─'.repeat(60)}</Text>

      <Box marginTop={1}>
        <Text bold>Standalone Terminal:</Text>
      </Box>
      <Box borderStyle="single" width={60} height={5}>
        <Terminal
          command="echo"
          args={['STANDALONE OUTPUT']}
          cols={56}
          rows={3}
          onData={(output) => {
            const firstLine = output[0];
            const firstToken = firstLine?.[0];
            if (output.length > 0 && firstToken) {
              setStandaloneOutput(`Got ${output.length} lines, first: "${firstToken.text}"`);
            }
          }}
        />
      </Box>
      <Text color="yellow">Status: {standaloneOutput}</Text>

      <Box marginTop={1}>
        <Text bold>Multiplexer Terminal:</Text>
      </Box>
      <Box height={7}>
        <Multiplexer layout={layout} width={60} height={5} showHelp={false} />
      </Box>
    </Box>
  );
};

render(<TestComparison />);
