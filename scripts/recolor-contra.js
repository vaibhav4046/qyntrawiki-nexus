const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'src');

function findTsxFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTsxFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css')) {
      files.push(fullPath);
    }
  }
  return files;
}

const replacements = [
  // Old Pac-Man colors -> Contra colors
  { from: /#ffeb3b/g, to: '#e63946' },           // Yellow -> Red
  { from: /#ffff00/g, to: '#ff2a3a' },           // Yellow bright -> Red bright
  { from: /#ffca28/g, to: '#f77f00' },           // Orange -> Contra orange
  { from: /#ff9800/g, to: '#f77f00' },           // Deep orange -> Contra orange
  { from: /#2121de/g, to: '#4a7c59' },           // Blue maze -> Military green
  { from: /#00e5ff/g, to: '#00b4d8' },           // Cyan -> Spread blue
  { from: /#ff5252/g, to: '#e63946' },           // Red light -> Contra red
  { from: /#ffb852/g, to: '#f77f00' },           // Orange light -> Contra orange
  { from: /#ffb8ff/g, to: '#ff69b4' },           // Pink -> Laser pink

  // Rgba replacements
  { from: /rgba\(255,\s*235,\s*59/g, to: 'rgba(230,57,70' },
  { from: /rgba\(255,\s*202,\s*40/g, to: 'rgba(247,127,0' },
  { from: /rgba\(255,\s*184,\s*255/g, to: 'rgba(255,105,180' },
  { from: /rgba\(255,\s*184,\s*82/g, to: 'rgba(247,127,0' },
  { from: /rgba\(0,\s*255,\s*255/g, to: 'rgba(0,180,216' },
  { from: /rgba\(33,\s*33,\s*222/g, to: 'rgba(74,124,89' },

  // Tailwind classes
  { from: /text-yellow-400\b/g, to: 'text-red-500' },
  { from: /bg-yellow-400\/10\b/g, to: 'bg-red-500/10' },
  { from: /bg-yellow-400\/15\b/g, to: 'bg-red-500/15' },
  { from: /bg-yellow-400\/20\b/g, to: 'bg-red-500/20' },
  { from: /border-yellow-400\/10\b/g, to: 'border-red-500/10' },
  { from: /border-yellow-400\/20\b/g, to: 'border-red-500/20' },
  { from: /border-yellow-400\/30\b/g, to: 'border-red-500/30' },
  { from: /accent-yellow-400\b/g, to: 'accent-red-500' },
  { from: /from-yellow-400\/20/g, to: 'from-red-500/20' },
  { from: /to-yellow-600\/20/g, to: 'to-orange-500/20' },

  // CSS variable references in inline styles
  { from: /var\(--pac-yellow\)/g, to: 'var(--contra-red)' },
  { from: /var\(--pac-yellow-bright\)/g, to: 'var(--contra-red-bright)' },
  { from: /var\(--pac-orange\)/g, to: 'var(--contra-orange)' },
  { from: /var\(--pac-blue\)/g, to: 'var(--contra-green)' },
  { from: /var\(--pac-cyan\)/g, to: 'var(--contra-spread)' },
  { from: /var\(--pac-pink\)/g, to: 'var(--contra-laser)' },
  { from: /var\(--pac-red\)/g, to: 'var(--contra-red)' },
  { from: /var\(--pac-white\)/g, to: 'var(--contra-white)' },
  { from: /var\(--pac-gray\)/g, to: 'var(--contra-gray)' },
  { from: /var\(--pac-black\)/g, to: 'var(--contra-black)' },
  { from: /var\(--pac-card\)/g, to: 'var(--contra-card)' },

  // gradient-pixel -> gradient-flame, gradient-metal
  { from: /gradient-pixel/g, to: 'gradient-flame' },
  { from: /gradient-metal/g, to: 'gradient-metal' },

  // Old class names
  { from: /pixel-btn-yellow/g, to: 'pixel-btn-red' },
  { from: /pixel-badge-yellow/g, to: 'pixel-badge-red' },
  { from: /pixel-badge-blue/g, to: 'pixel-badge-spread' },
  { from: /pixel-badge-pink/g, to: 'pixel-badge-laser' },
  { from: /pixel-border-blue/g, to: 'pixel-border-green' },
  { from: /pixel-border-yellow/g, to: 'pixel-border-red' },
  { from: /glow-pulse/g, to: 'flame-flicker' },

  // Background colors
  { from: /bg-\[#000\]/g, to: 'bg-[#060606]' },
  { from: /bg-\[#0a0a0a\]/g, to: 'bg-[#0a0a0a]' },
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
