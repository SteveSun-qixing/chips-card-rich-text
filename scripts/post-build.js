#!/usr/bin/env node

/**
 * Post-build script to reorganize dist directory structure
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

console.log('Running post-build script...');

try {
  // Move HTML files to correct locations
  const rendererHtml = join(distDir, 'src/renderer/index.html');
  const editorHtml = join(distDir, 'src/editor/index.html');

  const rendererDest = join(distDir, 'renderer/index.html');
  const editorDest = join(distDir, 'editor/index.html');

  // Ensure destination directories exist
  mkdirSync(join(distDir, 'renderer'), { recursive: true });
  mkdirSync(join(distDir, 'editor'), { recursive: true });

  // Copy HTML files and fix relative paths (moving up one level from dist/src/X/ to dist/X/)
  const fixPaths = (html) => html.replace(/\.\.\/\.\.\//g, '../');
  writeFileSync(rendererDest, fixPaths(readFileSync(rendererHtml, 'utf-8')));
  writeFileSync(editorDest, fixPaths(readFileSync(editorHtml, 'utf-8')));

  // Remove src directory from dist
  rmSync(join(distDir, 'src'), { recursive: true, force: true });

  console.log('✓ Post-build completed successfully');
} catch (error) {
  console.error('✗ Post-build failed:', error);
  process.exit(1);
}
