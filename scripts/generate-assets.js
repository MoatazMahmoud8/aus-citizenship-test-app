// Generate app icon and splash screen images
// Run: node scripts/generate-assets.js

const fs = require('fs');
const path = require('path');

// Simple SVG-based icon generator — creates proper PNGs via base64-encoded SVGs
// We'll create SVG files and then use them in app.json

const ICON_SIZE = 1024;
const SPLASH_W = 1284;
const SPLASH_H = 2778;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#001233"/>
      <stop offset="50%" stop-color="#002B7F"/>
      <stop offset="100%" stop-color="#00008B"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE44D"/>
      <stop offset="100%" stop-color="#FFD700"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="180" fill="url(#bg)"/>
  
  <!-- Union Jack (top-left canton) -->
  <g clip-path="url(#canton-clip)">
    <clipPath id="canton-clip">
      <rect x="80" y="80" width="380" height="260" rx="20"/>
    </clipPath>
    <!-- Blue canton base -->
    <rect x="80" y="80" width="380" height="260" fill="#00247D"/>
    <!-- White diagonals -->
    <line x1="80" y1="80" x2="460" y2="340" stroke="white" stroke-width="50"/>
    <line x1="460" y1="80" x2="80" y2="340" stroke="white" stroke-width="50"/>
    <!-- Red diagonals -->
    <line x1="80" y1="80" x2="460" y2="340" stroke="#CF142B" stroke-width="24"/>
    <line x1="460" y1="80" x2="80" y2="340" stroke="#CF142B" stroke-width="24"/>
    <!-- White cross -->
    <rect x="80" y="175" width="380" height="60" fill="white"/>
    <rect x="235" y="80" width="60" height="260" fill="white"/>
    <!-- Red cross -->
    <rect x="80" y="185" width="380" height="40" fill="#CF142B"/>
    <rect x="245" y="80" width="40" height="260" fill="#CF142B"/>
  </g>
  
  <!-- Commonwealth Star (large, centre-bottom area) -->
  <text x="270" y="520" font-size="180" fill="white" font-family="serif" text-anchor="middle">★</text>
  
  <!-- Southern Cross stars -->
  <text x="700" y="220" font-size="100" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="600" y="420" font-size="100" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="820" y="380" font-size="100" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="700" y="560" font-size="100" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="740" y="440" font-size="60" fill="white" font-family="serif" text-anchor="middle">★</text>
  
  <!-- "AU" text at bottom -->
  <text x="512" y="800" font-size="200" font-weight="900" fill="url(#gold)" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="20">AU</text>
  
  <!-- Thin gold line separator -->
  <rect x="250" y="830" width="524" height="4" rx="2" fill="#FFD700" opacity="0.6"/>
  
  <!-- Subtitle -->
  <text x="512" y="910" font-size="70" font-weight="700" fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="8">CITIZEN</text>
  <text x="512" y="970" font-size="50" font-weight="400" fill="rgba(255,215,0,0.7)" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="12">TEST PREP</text>
