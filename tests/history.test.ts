import { describe, it, expect, beforeEach } from 'vitest';
import { UndoManager } from '../src/editor/history';

describe('UndoManager', () => {
  let manager: UndoManager;

  beforeEach(() => {
    manager = new UndoManager();
    manager.init('');
  });

  it('init resets history', () => {
    manager.push({
      type: 'input',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p>b</p>',
    });
    expect(manager.getHistoryLength()).toBe(1);

    manager.init('');
    expect(manager.getHistoryLength()).toBe(0);
    expect(manager.getPosition()).toBe(-1);
  });

  it('push adds entry to history', () => {
    manager.push({
      type: 'input',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p>b</p>',
    });
    expect(manager.getHistoryLength()).toBe(1);
    expect(manager.getPosition()).toBe(0);
  });

  it('undo returns last entry', () => {
    manager.push({
      type: 'input',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p>b</p>',
    });
    const entry = manager.undo();
    expect(entry).not.toBeNull();
    expect(entry!.type).toBe('input');
    expect(entry!.afterHtml).toBe('<p>b</p>');
  });

  it('undo returns null when empty', () => {
    expect(manager.undo()).toBeNull();
  });

  it('redo returns next entry', () => {
    manager.push({
      type: 'format',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p><b>a</b></p>',
    });
    manager.undo();
    const entry = manager.redo();
    expect(entry).not.toBeNull();
    expect(entry!.type).toBe('format');
    expect(entry!.afterHtml).toBe('<p><b>a</b></p>');
  });

  it('redo returns null when at end', () => {
    manager.push({
      type: 'input',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p>b</p>',
    });
    expect(manager.redo()).toBeNull();
  });

  it('canUndo returns correct state', () => {
    expect(manager.canUndo()).toBe(false);
    manager.push({
      type: 'input',
      beforeHtml: '',
      afterHtml: '<p>a</p>',
    });
    expect(manager.canUndo()).toBe(true);
    manager.undo();
    expect(manager.canUndo()).toBe(false);
  });

  it('canRedo returns correct state', () => {
    expect(manager.canRedo()).toBe(false);
    manager.push({
      type: 'input',
      beforeHtml: '',
      afterHtml: '<p>a</p>',
    });
    expect(manager.canRedo()).toBe(false);
    manager.undo();
    expect(manager.canRedo()).toBe(true);
    manager.redo();
    expect(manager.canRedo()).toBe(false);
  });

  it('clear empties history', () => {
    manager.push({
      type: 'input',
      beforeHtml: '',
      afterHtml: '<p>a</p>',
    });
    manager.push({
      type: 'input',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p>b</p>',
    });
    expect(manager.getHistoryLength()).toBe(2);

    manager.clear();
    expect(manager.getHistoryLength()).toBe(0);
    expect(manager.getPosition()).toBe(-1);
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);
  });

  it('push truncates future entries after undo', () => {
    manager.push({
      type: 'input',
      beforeHtml: '',
      afterHtml: '<p>a</p>',
    });
    manager.push({
      type: 'input',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p>b</p>',
    });
    manager.push({
      type: 'input',
      beforeHtml: '<p>b</p>',
      afterHtml: '<p>c</p>',
    });
    expect(manager.getHistoryLength()).toBe(3);

    manager.undo(); // position -> 1
    manager.undo(); // position -> 0

    manager.push({
      type: 'input',
      beforeHtml: '<p>a</p>',
      afterHtml: '<p>x</p>',
    });
    // Future entries (index 1,2) should be truncated
    expect(manager.getHistoryLength()).toBe(2);
    expect(manager.canRedo()).toBe(false);
  });

  it('respects maxSize limit', () => {
    // UndoManager has maxSize = 100
    for (let i = 0; i < 105; i++) {
      manager.push({
        type: 'input',
        beforeHtml: `<p>${i}</p>`,
        afterHtml: `<p>${i + 1}</p>`,
      });
    }
    expect(manager.getHistoryLength()).toBe(100);
  });
});