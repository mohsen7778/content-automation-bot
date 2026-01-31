// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

// 🎨 MODERN GOOGLE FONTS (better than Arial/Roboto)
const MODERN_FONTS = [
  'Poppins',
  'Playfair Display',
  'Oswald',
  'Lato',
  'Raleway',
  'Nunito',
  'Ubuntu',
  'Open Sans'
];

// 🎨 ARTISTIC FILTERS (all 21 official Cloudinary filters)
const ARTISTIC_FILTERS = [
  'al_dente', 'athena', 'audrey', 'aurora', 'daguerre', 
  'eucalyptus', 'fes', 'frost', 'hairspray', 'hokusai', 
  'incognito', 'linen', 'peacock', 'primavera', 'quartz', 
  'red_rock', 'refresh', 'sizzle', 'sonnet', 'ukulele', 'zorro'
];

// ⚡ ENHANCEMENT CHAINS (different polish levels)
const ENHANCEMENT_CHAINS = [
  'e_improve/e_auto_contrast/e_sharpen:60',
  'e_improve/e_auto_color/e_vibrance:20/e_sharpen:70',
  'e_improve/e_sharpen:80/e_auto_brightness',
  'e_auto_color/e_contrast:10/e_sharpen:60',
  'e_improve/e_vibrance:15/e_sharpen:65/e_auto_contrast'
];

// 📍 TEXT POSITIONS (avoiding center - only extreme edges)
const TEXT_POSITIONS = [
  { gravity: 'north', mainY: 120, subY: 220 },      // Top section
  { gravity: 'north', mainY: 180, subY: 280 },      // Top-mid section
  { gravity: 'south', mainY: 350, subY: 250 },      // Bottom section (main lower, sub above)
  { gravity: 'south', mainY: 420, subY: 320 },      // Bottom-lower section
];

// 🎭 TEXT STYLING VARIATIONS (slim outlines - 3-5px)
const TEXT_STYLES = [
  { mainColor: 'FFFFFF', subColor: 'E8E8E8', outlineColor: '000000', mainOutline: 4, subOutline: 3 },
  { mainColor: 'FFFFFF', subColor: 'D0D0D0', outlineColor: '000000', mainOutline: 5, subOutline: 3 },
  { mainColor: '000000', subColor: '404040', outlineColor: 'FFFFFF', mainOutline: 4, subOutline: 3 },
  { mainColor: 'FFEB3B', subColor: 'FFF59D', outlineColor: '000000', mainOutline: 4, subOutline: 3 },
  { mainColor: 'FF6B6B', subColor: 'FFAAAA', outlineColor: 'FFFFFF', mainOutline: 5, subOutline: 3 },
  { mainColor: '00D9FF', subColor: '80E5FF', outlineColor: '000000', mainOutline: 4, subOutline: 3 },
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
  
  if (isSubheading) {
    // Subheading: 45-75px (smaller than main)
    return Math.max(45, Math.min(75, 650 / charCount));
  }
  
  // Main heading: 90-150px (large and bold)
  return Math.max(90, Math.min(150, 1100 / charCount));
};

const generatePinUrl = (imageUrl, mainHeading, subHeading) => {
  // 1. Clean Pexels URL
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);
  
  // Process both texts with line breaks if needed
  const cleanMainText = smartLineBreak(mainHeading, 18);
  const cleanSubText = smartLineBreak(subHeading, 25);
  
  // Random modern font (same for both main and sub for consistency)
  const randomFont = getRandomElement(MODERN_FONTS);
  
  const mainFontSize = getDynamicFontSize(mainHeading, false);
  const subFontSize = getDynamicFontSize(subHeading, true);

  // 2. Random artistic filter
  const randomFilter = getRandomElement(ARTISTIC_FILTERS);
  const filterEffect = `e_art:${randomFilter}:50`;

  // 3. Random enhancement chain
  const randomEnhancement = getRandomElement(ENHANCEMENT_CHAINS);

  // 4. Random position (with separate Y values for main and sub)
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  const mainPositionParams = `g_${randomPosition.gravity},y_${randomPosition.mainY}`;
  const subPositionParams = `g_${randomPosition.gravity},y_${randomPosition.subY}`;

  // 5. Random text style
  const randomStyle = getRandomElement(TEXT_STYLES);

  // 6. Base Image Transformation (FILL entire frame)
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;

  // 7. Apply filter + enhancement
  const visualPolish = `${filterEffect}/${randomEnhancement}/f_auto/q_auto`;

  // 8. MAIN HEADING Layer (large, bold, perfectly centered)
  const mainHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${mainFontSize}_black_center:${cleanMainText},co_rgb:${randomStyle.mainColor}/e_outline:${randomStyle.mainOutline}:0,co_rgb:${randomStyle.outlineColor}/c_fit,w_980/fl_layer_apply,${mainPositionParams}`;

  // 9. SUBHEADING Layer (smaller, below/above main, perfectly centered)
  const subHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${subFontSize}_semibold_center:${cleanSubText},co_rgb:${randomStyle.subColor}/e_outline:${randomStyle.subOutline}:0,co_rgb:${randomStyle.outlineColor}/c_fit,w_980/fl_layer_apply,${subPositionParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
