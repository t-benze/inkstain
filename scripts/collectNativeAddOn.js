const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const modules = [
  'node_modules/canvas/build/Release/canvas.node',
  'node_modules/sqlite3/build/Release/node_sqlite3.node',
];

if (!fs.existsSync('node_addons')) {
  fs.rmSync('node_addons', { recursive: true, force: true });
  fs.mkdirSync('node_addons');
}

const dynamicLibs = new Set();

function collectDynamicLibs(source) {
  try {
    const output = execSync(`otool -L ${source}`).toString();
    const dependencies = output
      .split('\n')
      .slice(1)
      .map((line) => line.trim().split(' ')[0])
      .filter(
        (line) =>
          line.length > 0 &&
          !line.startsWith('/usr/lib/') &&
          !line.startsWith('/System/')
      );
    dependencies.forEach((dependency) => {
      const libName = path.basename(dependency);
      const rewritePath = `@rpath/${libName}`;
      console.log('rewrite dependencies', source);
      execSync(
        `install_name_tool -change ${dependency} ${rewritePath} ${source}`
      );
      if (!dynamicLibs.has(libName)) {
        const targetPath = path.resolve('node_addons', libName);
        fs.copyFileSync(dependency, targetPath);
        dynamicLibs.add(libName);
        collectDynamicLibs(targetPath);
      }
    });
  } catch (error) {
    console.error(`Error collecting native files for ${source}:`, error);
  }
}

modules.forEach((module) => {
  const newPath = path.join('node_addons', path.basename(module));
  fs.copyFileSync(module, newPath);
  collectDynamicLibs(newPath);
});

fs.writeFileSync(
  'native-addon-manifest.json',
  JSON.stringify([...modules], null, 2)
);
