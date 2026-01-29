// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

// 1. SAFETY FIX: Mapped to Cloudinary-supported fonts
const FONT_MAP = {
  'Inter': 'Roboto', 
  'Source Sans Pro': 'Arial',
  'Montserrat': 'Montserrat' 
};

/**
 * Helper: Smartly breaks long text into two balanced lines.
 */
const smartLineBreak = (text) => {
  if (!text) return "";
  const upperText = text.toUpperCase();
  const words = upperText.split(' ');

  if (words.length <= 3) return encodeURIComponent(upperText);

  const middle = Math.ceil(words.length / 2);
  const line1 = encodeURIComponent(words.slice(0, middle).join(' '));
  const line2 = encodeURIComponent(words.slice(middle).join(' '));
  
  return `${line1}%0A${line2}`;
};

/**
 * Generates the final Pinterest Pin URL.
 * Updated for Smart Placement (Avoids Faces) and High Contrast.
 */
const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  const publicId = encodeURIComponent(imageUrl);
  const cleanText = smartLineBreak(text);
  
  // Use the map to get a safe font.
  const cloudFont = FONT_MAP[font] || 'Roboto';
  
  // 1. COLOR LOGIC: Force "Proper White" with Black Outline
  // This ensures visibility on BOTH white and dark backgrounds.
  const textColor = 'FFFFFF';
  const borderColor = '000000'; // Black border creates contrast on bright spots

  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;
  const visualPolish = `e_improve,e_sharpen:60,q_auto,f_auto`;

  // 2. TEXT LAYER LOGIC
  // - co_rgb:${textColor}: Pure White
  // - bo_8px_solid_${borderColor}: Thick black border (Solving the "white background" visibility issue)
  // - g_auto: SMART PLACEMENT. Scans image for empty space, avoiding faces and high-detail subjects.
  const textLayer = `l_text:${cloudFont}_100_bold_line_spacing_-10_center:${cleanText},co_rgb:${textColor},bo_8px_solid_${borderColor},o_100,w_900,c_fit/fl_layer_apply,g_auto`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
