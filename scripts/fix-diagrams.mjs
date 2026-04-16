#!/usr/bin/env node
// Replace broken ASCII diagrams with proper code blocks in all guide articles
import { readFileSync, writeFileSync } from 'fs';

const DIR = 'src/data/articles';
const files = [
  'prompt-guide.ts', 'llm-app-guide.ts', 'agent-guide.ts',
  'aieng-guide.ts', 'math-ml-guide.ts', 'dl-guide.ts', 'rl-guide.ts',
  'nlp-guide.ts', 'cv-guide.ts', 'mm-guide.ts', 'genai-guide.ts', 'security-guide.ts'
];

for (const file of files) {
  let content = readFileSync(`${DIR}/${file}`, 'utf-8');
  
  // Find patterns like **┌─...┐** and convert to ``` code blocks
  // The pattern is: bold ASCII box diagrams that got broken by markdown
  
  // Strategy: Find body template literals and replace ASCII art patterns
  // Look for lines containing box drawing characters inside backtick template strings
  
  // Pattern 1: **┌─...┐** style (bold-wrapped boxes)
  // Replace **┌─ with ```\n┌─ and ┐** with ┐\n```
  content = content.replace(/\*\*┌─/g, '```\n┌─');
  content = content.replace(/┐\*\*/g, '┐\n```');
  
  // Pattern 2: ├─...┤ and └─...┘ with ** wrapping
  content = content.replace(/\*\*├─/g, '├─');
  content = content.replace(/┤\*\*/g, '┤');
  content = content.replace(/┘\*\*/g, '┘\n```');
  content = content.replace(/\*\*│/g, '│');
  
  // Clean up: if there are ``` markers without proper closing, fix them
  // Remove stray ``` that appear on the same line as diagram content
  content = content.replace(/```[^`]*?```/gs, (match) => {
    // If the code block contains box characters, keep it
    if (match.includes('┌') || match.includes('├') || match.includes('└') || match.includes('│')) {
      return match;
    }
    return match;
  });
  
  // Also fix ai-000.ts if it has similar issues
  if (file === 'ai-000.ts') {
    content = content.replace(/\*\*┌─/g, '```\n┌─');
    content = content.replace(/┐\*\*/g, '┐\n```');
    content = content.replace(/\*\*├─/g, '├─');
    content = content.replace(/┤\*\*/g, '┤');
    content = content.replace(/\*\*│/g, '│');
    content = content.replace(/┘\*\*/g, '┘\n```');
  }
  
  writeFileSync(`${DIR}/${file}`, content, 'utf-8');
  console.log(`✅ ${file}`);
}

console.log('Done');
