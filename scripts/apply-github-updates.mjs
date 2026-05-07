#!/usr/bin/env node
// Apply GitHub data updates to tools.ts

import fs from 'fs';

const updatesData = JSON.parse(fs.readFileSync('/tmp/github-data-update.json', 'utf8'));
let content = fs.readFileSync('src/data/tools.ts', 'utf8');

const updates = updatesData.updates;
let starsUpdated = 0, forksUpdated = 0, langUpdated = 0, dateUpdated = 0;

for (const u of updates) {
  // Find the tool entry in the content by matching the URL
  const urlPattern = `https://github.com/${u.repo}`;
  
  // Find the position of this URL in the content
  const urlIdx = content.indexOf(urlPattern);
  if (urlIdx === -1) continue;
  
  // Look backward to find the githubStars field for this tool
  // Search within a window before the URL
  const searchStart = Math.max(0, urlIdx - 2000);
  const windowBefore = content.substring(searchStart, urlIdx);
  
  // Update githubStars
  if (u.newStars !== null && u.newStars !== undefined) {
    const starsMatch = windowBefore.match(/githubStars:\s*(\d+)/);
    if (starsMatch) {
      const oldStars = parseInt(starsMatch[1]);
      if (oldStars !== u.newStars) {
        const fullMatch = `githubStars: ${oldStars}`;
        const newContent = `githubStars: ${u.newStars}`;
        // Find the position in the full content
        const matchInContent = content.indexOf(fullMatch, searchStart);
        if (matchInContent !== -1 && matchInContent < urlIdx) {
          content = content.substring(0, matchInContent) + newContent + content.substring(matchInContent + fullMatch.length);
          starsUpdated++;
        }
      }
    }
  }
  
  // Update forks
  if (u.newForks !== null && u.newForks !== undefined) {
    // Check if forks field exists
    const searchAfter = content.indexOf(urlPattern);
    const windowAfter = content.substring(searchAfter, searchAfter + 1000);
    const forksMatch = windowAfter.match(/forks:\s*(\d+)/);
    if (forksMatch) {
      const oldForks = parseInt(forksMatch[1]);
      if (oldForks !== u.newForks) {
        const fullMatch = `forks: ${oldForks}`;
        const newContent = `forks: ${u.newForks}`;
        const matchInContent = content.indexOf(fullMatch, searchAfter);
        if (matchInContent !== -1) {
          content = content.substring(0, matchInContent) + newContent + content.substring(matchInContent + fullMatch.length);
          forksUpdated++;
        }
      }
    }
  }
  
  // Update language
  if (u.newLanguage) {
    const searchAfter = content.indexOf(urlPattern);
    const windowAfter = content.substring(searchAfter, searchAfter + 1000);
    const langMatch = windowAfter.match(/language:\s*"([^"]+)"/);
    if (langMatch) {
      const oldLang = langMatch[1];
      if (oldLang !== u.newLanguage) {
        const fullMatch = `language: "${oldLang}"`;
        const newContent = `language: "${u.newLanguage}"`;
        const matchInContent = content.indexOf(fullMatch, searchAfter);
        if (matchInContent !== -1) {
          content = content.substring(0, matchInContent) + newContent + content.substring(matchInContent + fullMatch.length);
          langUpdated++;
        }
      }
    }
  }
  
  // Update updatedAt
  if (u.newUpdatedAt) {
    const searchAfter = content.indexOf(urlPattern);
    const windowAfter = content.substring(searchAfter, searchAfter + 1000);
    const dateMatch = windowAfter.match(/updatedAt:\s*"([^"]+)"/);
    if (dateMatch) {
      const oldDate = dateMatch[1];
      if (oldDate !== u.newUpdatedAt) {
        const fullMatch = `updatedAt: "${oldDate}"`;
        const newContent = `updatedAt: "${u.newUpdatedAt}"`;
        const matchInContent = content.indexOf(fullMatch, searchAfter);
        if (matchInContent !== -1) {
          content = content.substring(0, matchInContent) + newContent + content.substring(matchInContent + fullMatch.length);
          dateUpdated++;
        }
      }
    }
  }
}

fs.writeFileSync('src/data/tools.ts', content);
console.log(`Updates applied: stars=${starsUpdated}, forks=${forksUpdated}, language=${langUpdated}, updatedAt=${dateUpdated}`);
