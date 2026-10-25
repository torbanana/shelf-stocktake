import { useEffect, useState } from 'react';

/**
 * A small in-memory undo stack. Every change (−/+, bought, add, edit, delete) pushes an entry,
 * and the Undo button in the top bar reverts the most recent one. Cleared when the page reloads.
 */
export interface UndoEntry {
  label: string;
  revert: () => Promise<unknown> | void;
}

const MAX = 30;
let stack: UndoEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function pushUndo(entry: UndoEntry): UndoEntry {
  stack = [...stack.slice(-(MAX - 1)), entry];
  notify();
  return entry;
}

export function peekUndo(): UndoEntry | undefined {
  return stack[stack.length - 1];
}

/** Revert the most recent change. Returns its label, or null if there was nothing to undo. */
export async function undoLast(): Promise<string | null> {
  const entry = stack[stack.length - 1];
  if (!entry) return null;
  stack = stack.slice(0, -1);
  notify();
  await entry.revert();
  return entry.label;
}

/** Revert one specific change (used by the Undo button on a toast) and drop it from the stack. */
export async function undoEntry(entry: UndoEntry): Promise<void> {
  stack = stack.filter((e) => e !== entry);
  notify();
  await entry.revert();
}

export function useUndo(): { canUndo: boolean; label: string | null; undo: () => Promise<string | null> } {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { canUndo: stack.length > 0, label: peekUndo()?.label ?? null, undo: undoLast };
}
