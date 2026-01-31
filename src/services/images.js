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
// gravity: Anchor point.
// mainY: Distance of Main Title from the anchor.
// subY: Distance of Subtitle from the anchor.
const TEXT_POSITIONS = [
  // NORTH (Top Aligned): Title is at top (120), Subtitle is BELOW it (340)
  { gravity: 'north', mainY: 120, subY: 340 }, 
  { gravity: 'north', mainY: 150, subY: 370 },
  
  // SOUTH (Bottom Aligned): Title is higher up (400), Subtitle is BELOW it (closer to bottom 180)
  { gravity: 'south', mainY: 400, subY: 180 },
  { gravity: 'south', mainY: 450, subY: 230 },

  // CORNERS (Top Left/Right): Indented X, Title Top, Subtitle Below
  { gravity: 'north_west', x: 60, mainY: 150, subY: 370 },
  { gravity: 'north_east', x: 60, mainY: 150, subY: 370 },
];

// 🎨 COLOR PALETTES (No Outlines)
const TEXT_STYLES = [
  // 1. Deep Charcoal & Soft Gray (Modern Web)
  { mainColor: '333333', subColor: '757575' },
  
  // 2. Navy Blue & Muted Sky Blue (Trust/Corporate)
  { mainColor: '003366', subColor: '87CEEB' },
  
  // 3. Forest Green & Sage Green (Wellness/Nature)
  { mainColor: '013220', subColor: '8A9A5B' },
  
  // 4. Royal Purple & Lavender (Creative/Luxury)
  { mainColor: '4B0082', subColor: 'E6E6FA' },
  
  // 5. Classic Black & Crimson Red (High Energy/Urgent)
  { mainColor: '000000', subColor: 'B22222' },

  // 6. Classic White & Light Gray (For Dark Images - Fallback)
  { mainColor: 'FFFFFF', subColor: 'E0E0E0' }
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
    // Subheading: Smaller (40-65px)
    return Math.max(40, Math.min(65, 650 / charCount));
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

  // 4. Random Position (With separate Y values for safe stacking)
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  let mainPositionParams = `g_${randomPosition.gravity},y_${randomPosition.mainY}`;
  let subPositionParams = `g_${randomPosition.gravity},y_${randomPosition.subY}`;

  // Add X offset if it exists (for corners)
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

  // 8. Main Heading Layer (NO OUTLINE, Bold, Clean)
  // Added e_shadow:40 to ensure readability on complex backgrounds without an ugly outline
  const mainHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${mainFontSize}_bold_center:${cleanMainText},co_rgb:${randomStyle.mainColor}/c_fit,w_980/fl_layer_apply,${mainPositionParams}`;

  // 9. Subheading Layer (NO OUTLINE, Semibold, Clean)
  const subHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${subFontSize}_semibold_center:${cleanSubText},co_rgb:${randomStyle.subColor}/c_fit,w_980/fl_layer_apply,${subPositionParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