</svg>`;

const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SPLASH_W}" height="${SPLASH_H}" viewBox="0 0 ${SPLASH_W} ${SPLASH_H}">
  <defs>
    <linearGradient id="sbg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#000C2D"/>
      <stop offset="40%" stop-color="#001245"/>
      <stop offset="70%" stop-color="#002B7F"/>
      <stop offset="100%" stop-color="#00008B"/>
    </linearGradient>
    <linearGradient id="sgold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE44D"/>
      <stop offset="100%" stop-color="#FFD700"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${SPLASH_W}" height="${SPLASH_H}" fill="url(#sbg)"/>
  
  <!-- Decorative stars scattered -->
  <circle cx="200" cy="400" r="3" fill="white" opacity="0.4"/>
  <circle cx="1100" cy="300" r="2" fill="white" opacity="0.3"/>
  <circle cx="300" cy="600" r="2" fill="white" opacity="0.35"/>
  <circle cx="900" cy="500" r="3" fill="white" opacity="0.3"/>
  <circle cx="150" cy="900" r="2" fill="white" opacity="0.25"/>
  <circle cx="1050" cy="800" r="2" fill="white" opacity="0.3"/>
  
  <!-- Australian Flag (centred, scaled) -->
  <g transform="translate(192, 700)">
    <!-- Flag background -->
    <rect width="900" height="450" fill="#00008B" rx="8"/>
    
    <!-- Union Jack canton -->
    <g clip-path="url(#sc)">
      <clipPath id="sc"><rect width="450" height="225"/></clipPath>
      <rect width="450" height="225" fill="#00247D"/>
      <line x1="0" y1="0" x2="450" y2="225" stroke="white" stroke-width="40"/>
      <line x1="450" y1="0" x2="0" y2="225" stroke="white" stroke-width="40"/>
      <line x1="0" y1="0" x2="450" y2="225" stroke="#CF142B" stroke-width="18"/>
      <line x1="450" y1="0" x2="0" y2="225" stroke="#CF142B" stroke-width="18"/>
      <rect y="90" width="450" height="45" fill="white"/>
      <rect x="202" width="46" height="225" fill="white"/>
      <rect y="97" width="450" height="31" fill="#CF142B"/>
      <rect x="210" width="30" height="225" fill="#CF142B"/>
    </g>
    
    <!-- Commonwealth Star -->
    <text x="225" y="370" font-size="90" fill="white" font-family="serif" text-anchor="middle">★</text>
    
    <!-- Southern Cross -->
    <text x="650" y="120" font-size="60" fill="white" font-family="serif" text-anchor="middle">★</text>
    <text x="580" y="220" font-size="60" fill="white" font-family="serif" text-anchor="middle">★</text>
    <text x="730" y="200" font-size="60" fill="white" font-family="serif" text-anchor="middle">★</text>
    <text x="650" y="340" font-size="60" fill="white" font-family="serif" text-anchor="middle">★</text>
    <text x="670" y="240" font-size="35" fill="white" font-family="serif" text-anchor="middle">★</text>
  </g>
  
  <!-- App Title -->
  <text x="642" y="1350" font-size="100" font-weight="900" fill="white" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="3">Australian</text>
  <text x="642" y="1470" font-size="100" font-weight="900" fill="white" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="3">Citizenship</text>
  <text x="642" y="1600" font-size="110" font-weight="900" fill="url(#sgold)" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="4">Test Prep</text>
  
  <!-- Gold divider -->
  <rect x="350" y="1660" width="584" height="4" rx="2" fill="#FFD700" opacity="0.5"/>
  
  <!-- Subtitle -->
  <text x="642" y="1740" font-size="44" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="6">OUR COMMON BOND</text>
  
  <!-- Aussie emojis row (using symbols) -->
  <text x="642" y="1880" font-size="60" fill="rgba(255,255,255,0.4)" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="30">★  ✦  ★  ✦  ★</text>
  
  <!-- Bottom gold accent line -->
  <rect y="${SPLASH_H - 8}" width="${SPLASH_W}" height="8" fill="#FFD700" opacity="0.4"/>
</svg>`;

const adaptiveIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}">
  <defs>
    <linearGradient id="abg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#001233"/>
      <stop offset="50%" stop-color="#002B7F"/>
      <stop offset="100%" stop-color="#00008B"/>
    </linearGradient>
    <linearGradient id="agold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE44D"/>
      <stop offset="100%" stop-color="#FFD700"/>
    </linearGradient>
  </defs>
  <rect width="${ICON_SIZE}" height="${ICON_SIZE}" fill="url(#abg)"/>
  
  <!-- Southern Cross centred -->
  <text x="512" y="340" font-size="120" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="400" y="480" font-size="120" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="630" y="460" font-size="120" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="512" y="620" font-size="120" fill="white" font-family="serif" text-anchor="middle">★</text>
  <text x="545" y="490" font-size="70" fill="white" font-family="serif" text-anchor="middle">★</text>
  
  <!-- AU text -->
  <text x="512" y="850" font-size="200" font-weight="900" fill="url(#agold)" font-family="Arial, sans-serif" text-anchor="middle" letter-spacing="20">AU</text>
</svg>`;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="8" fill="#002B7F"/>
  <text x="24" y="34" font-size="22" font-weight="900" fill="#FFD700" font-family="Arial, sans-serif" text-anchor="middle">AU</text>
</svg>`;

// Write SVG files
const assetsDir = path.join(__dirname, '..', 'assets');

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), adaptiveIconSvg);
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), faviconSvg);

console.log('SVG assets generated! Now converting to PNG...');
console.log('');
console.log('Since Node.js cannot natively create PNGs from SVGs,');
console.log('we will use the SVGs directly or convert them.');
console.log('');
console.log('To convert SVGs to PNGs, you can:');
console.log('1. Open each SVG in a browser and screenshot/save as PNG');
console.log('2. Use an online converter like https://svgtopng.com');
console.log('3. Install sharp: npm install sharp');

// Try to use sharp if available
try {
  const sharp = require('sharp');
  
  async function convert() {
    await sharp(Buffer.from(iconSvg))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ icon.png created');
    
    await sharp(Buffer.from(splashSvg))
      .resize(1284, 2778)
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✅ splash.png created');
    
    await sharp(Buffer.from(adaptiveIconSvg))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png created');
    
    await sharp(Buffer.from(faviconSvg))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ favicon.png created');
    
    console.log('\n🎉 All assets generated successfully!');
  }
  
  convert().catch(err => {
    console.error('Error converting:', err.message);
  });
} catch (e) {
  console.log('\nsharp not found. Installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install sharp --no-save', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('sharp installed. Run this script again: node scripts/generate-assets.js');
  } catch (err) {
    console.log('Could not install sharp. Please install manually: npm install sharp');
  }
}
