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
const TEXT_POSITIONS = [
  { gravity: 'north', mainY: 150, subY: 310 },
  { gravity: 'north', mainY: 200, subY: 360 },
  { gravity: 'south', mainY: 450, subY: 290 },
  { gravity: 'center', mainY: -80, subY: 80 },
];

const smartLineBreak = (text, maxCharsPerLine = 20) => {
  if (!text) return "";
  const cleanText = text.replace(/#/g, '').replace(/\*/g, '').trim();
  const upperText = cleanText.toUpperCase();

  if (cleanText.length <= maxCharsPerLine) {
    return encodeURIComponent(upperText);
  }

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
    return Math.max(40, Math.min(52, 460 / charCount));
  }

  return Math.max(70, Math.min(110, 900 / charCount));
};

const generatePinUrl = (imageUrl, mainHeading, subHeading, avgColor) => {
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);

  const cleanMainText = smartLineBreak(mainHeading, 18);
  const cleanSubText = subHeading.replace(/#/g, '').replace(/\*/g, '').trim().toUpperCase();
  const encodedSubText = encodeURIComponent(cleanSubText);

  const headingFont = getRandomElement(HEADING_FONTS);
  const subheadingFont = getRandomElement(SUBHEADING_FONTS);
  const mainFontSize = getDynamicFontSize(mainHeading, false);
  const subFontSize = getDynamicFontSize(subHeading, true);

  const randomPosition = getRandomElement(TEXT_POSITIONS);
  const mainPositionParams = `g_${randomPosition.gravity},y_${randomPosition.mainY}`;

  // Base image
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto,f_auto,q_auto`;

  // 🔥 VISIBILITY FIX PART (IMPORTANT)

  // 1️⃣ Soft dark overlay only behind text area
  const textOverlay = `e_gradient_fade:y_${randomPosition.mainY},co_black,o_45`;

  // 2️⃣ Main Heading (White + Shadow + Stroke)
  const mainHeadingLayer =
    `l_text:${headingFont.replace(/ /g, '%20')}_${mainFontSize}_bold_line_spacing_-10_center:${cleanMainText}` +
    `,co_rgb:FFFFFF,` +
    `shadow:90,` +
    `stroke_1_co_rgb:000000,` +
    `fl_text_no_trim,w_864,c_fit` +
    `/fl_layer_apply,${mainPositionParams}`;

  // 3️⃣ Subheading (White + Shadow)
  const subHeadingLayer =
    `l_text:${subheadingFont.replace(/ /g, '%20')}_${subFontSize}_bold_center:${encodedSubText}` +
    `,co_rgb:FFFFFF,` +
    `shadow:80,` +
    `fl_text_no_trim,w_864,c_fit` +
    `/fl_layer_apply,g_${randomPosition.gravity},y_${randomPosition.mainY}_add_$headingHeight_add_8`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/` +
    `${baseFrame}/${textOverlay}/${mainHeadingLayer}/${subHeadingLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
