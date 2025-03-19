const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48];
const colors = {
  light: '#000000',
  dark: '#ffffff'
};

async function generateFavicon(color, size) {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon/logo.svg'));
  const svgString = svgBuffer.toString().replace('currentColor', color);
  
  await sharp(Buffer.from(svgString))
    .resize(size, size)
    .toFile(path.join(__dirname, `../public/favicon/favicon-${color === '#000000' ? 'light' : 'dark'}-${size}.png`));
}

async function generateAllFavicons() {
  for (const color of Object.values(colors)) {
    for (const size of sizes) {
      await generateFavicon(color, size);
    }
  }
}

generateAllFavicons().catch(console.error); 