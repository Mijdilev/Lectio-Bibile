import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const source = 'public/assets/lucent-icon.png';

const webTargets = [
  { dest: 'public/icon-512.png', size: 512 },
  { dest: 'public/icon-maskable.png', size: 512 },
  { dest: 'public/icon-192.png', size: 192 },
  { dest: 'public/apple-touch-icon.png', size: 180 },
  { dest: 'public/favicon.png', size: 64 },
];

const androidTargets = [
  { folder: 'android/app/src/main/res/mipmap-mdpi', launcher: 48, foreground: 108 },
  { folder: 'android/app/src/main/res/mipmap-hdpi', launcher: 72, foreground: 162 },
  { folder: 'android/app/src/main/res/mipmap-xhdpi', launcher: 96, foreground: 216 },
  { folder: 'android/app/src/main/res/mipmap-xxhdpi', launcher: 144, foreground: 324 },
  { folder: 'android/app/src/main/res/mipmap-xxxhdpi', launcher: 192, foreground: 432 },
];

console.log('Generating Web PWA icons...');
for (const t of webTargets) {
  execSync(`convert "${source}" -resize ${t.size}x${t.size} "${t.dest}"`);
  console.log(`Generated ${t.dest} (${t.size}x${t.size})`);
}

console.log('Generating Android native launcher icons...');
for (const a of androidTargets) {
  if (fs.existsSync(a.folder)) {
    execSync(`convert "${source}" -resize ${a.launcher}x${a.launcher} "${path.join(a.folder, 'ic_launcher.png')}"`);
    execSync(`convert "${source}" -resize ${a.launcher}x${a.launcher} "${path.join(a.folder, 'ic_launcher_round.png')}"`);
    execSync(`convert "${source}" -resize ${a.foreground}x${a.foreground} "${path.join(a.folder, 'ic_launcher_foreground.png')}"`);
    console.log(`Generated icons in ${a.folder}`);
  }
}

console.log('All icons generated successfully!');
