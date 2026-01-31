// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

// 🎨 MODERN GOOGLE FONTS - HEADING FONTS
const HEADING_FONTS = [
  'Playfair Display',
  'Oswald',
  'Raleway'
];

// 🎨 MODERN GOOGLE FONTS - SUBHEADING FONTS
const SUBHEADING_FONTS = [
  'Poppins',
  'Lato',
  'Nunito',
  'Open Sans'
];

// 📍 TEXT POSITIONS
const TEXT_POSITIONS = [
  { gravity: 'north', mainY: 150 },
  { gravity: 'north', mainY: 200 },
  { gravity: 'south', mainY: 450 },
  { gravity: 'center', mainY: -80 }
];

const smartLineBreak = (text, maxCharsPerLine = 20) => {
  if (!text) return "";
  const cleanText = text.replace(/[#*]/g, '').trim().toUpperCase();

  if (cleanText.length <= maxCharsPerLine) {
    return encodeURIComponent(cleanText);
  }

  const words = cleanText.split(' ');
  const mid = Math.ceil(words.length / 2);
  return (
    encodeURIComponent(words.slice(0, mid).join(' ')) +
    '%0A' +
    encodeURIComponent(words.slice(mid).join(' '))
  );
};

const getRandomElement = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const getDynamicFontSize = (text, isSub = false) => {
  const chars = text.replace(/\s/g, '').length;
  return isSub
    ? Math.max(40, Math.min(52, 460 / chars))
    : Math.max(70, Math.min(110, 900 / chars));
};

const generatePinUrl = (imageUrl, mainHeading, subHeading) => {
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);

  const mainText = smartLineBreak(mainHeading, 18);
  const subText = encodeURIComponent(
    subHeading.replace(/[#*]/g, '').trim().toUpperCase()
  );

  const headingFont = getRandomElement(HEADING_FONTS).replace(/ /g, '%20');
  const subFont = getRandomElement(SUBHEADING_FONTS).replace(/ /g, '%20');

  const mainSize = getDynamicFontSize(mainHeading);
  const subSize = getDynamicFontSize(subHeading, true);

  const pos = getRandomElement(TEXT_POSITIONS);
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto,f_auto,q_auto`;

  // ===== MAIN HEADING SHADOW =====
  const mainShadow =
    `l_text:${headingFont}_${mainSize}_bold_line_spacing_-10_center:${mainText},` +
    `co_rgb:000000,o_60,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},y_${pos.mainY},x_2,y_2`;

  // ===== MAIN HEADING TEXT =====
  const mainTextLayer =
    `l_text:${headingFont}_${mainSize}_bold_line_spacing_-10_center:${mainText},` +
    `co_rgb:FFFFFF,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},y_${pos.mainY}`;

  // ===== SUBHEADING SHADOW =====
  const subShadow =
    `l_text:${subFont}_${subSize}_bold_center:${subText},` +
    `co_rgb:000000,o_55,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},y_${pos.mainY + 160},x_2,y_2`;

  // ===== SUBHEADING TEXT =====
  const subTextLayer =
    `l_text:${subFont}_${subSize}_bold_center:${subText},` +
    `co_rgb:FFFFFF,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},y_${pos.mainY + 160}`;

  return (
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/` +
    `${baseFrame}/` +
    `${mainShadow}/` +
    `${mainTextLayer}/` +
    `${subShadow}/` +
    `${subTextLayer}/` +
    `${publicId}`
  );
};

module.exports = { generatePinUrl };
