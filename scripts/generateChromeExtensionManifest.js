const fs = require('fs');
const path = require('path');
const glob = require('glob');
const pwd = process.cwd();

fs.copyFileSync(
  path.join(pwd, 'browser-extension/chrome/manifest.json'),
  path.join(pwd, 'dist/browser-extension/chrome/manifest.json')
);

fs.mkdirSync(path.join(pwd, 'dist/browser-extension/chrome/assets'), {
  recursive: true,
});

// Copy all image files from assets/images to dist folder
const sourceImageDir = path.join(
  pwd,
  'browser-extension/chrome/src/assets/images'
);
const destImageDir = path.join(
  pwd,
  'dist/browser-extension/chrome/assets/images'
);

// Ensure the destination directory exists
fs.mkdirSync(destImageDir, { recursive: true });

// Use glob to find all files in the source image directory
const imageFiles = glob.sync('**/*', { cwd: sourceImageDir, nodir: true });

// Copy each file to the destination directory
imageFiles.forEach((file) => {
  const sourcePath = path.join(sourceImageDir, file);
  const destPath = path.join(destImageDir, file);
  fs.copyFileSync(sourcePath, destPath);
});
