/**
 * Interactive Terminal Component for Ink
 *
 * A complete terminal emulation solution for Ink applications that provides:
 * - PTY process management with node-pty
 * - ANSI escape code parsing with @xterm/headless
 * - Serializable terminal output (AnsiOutput format)
 * - Interactive keyboard input support
 * - Full color and styling support
 *
 * @module
 */

export { Terminal } from './Terminal.js';
export type { TerminalProps } from './Terminal.js';

export { AnsiText } from './AnsiText.js';
export type { AnsiTextProps } from './AnsiText.js';

export { PtyManager } from './ptyManager.js';
export type { PtyConfig, PtyEvent } from './ptyManager.js';

export {
  serializeTerminalToObject,
  convertColorToHex,
} from './terminalSerializer.js';
export type {
  AnsiToken,
  AnsiLine,
  AnsiOutput,
} from './terminalSerializer.js';
