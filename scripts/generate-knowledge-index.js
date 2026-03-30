const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(process.cwd(), 'content', 'knowledge');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'knowledge-index.json');

const categories = ['ML', 'DL', 'NLP', 'CV', 'LLM', 'RecSys', 'RL', 'System', 'AI-Engineering'];

const articles = [];

categories.forEach(category => {
  const categoryDir = path.join(KNOWLEDGE_DIR, category);
  if (!fs.existsSync(categoryDir)) return;
  
  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'));
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(categoryDir, file), 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    const metadata = {
      id: file.replace('.md', ''),
      category,
      title: file.replace('.md', '').replace(/-/g, ' '),
      description: '',
      tags: [],
      difficulty: 1,
      readTime: '5 min'
    };
    
    if (frontmatterMatch) {
      const lines = frontmatterMatch[1].split('\n');
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          let value = valueParts.join(':').trim();
          if (key.trim() === 'title') metadata.title = value.replace(/"/g, '');
          if (key.trim() === 'description') metadata.description = value.replace(/"/g, '');
          if (key.trim() === 'tags') {
            metadata.tags = value.replace(/[\[\]"]/g, '').split(',').map(t => t.trim());
          }
          if (key.trim() === 'difficulty') metadata.difficulty = parseInt(value) || 1;
        }
      });
    }
    
    articles.push(metadata);
  });
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ articles }, null, 2));
console.log(`Generated knowledge index with ${articles.length} articles`);
