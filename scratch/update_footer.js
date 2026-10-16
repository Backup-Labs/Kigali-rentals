const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'Footer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update outer wrapper
content = content.replace(
  'className="w-full relative z-10 selection:bg-[#FFC72C] selection:text-[#111111] overflow-hidden bg-[#0B0C0E] text-white border-t border-zinc-800/80"',
  'className="w-full relative z-10 selection:bg-[#FFC72C] selection:text-[#111111] overflow-hidden bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white border-t border-black/10 dark:border-zinc-800/80"'
);

// Update pre-footer CTA section
content = content.replace(
  'className="w-full relative scroll-mt-24 py-16 sm:py-20 lg:py-24 bg-[#101114] text-white border-b border-zinc-800"',
  'className="w-full relative scroll-mt-24 py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#101114] text-zinc-900 dark:text-white border-b border-black/10 dark:border-zinc-800"'
);

content = content.replace(
  '<h2 className="font-tenor text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">',
  '<h2 className="font-tenor text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight mb-4">'
);

content = content.replace(
  '<p className="text-xs sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10">',
  '<p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10">'
);

// Newsletter column border
content = content.replace(
  'lg:border-r border-white/20',
  'lg:border-r border-black/10 dark:border-white/20'
);

// Newsletter input border and colors
content = content.replace(
  'border-b border-white/30 focus-within:border-white transition-colors pb-2 group',
  'border-b border-black/20 dark:border-white/30 focus-within:border-[#FFC72C] transition-colors pb-2 group'
);

content = content.replace(
  'className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-white/60 focus:outline-hidden pr-8 font-sans"',
  'className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/60 focus:outline-hidden pr-8 font-sans"'
);

content = content.replace(
  'className="text-white/80 hover:text-white p-1 transition-transform group-hover:translate-x-1 duration-200"',
  'className="text-zinc-700 dark:text-white/80 hover:text-black dark:hover:text-white p-1 transition-transform group-hover:translate-x-1 duration-200"'
);

content = content.replace(
  'text-white/80 font-semibold mb-4',
  'text-zinc-500 dark:text-white/80 font-semibold mb-4'
);

content = content.replace(
  'text-white/85 font-sans',
  'text-zinc-600 dark:text-white/85 font-sans'
);

// Links
content = content.replace(
  /hover:text-white hover:translate-x-1/g,
  'hover:text-black dark:hover:text-white hover:translate-x-1'
);

content = content.replace(
  /className="text-white font-semibold hover:underline/g,
  'className="text-zinc-900 dark:text-white font-semibold hover:underline'
);

content = content.replace(
  'border border-white/30 hover:border-white hover:text-white hover:bg-white/15',
  'border border-black/20 dark:border-white/30 hover:border-[#FFC72C] text-zinc-700 dark:text-white hover:text-[#FFC72C] hover:bg-[#FFC72C]/10'
);
content = content.replace(
  'border border-white/30 hover:border-white hover:text-white hover:bg-white/15',
  'border border-black/20 dark:border-white/30 hover:border-[#FFC72C] text-zinc-700 dark:text-white hover:text-[#FFC72C] hover:bg-[#FFC72C]/10'
);
content = content.replace(
  'border border-white/30 hover:border-white hover:text-white hover:bg-white/15',
  'border border-black/20 dark:border-white/30 hover:border-[#FFC72C] text-zinc-700 dark:text-white hover:text-[#FFC72C] hover:bg-[#FFC72C]/10'
);

// Copyright bar
content = content.replace(
  'border-t border-white/20 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-white/90 gap-4',
  'border-t border-black/10 dark:border-white/20 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 dark:text-white/90 gap-4'
);

content = content.replace(
  'border-t border-zinc-800/80 relative flex items-center',
  'border-t border-black/10 dark:border-zinc-800/80 relative flex items-center'
);

// Marquee gradient
content = content.replace(
  /from-white via-\[#FFC72C\] to-\[#FFC72C\]\/25/g,
  'from-zinc-900 via-[#FFC72C] to-[#FFC72C]/30 dark:from-white dark:via-[#FFC72C] dark:to-[#FFC72C]/25'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Footer.tsx with theme adaptability');

