// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

// 🎨 MODERN GOOGLE FONTS
const MODERN_FONTS = [
  'Poppins',
  'Playfair Display',
  'Oswald',
  'Lato',
  'Raleway',
  'Nunito',
  'Open Sans'
];

// 📍 TEXT POSITIONS (STRICT CENTER ALIGNMENT)
// Removed all Left/Right positions. 
// Gravity 'north' and 'south' automatically center text horizontally.
const TEXT_POSITIONS = [
  // NORTH (Top Aligned): Title at 120, Subtitle below it
  { gravity: 'north', mainY: 120, subY: 300 }, 
  { gravity: 'north', mainY: 180, subY: 360 },
  
  // SOUTH (Bottom Aligned): Title at 400, Subtitle below it (closer to bottom)
  { gravity: 'south', mainY: 400, subY: 200 },
  { gravity: 'south', mainY: 500, subY: 300 },
  
  // DEAD CENTER (Middle of screen)
  { gravity: 'center', mainY: -50, subY: 100 },
];

// 🎨 COLOR PALETTES
const TEXT_STYLES = [
  // 1. Deep Charcoal & Soft Gray
  { mainColor: '333333', subColor: '757575', outlineColor: '000000' },
  
  // 2. Navy Blue & Muted Sky Blue
  { mainColor: '003366', subColor: '87CEEB', outlineColor: '000000' },
  
  // 3. Forest Green & Sage Green
  { mainColor: '013220', subColor: '8A9A5B', outlineColor: '000000' },
  
  // 4. Royal Purple & Lavender
  { mainColor: '4B0082', subColor: 'E6E6FA', outlineColor: '000000' },
  
  // 5. Classic Black & Crimson Red (White outline for visibility)
  { mainColor: '000000', subColor: 'B22222', outlineColor: 'FFFFFF' },

  // 6. Classic White & Light Gray (Standard)
  { mainColor: 'FFFFFF', subColor: 'E0E0E0', outlineColor: '000000' }
];

const smartLineBreak = (text, maxCharsPerLine = 20) => {
  if (!text) return "";
  const cleanText = text.replace(/#/g, '').replace(/\*/g, '').trim(); 
  const upperText = cleanText.toUpperCase();
  
  if (cleanText.length <= maxCharsPerLine) return encodeURIComponent(upperText);

  const words = upperText.split(' ');
  const middle = Math.ceil(words.length / 2);
  const line1 = encodeURIComponent(words.slice(0, middle).join(' '));
  const line2 = encodeURIComponent(words.slice(middle).join(' '));
  
  return `${line1}%0A${line2}`;
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getDynamicFontSize = (text, isSubheading = false) => {
  const charCount = text.replace(/\s/g, '').length;
  
  // REDUCED SIZES BY ~40% AS REQUESTED
  if (isSubheading) {
    // Subheading: ~30px - 45px
    return Math.max(30, Math.min(45, 450 / charCount));
  }
  
  // Main heading: ~50px - 80px
  return Math.max(50, Math.min(80, 700 / charCount));
};

const generatePinUrl = (imageUrl, mainHeading, subHeading) => {
  // 1. Clean Pexels URL
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);
  
  // Process Text
  const cleanMainText = smartLineBreak(mainHeading, 18);
  const cleanSubText = smartLineBreak(subHeading, 25);
  
  // Fonts & Sizes
  const randomFont = getRandomElement(MODERN_FONTS);
  const mainFontSize = getDynamicFontSize(mainHeading, false);
  const subFontSize = getDynamicFontSize(subHeading, true);

  // 2. Position (Strict Vertical Axis)
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  const mainPositionParams = `g_${randomPosition.gravity},y_${randomPosition.mainY}`;
  const subPositionParams = `g_${randomPosition.gravity},y_${randomPosition.subY}`;

  // 3. Color Palette
  const randomStyle = getRandomElement(TEXT_STYLES);

  // 4. Base Image (Fill Screen, No Filters)
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;

  // 5. Optimization Only (No artistic edits)
  const visualPolish = `f_auto,q_auto`;

  // 6. Main Heading Layer 
  // FIX: Reduced Size. e_outline:2:50 (2px width, 50% opacity).
  const mainHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${mainFontSize}_bold_line_spacing_-15_center:${cleanMainText},co_rgb:${randomStyle.mainColor}/e_outline:2:50,co_rgb:${randomStyle.outlineColor}/c_fit,w_900/fl_layer_apply,${mainPositionParams}`;

  // 7. Subheading Layer
  // FIX: Reduced Size. e_outline:2:50 (2px width, 50% opacity).
  const subHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${subFontSize}_semibold_center:${cleanSubText},co_rgb:${randomStyle.subColor}/e_outline:2:50,co_rgb:${randomStyle.outlineColor}/c_fit,w_800/fl_layer_apply,${subPositionParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
