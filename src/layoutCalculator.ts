/**
 * Layout Calculator
 * Calculates terminal positions and sizes based on split configuration
 * Based on stmux's divide algorithm
 */

import type { Layout, Pane, Split, PositionedPane, Dimensions } from './types/multiplexer.js';

/**
 * Parse size specification into pixels
 */
function parseSize(size: string | number | undefined, totalSize: number): number {
  if (size === undefined) return -1; // Auto size

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

  // Decimal: "0.5"
  const decimalMatch = size.match(/^\d+\.\d+$/);
  if (decimalMatch) {
    return Math.floor(totalSize * parseFloat(size));
  }

  // Default to auto
  return -1;
}

/**
 * Divide available space among children
 */
function divide(
  start: number,
  totalSize: number,
  children: (Pane | Split)[]
): Array<{ start: number; size: number }> {
  const n = children.length;

  if (totalSize < n * 3) {
    throw new Error('Terminal too small for number of splits');
  }

  // Pass 1: Calculate explicit sizes
  const sizes: number[] = [];
  for (let i = 0; i < n; i++) {
    const child = children[i];
    if (!child) continue;
    const parsedSize = parseSize(child.size, totalSize);
    sizes[i] = parsedSize;
  }

  // Pass 2: Calculate auto sizes
  const explicitTotal = sizes.reduce((sum, s) => (s > 0 ? sum + s : sum), 0);
  const autoCount = sizes.filter(s => s === -1).length;
  const remainingSize = totalSize - explicitTotal;
  const autoSize = autoCount > 0 ? Math.floor(remainingSize / autoCount) : 0;

  for (let i = 0; i < n; i++) {
    if (sizes[i] === -1) {
      sizes[i] = Math.max(3, autoSize);
    }
  }

  // Pass 3: Adjust to fit exact total (handle rounding)
  while (true) {
    const currentTotal = sizes.reduce((sum, s) => sum + s, 0);

    if (currentTotal > totalSize) {
      // Shrink
      let shrink = currentTotal - totalSize;
      for (let i = 0; i < n && shrink > 0; i++) {
        const size = sizes[i];
        if (size !== undefined && size > 3) {
          sizes[i] = size - 1;
          shrink--;
        }
      }
    } else if (currentTotal < totalSize) {
      // Grow
      let grow = totalSize - currentTotal;
      for (let i = 0; i < n && grow > 0; i++) {
        const size = sizes[i];
        if (size !== undefined) {
          sizes[i] = size + 1;
        }
        grow--;
      }
    } else {
      break;
    }
  }

  // Pass 4: Build result
  const result: Array<{ start: number; size: number }> = [];
  let currentStart = start;

  for (let i = 0; i < n; i++) {
    const size = sizes[i] ?? 3; // Fallback to minimum size
    result.push({ start: currentStart, size });
    currentStart += size;
  }

  return result;
}

/**
 * Calculate positions for all panes in a layout
 */
export function calculateLayout(
  layout: Layout,
  width: number,
  height: number
): PositionedPane[] {
  const panes: PositionedPane[] = [];
  let paneIndex = 0;

  function traverse(
    node: Layout,
    dimensions: Dimensions
  ): void {
    if (node.type === 'pane') {
      panes.push({
        ...node,
        ...dimensions,
        index: paneIndex++,
      });
    } else {
      // Split
      const split = node as Split;

      if (split.direction === 'horizontal') {
        // Split horizontally (side by side)
        const divisions = divide(dimensions.x, dimensions.width, split.children);

        split.children.forEach((child, i) => {
          const division = divisions[i];
          if (!division) return;
          traverse(child, {
            x: division.start,
            y: dimensions.y,
            width: division.size,
            height: dimensions.height,
          });
        });
      } else {
        // Split vertically (stacked)
        const divisions = divide(dimensions.y, dimensions.height, split.children);

        split.children.forEach((child, i) => {
          const division = divisions[i];
          if (!division) return;
          traverse(child, {
            x: dimensions.x,
            y: division.start,
            width: dimensions.width,
            height: division.size,
          });
        });
      }
    }
  }

  traverse(layout, { x: 0, y: 0, width, height });

  return panes;
}

/**
 * Find the index of the pane that should be initially focused
 */
export function findInitialFocus(panes: PositionedPane[]): number {
  const focusedIndex = panes.findIndex(p => p.focus === true);
  return focusedIndex >= 0 ? focusedIndex : 0;
}
