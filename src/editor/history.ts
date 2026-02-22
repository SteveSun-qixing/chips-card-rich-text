/**
 * Undo/Redo history manager
 */

/**
 * History entry
 */
export interface HistoryEntry {
  id: string;
  type: 'format' | 'insert' | 'delete' | 'input' | 'paste';
  beforeHtml: string;
  afterHtml: string;
  timestamp: number;
}

/**
 * Undo/Redo manager with stack-based history
 */
export class UndoManager {
  private history: HistoryEntry[] = [];
  private position = -1;
  private maxSize = 100;

  /**
   * Initialize the manager
   */
  init(_content: string): void {
    this.history = [];
    this.position = -1;
  }

  /**
   * Push a new history entry
   */
  push(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
    this.history = this.history.slice(0, this.position + 1);

    const newEntry: HistoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.history.push(newEntry);
    this.position++;

    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.position--;
    }
  }

  /**
   * Undo the last action
   */
  undo(): HistoryEntry | null {
    if (!this.canUndo()) return null;

    const entry = this.history[this.position];
    this.position--;
    return entry;
  }

  /**
   * Redo the last undone action
   */
  redo(): HistoryEntry | null {
    if (!this.canRedo()) return null;

    this.position++;
    return this.history[this.position];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.position >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.position < this.history.length - 1;
  }

  /**
   * Get the number of history entries
   */
  getHistoryLength(): number {
    return this.history.length;
  }

  /**
   * Get the current position in history
   */
  getPosition(): number {
    return this.position;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.position = -1;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default UndoManager;
