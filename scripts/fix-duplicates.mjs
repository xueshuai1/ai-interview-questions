import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const lines = c.split('\n');

// The PM's AI duplicated body content after mermaid blocks.
// Section 3: lines 101-151 = body text, lines 152-172 = mermaid, lines 173+ = duplicate of 101+
// Section 9: similar pattern

// For section 3: remove the duplicate body (lines 173 onward until the next field that's NOT a duplicate)
// The duplicate starts at line 173 (index 172) which is "body: `**Claude Dreaming**..."
// and ends before the line that differs from the original body.

// Strategy: find lines that start with "body: `**Claude Dreaming" (duplicate) and remove them
// along with all subsequent body text until we hit a field like tip:, warning:, etc.

const BT = '`';
let inDuplicate = false;
const removeIndices = new Set();

for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  
  // Detect duplicate body: starts with "body: `**Claude Dreaming" (same as line 101)
  if (trimmed.startsWith('body: ' + BT + '**Claude Dreaming')) {
    inDuplicate = true;
    console.log('Found duplicate at line ' + (i+1));
  }
  
  if (inDuplicate) {
    // Mark for removal
    removeIndices.add(i);
    
    // Stop removing when we hit a field name that's not body
    if (/^\s*(tip|warning|table|code|list|mermaid|body2):\s*/.test(lines[i])) {
      // Don't remove this line - it's a real field
      removeIndices.delete(i);
      inDuplicate = false;
    }
  }
}

// Same for second duplicate: body: `**单 Agent 自我监督** (same as line 805/806)
for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  if (trimmed.startsWith('body: ' + BT + '**单 Agent 自我监督**')) {
    // Check if there's already a body field with this content
    for (let j = 0; j < i; j++) {
      if (lines[j].trim().startsWith('body: ' + BT + '**单 Agent 自我监督**')) {
        // This is a duplicate, mark for removal
        inDuplicate = true;
        console.log('Found duplicate at line ' + (i+1));
        break;
      }
    }
  }
  
  if (inDuplicate) {
    removeIndices.add(i);
    if (/^\s*(tip|warning|table|code|list|mermaid|body2):\s*/.test(lines[i])) {
      removeIndices.delete(i);
      inDuplicate = false;
    }
  }
}

// Remove marked lines
const newLines = lines.filter((_, i) => !removeIndices.has(i));
c = newLines.join('\n');
writeFileSync(f, c);
console.log('Removed ' + removeIndices.size + ' duplicate lines');
