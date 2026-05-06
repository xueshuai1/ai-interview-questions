import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let lines = readFileSync(f, 'utf8').split('\n');

// Find all sections with duplicate body fields
// Pattern: body -> mermaid -> body (same content) -> tip/warning

const BT = '`';
const FIELDS = ['title','body','body2','tip','warning','mermaid','table','code','code2','list'];

for (let i = 0; i < lines.length; i++) {
  // Look for body: `** pattern after a mermaid closing
  if (/^\s*body:\s*\u0060\*\*/.test(lines[i])) {
    // Check if there's an earlier body field with the same content in this section
    // Look backwards for the same content
    const bodyContent = lines[i].trim().substring(0, 50);
    
    // Search backwards for same body content
    let prevBodyIndex = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].trim().startsWith('body: ' + BT)) {
        if (lines[j].trim().substring(0, 50) === bodyContent) {
          prevBodyIndex = j;
          break;
        }
      }
    }
    
    if (prevBodyIndex >= 0) {
      // This is a duplicate body field! Find the range to remove
      let dupStart = i;
      let dupEnd = i;
      
      // Find where this duplicate body ends (at tip, warning, or })
      for (let j = i + 1; j < lines.length; j++) {
        const t = lines[j].trim();
        if (FIELDS.includes(t.split(':')[0]) && t !== lines[j].trim()) {
          // Field name found
        }
        if (/^(tip|warning|table|code|list|body2):\s*/.test(t) || /^\s*},?\s*$/.test(t)) {
          dupEnd = j;
          break;
        }
      }
      
      // Also check for a mermaid block inside the duplicate
      let mermaidInDup = false;
      for (let j = dupStart; j < dupEnd; j++) {
        if (lines[j].trim().startsWith('mermaid:')) {
          mermaidInDup = true;
          break;
        }
      }
      
      console.log('Removing duplicate body at lines ' + (dupStart+1) + '-' + dupEnd + 
        ' (same as line ' + (prevBodyIndex+1) + ')' + (mermaidInDup ? ' [has mermaid]' : ''));
      
      lines.splice(dupStart, dupEnd - dupStart);
      i = dupStart - 1; // Adjust index
    }
  }
}

writeFileSync(f, lines.join('\n'));
console.log('Removed all duplicate body fields');
console.log('Final line count:', lines.length);
