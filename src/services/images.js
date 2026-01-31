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
// calculatedGap: 30px (approx 2mm visually on mobile) + Font Height estimate
const TEXT_POSITIONS = [
  // NORTH (Top): Heading at 150px, Subtitle at 260px (150 + 80px font + 30px gap)
  { gravity: 'north', mainY: 150, subY: 260 }, 
  { gravity: 'north', mainY: 200, subY: 310 },
  
  // SOUTH (Bottom): Heading at 400px, Subtitle at 290px (from bottom)
  // (Heading is higher up, subtitle follows it downwards)
  { gravity: 'south', mainY: 400, subY: 290 },
  
  // CENTER: Dead center split
  { gravity: 'center', mainY: -60, subY: 50 },
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
  
  // REDUCED BY ANOTHER 50%
  if (isSubheading) {
    // Subheading: Tiny (20px - 35px)
    return Math.max(20, Math.min(35, 300 / charCount));
  }
  
  // Main heading: Standard (60px - 90px)
  return Math.max(60, Math.min(90, 800 / charCount));
};

// 🧠 CONTRAST LOGIC
// Calculates luminance to determine if text should be Black or White
const getContrastColor = (hexColor) => {
  if (!hexColor) return 'FFFFFF'; // Default to white if undefined
  
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Standard luminance formula
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // If image is bright (>128), use BLACK text. Else use WHITE.
  return (yiq >= 128) ? '000000' : 'FFFFFF';
};

const generatePinUrl = (imageUrl, mainHeading, subHeading, avgColor) => {
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

  // 2. Position
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  const mainPositionParams = `g_${randomPosition.gravity},y_${randomPosition.mainY}`;
  const subPositionParams = `g_${randomPosition.gravity},y_${randomPosition.subY}`;

  // 3. Contrast Color Logic (The "Opposite" Color)
  const contrastColor = getContrastColor(avgColor);

  // 4. Base Image (No Filters, Pure Quality)
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;
  const visualPolish = `f_auto,q_auto`;

  // 5. Main Heading Layer (Clean, No Outline)
  // co_rgb using calculated contrast color
  const mainHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${mainFontSize}_bold_line_spacing_-15_center:${cleanMainText},co_rgb:${contrastColor}/c_fit,w_900/fl_layer_apply,${mainPositionParams}`;

  // 6. Subheading Layer (Tiny, Clean, No Outline)
  // Uses same contrast color
  const subHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${subFontSize}_semibold_center:${cleanSubText},co_rgb:${contrastColor}/c_fit,w_800/fl_layer_apply,${subPositionParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
