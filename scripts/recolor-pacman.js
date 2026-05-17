const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'src');

function findTsxFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTsxFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const replacements = [
  // Background class (doesn't exist in CSS, replace with bg-black)
  { from: /bg-gradient-warm/g, to: 'bg-black' },

  // Primary text colors
  { from: /#f5f0eb/g, to: '#f5f5f5' },
  { from: /#a89f91/g, to: '#a0a0a0' },
  { from: /#6b6560/g, to: '#666666' },

  // Amber/yellow accent colors
  { from: /#fbbf24/g, to: '#ffeb3b' },
  { from: /#fb923c/g, to: '#ffca28' },
  { from: /#f59e0b/g, to: '#ffeb3b' },

  // Rgba amber -> yellow (with spaces)
  { from: /rgba\(245,\s*158,\s*11/g, to: 'rgba(255,235,59' },
  { from: /rgba\(234,\s*88,\s*12/g, to: 'rgba(255,235,59' },

  // Standard tailwind amber classes -> yellow
  { from: /text-amber-400\b/g, to: 'text-yellow-400' },
  { from: /text-amber-500\b/g, to: 'text-yellow-400' },
  { from: /bg-amber-500\/10\b/g, to: 'bg-yellow-400/10' },
  { from: /bg-amber-500\/15\b/g, to: 'bg-yellow-400/15' },
  { from: /bg-amber-500\/20\b/g, to: 'bg-yellow-400/20' },
  { from: /bg-amber-500\/25\b/g, to: 'bg-yellow-400/25' },
  { from: /bg-amber-500\/30\b/g, to: 'bg-yellow-400/30' },
  { from: /border-amber-500\/10\b/g, to: 'border-yellow-400/10' },
  { from: /border-amber-500\/15\b/g, to: 'border-yellow-400/15' },
  { from: /border-amber-500\/20\b/g, to: 'border-yellow-400/20' },
  { from: /border-amber-500\/25\b/g, to: 'border-yellow-400/25' },
  { from: /border-amber-500\/30\b/g, to: 'border-yellow-400/30' },
  { from: /accent-amber-500\b/g, to: 'accent-yellow-400' },

  // Orange gradient classes -> yellow
  { from: /from-amber-500\/20/g, to: 'from-yellow-400/20' },
  { from: /from-amber-500\/10/g, to: 'from-yellow-400/10' },
  { from: /to-orange-500\/20/g, to: 'to-yellow-600/20' },
  { from: /to-orange-500\/10/g, to: 'to-yellow-600/10' },

  // Canvas colors in KnowledgeTree.tsx
  { from: /#ea580c/g, to: '#ff9800' },
  { from: /#dc2626/g, to: '#f44336' },
  { from: /#60a5fa/g, to: '#00e5ff' },
  { from: /#f87171/g, to: '#ff5252' },
];

const files = findTsxFiles(SRC_DIR);
let totalChanges = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated:', filePath.replace(SRC_DIR + path.sep, ''));
    totalChanges++;
  }
}

console.log(`\nDone! Updated ${totalChanges} files.`);
