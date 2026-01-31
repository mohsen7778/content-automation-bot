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

// 🎨 ARTISTIC FILTERS
const ARTISTIC_FILTERS = [
  'al_dente', 'athena', 'audrey', 'aurora', 'daguerre', 
  'eucalyptus', 'fes', 'frost', 'hairspray', 'hokusai', 
  'incognito', 'linen', 'peacock', 'primavera', 'quartz', 
  'red_rock', 'refresh', 'sizzle', 'sonnet', 'ukulele', 'zorro'
];

// ⚡ ENHANCEMENT CHAINS
const ENHANCEMENT_CHAINS = [
  'e_improve/e_auto_contrast/e_sharpen:60',
  'e_improve/e_auto_color/e_vibrance:20/e_sharpen:70',
  'e_improve/e_sharpen:80/e_auto_brightness',
  'e_auto_color/e_contrast:10/e_sharpen:60',
  'e_improve/e_vibrance:15/e_sharpen:65/e_auto_contrast'
];

// 📍 TEXT POSITIONS (Stacking Logic)
// UPDATED: Increased gap between mainY and subY to ~300px to fit 2-line titles safely.
const TEXT_POSITIONS = [
  // NORTH (Top Aligned): Title at 120, Subtitle pushed down to 420
  { gravity: 'north', mainY: 120, subY: 420 }, 
  { gravity: 'north', mainY: 150, subY: 450 },
  
  // SOUTH (Bottom Aligned): Title at 450, Subtitle below it at 200 (from bottom)
  // Note: For South gravity, larger Y = further up. Smaller Y = closer to bottom.
  // We want Title HIGHER (450) and Subtitle LOWER (150).
  { gravity: 'south', mainY: 450, subY: 150 },
  { gravity: 'south', mainY: 500, subY: 200 },

  // CORNERS (Top Left/Right): Indented X, Title Top, Subtitle Below
  { gravity: 'north_west', x: 60, mainY: 150, subY: 450 },
  { gravity: 'north_east', x: 60, mainY: 150, subY: 450 },
];

// 🎨 COLOR PALETTES (With 2px Outline)
const TEXT_STYLES = [
  // 1. Deep Charcoal & Soft Gray (White Outline for contrast)
  { mainColor: '333333', subColor: '757575', outlineColor: 'FFFFFF' },
  
  // 2. Navy Blue & Muted Sky Blue (White Outline)
  { mainColor: '003366', subColor: '87CEEB', outlineColor: 'FFFFFF' },
  
  // 3. Forest Green & Sage Green (White Outline)
  { mainColor: '013220', subColor: '8A9A5B', outlineColor: 'FFFFFF' },
  
  // 4. Royal Purple & Lavender (White Outline)
  { mainColor: '4B0082', subColor: 'E6E6FA', outlineColor: 'FFFFFF' },
  
  // 5. Classic Black & Crimson Red (White Outline)
  { mainColor: '000000', subColor: 'B22222', outlineColor: 'FFFFFF' },

  // 6. Classic White & Light Gray (Black Outline - Standard)
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
  
  if (isSubheading) {
    // Subheading: Reduced by 40% (Now 25-40px)
    return Math.max(25, Math.min(40, 650 / charCount));
  }
  
  // Main heading: Large (80-130px)
  return Math.max(80, Math.min(130, 1100 / charCount));
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

  // 2. Random Artistic Filter
  const randomFilter = getRandomElement(ARTISTIC_FILTERS);
  const filterEffect = `e_art:${randomFilter}:50`; // 50% intensity

  // 3. Random Enhancement
  const randomEnhancement = getRandomElement(ENHANCEMENT_CHAINS);

  // 4. Random Position
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  let mainPositionParams = `g_${randomPosition.gravity},y_${randomPosition.mainY}`;
  let subPositionParams = `g_${randomPosition.gravity},y_${randomPosition.subY}`;

  if (randomPosition.x) {
    mainPositionParams += `,x_${randomPosition.x}`;
    subPositionParams += `,x_${randomPosition.x}`;
  }

  // 5. Random Color Palette
  const randomStyle = getRandomElement(TEXT_STYLES);

  // 6. Base Image (Fill Screen)
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;

  // 7. Visual Polish
  const visualPolish = `${filterEffect}/${randomEnhancement}/f_auto/q_auto`;

  // 8. Main Heading Layer 
  // FIX: line_spacing_-20 keeps double lines tight. e_outline:2 adds thin border.
  const mainHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${mainFontSize}_bold_line_spacing_-20_center:${cleanMainText},co_rgb:${randomStyle.mainColor}/e_outline:2:100,co_rgb:${randomStyle.outlineColor}/c_fit,w_980/fl_layer_apply,${mainPositionParams}`;

  // 9. Subheading Layer
  // FIX: Smaller font size. e_outline:2 adds thin border.
  const subHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${subFontSize}_semibold_center:${cleanSubText},co_rgb:${randomStyle.subColor}/e_outline:2:100,co_rgb:${randomStyle.outlineColor}/c_fit,w_980/fl_layer_apply,${subPositionParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
