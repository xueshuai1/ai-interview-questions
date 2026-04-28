const fs = require('fs');

const results = JSON.parse(fs.readFileSync('/tmp/github-update-results.json', 'utf8'));
let content = fs.readFileSync('src/data/tools.ts', 'utf8');

const successResults = results.results.filter(r => r.status === 'ok');
let starsUpdated = 0, forksUpdated = 0, langUpdated = 0, dateUpdated = 0;

for (const r of successResults) {
  // Find the section for this tool (from id to next closing brace followed by new tool)
  const startIndex = content.indexOf(`id: "${r.id}"`);
  if (startIndex === -1) {
    // Try single quotes
    const startIndex2 = content.indexOf(`id: '${r.id}'`);
    if (startIndex2 === -1) continue;
  }
  
  const start = startIndex !== -1 ? startIndex : content.indexOf(`id: '${r.id}'`);
  
  // Find end of this tool object (next tool's id or end of array)
  const afterStart = content.substring(start);
  const nextToolMatch = afterStart.match(/\n\s*\{\s*\n\s*id:\s*['"]/);
  const arrayEndMatch = afterStart.match(/\n\s*\];/);
  
  let endOffset;
  if (nextToolMatch) {
    endOffset = start + nextToolMatch.index;
  } else if (arrayEndMatch) {
    endOffset = start + arrayEndMatch.index;
  } else {
    continue;
  }
  
  const toolBlock = content.substring(start, endOffset);

  // Update githubStars
  if (r.newStars !== undefined && r.newStars !== null && r.newStars !== r.oldStars) {
    const oldStr = toolBlock.match(/githubStars:\s*\d+/);
    if (oldStr) {
      const newStr = `githubStars: ${r.newStars}`;
      content = content.replace(oldStr[0], newStr);
      starsUpdated++;
    }
  }

  // Update forks
  if (r.newForks !== undefined && r.newForks !== null) {
    const oldForksVal = r.oldForks !== undefined && r.oldForks !== null ? r.oldForks : 0;
    if (r.newForks !== oldForksVal) {
      const oldForksStr = toolBlock.match(/forks:\s*\d+/);
      if (oldForksStr) {
        const newStr = `forks: ${r.newForks}`;
        content = content.replace(oldForksStr[0], newStr);
        forksUpdated++;
      }
    }
  }

  // Update language
  if (r.newLang && r.newLang !== 'null' && r.newLang !== 'None' && r.newLang !== r.oldLang) {
    const oldLangMatch = toolBlock.match(/language:\s*['"][^'"]*['"]/);
    if (oldLangMatch) {
      const newStr = `language: "${r.newLang}"`;
      content = content.replace(oldLangMatch[0], newStr);
      langUpdated++;
    }
  }

  // Update updatedAt if data changed
  const hasDataChange = (r.newStars !== r.oldStars) ||
                        (r.newForks !== undefined && r.newForks !== (r.oldForks || 0)) ||
                        (r.newLang !== r.oldLang);
  if (hasDataChange && r.pushedAt) {
    const oldDateMatch = toolBlock.match(/updatedAt:\s*['"][^'"]*['"]/);
    if (oldDateMatch) {
      const newStr = `updatedAt: "${r.pushedAt}"`;
      content = content.replace(oldDateMatch[0], newStr);
      dateUpdated++;
    }
  }
}

fs.writeFileSync('src/data/tools.ts', content);
console.log(`Updated: ${starsUpdated} stars, ${forksUpdated} forks, ${langUpdated} languages, ${dateUpdated} dates`);
