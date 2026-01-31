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
// Gap Calculation: Heading can be 2 lines (~120px height). 
// We need ~40px gap (approx 3mm visual) below that.
// So SubY should be MainY + 160.
const TEXT_POSITIONS = [
  // NORTH (Top): Heading at 150px, Subtitle at 310px
  { gravity: 'north', mainY: 150, subY: 310 }, 
  { gravity: 'north', mainY: 200, subY: 360 },
  
  // SOUTH (Bottom): Heading at 450px, Subtitle at 290px (from bottom)
  // (Heading is higher up, subtitle follows it downwards)
  { gravity: 'south', mainY: 450, subY: 290 },
  
  // CENTER: Dead center split
  { gravity: 'center', mainY: -80, subY: 80 },
];

// 🎨 AESTHETIC DUAL PALETTES (No Plain White)
const TEXT_STYLES = [
  // 1. Cream & Soft Gold (Luxury)
  { mainColor: 'F5F5DC', subColor: 'F0E68C' },
  
  // 2. Mint & Forest Green (Nature/Fresh)
  { mainColor: 'E0FFE0', subColor: '98FB98' },
  
  // 3. Pale Blue & Navy (Professional)
  { mainColor: 'E6F3FF', subColor: 'B0E0E6' },
  
  // 4. Soft Pink & Rose (Lifestyle)
  { mainColor: 'FFE4E1', subColor: 'FFB6C1' },
  
  // 5. Lavender & Deep Purple (Creative)
  { mainColor: 'E6E6FA', subColor: 'D8BFD8' },

  // 6. Wheat & Tan (Earth Tones)
  { mainColor: 'F5DEB3', subColor: 'D2B48C' }
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
  
  // FIXED SIZES (No Blur)
  if (isSubheading) {
    // Subheading: Increased to 45px-60px for sharpness
    return Math.max(45, Math.min(60, 500 / charCount));
  }
  
  // Main heading: 70px-110px
  return Math.max(70, Math.min(110, 900 / charCount));
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

  // 3. Aesthetic Palette (No Logic, Just Style)
  const randomStyle = getRandomElement(TEXT_STYLES);

  // 4. Base Image (No Filters, Pure Quality)
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto,f_auto,q_auto`;

  // 5. Main Heading Layer (Clean, Aesthetic Color with fl_text_no_trim for sharp rendering)
  const mainHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${mainFontSize}_bold_line_spacing_-10_center:${cleanMainText},co_rgb:${randomStyle.mainColor},fl_text_no_trim,$headingHeight_h/c_fit,w_900/fl_layer_apply,${mainPositionParams}`;

  // 6. Subheading Layer (3mm = ~11px gap below heading using user-defined variable)
  const subHeadingLayer = `l_text:${randomFont.replace(/ /g, '%20')}_${subFontSize}_semibold_center:${cleanSubText},co_rgb:${randomStyle.subColor},fl_text_no_trim/c_fit,w_900/fl_layer_apply,g_${randomPosition.gravity},y_${randomPosition.mainY}_add_$headingHeight_add_11`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
