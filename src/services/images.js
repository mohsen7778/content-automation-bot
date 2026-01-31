// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

// 🎨 MODERN GOOGLE FONTS - HEADING FONTS
const HEADING_FONTS = [
  'Playfair Display',
  'Oswald',
  'Raleway'
];

// 🎨 MODERN GOOGLE FONTS - SUBHEADING FONTS (Different from heading)
const SUBHEADING_FONTS = [
  'Poppins',
  'Lato',
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
    // Subheading: 35-45px for clear visibility
    return Math.max(35, Math.min(45, 400 / charCount));
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
  
  // Fonts & Sizes - Different fonts for heading and subheading
  const headingFont = getRandomElement(HEADING_FONTS);
  const subheadingFont = getRandomElement(SUBHEADING_FONTS);
  const mainFontSize = getDynamicFontSize(mainHeading, false);
  const subFontSize = getDynamicFontSize(subHeading, true);

  // 2. Position
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  const mainPositionParams = `g_${randomPosition.gravity},y_${randomPosition.mainY}`;

  // 4. Base Image with g_auto:avoid to prevent text on face/main subject
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto,f_auto,q_auto`;

  // 5. Main Heading Layer (Black color, 80% width to leave margins, save height)
  const mainHeadingLayer = `l_text:${headingFont.replace(/ /g, '%20')}_${mainFontSize}_bold_line_spacing_-10_center:${cleanMainText},co_rgb:000000,fl_text_no_trim,w_864,c_fit,$headingHeight_h/fl_layer_apply,${mainPositionParams}`;

  // 6. Subheading Layer (Black color, 80% width, positioned 8px (2mm) below heading)
  const subHeadingLayer = `l_text:${subheadingFont.replace(/ /g, '%20')}_${subFontSize}_semibold_center:${cleanSubText},co_rgb:000000,fl_text_no_trim,w_864,c_fit/fl_layer_apply,g_${randomPosition.gravity},y_${randomPosition.mainY}_add_$headingHeight_add_8`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
