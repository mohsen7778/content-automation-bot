// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

const FONT_MAP = {
  'Inter': 'Inter',
  'Source Sans Pro': 'SourceSansPro', 
  'Montserrat': 'Montserrat'
};

/**
 * Helper: Smartly breaks long text into two balanced lines.
 * Must be defined BEFORE it is called.
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
 */
const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  const publicId = encodeURIComponent(imageUrl);
  
  // Now smartLineBreak is visible to this function
  const cleanText = smartLineBreak(text);
  
  const cloudFont = FONT_MAP[font] || 'Inter';
  const textColor = theme === 'dark' ? 'FFFFFF' : '000000';
  const borderColor = theme === 'dark' ? 'black' : 'white';

  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;
  const visualPolish = `e_improve,e_sharpen:60,q_auto,f_auto`;

  // line_spacing included in the text definition block
  const textLayer = `l_text:${cloudFont}_100_bold_line_spacing_-10_center:${cleanText},co_rgb:${textColor},bo_4px_solid_${borderColor},o_90,w_900,c_fit/fl_layer_apply,g_north,y_250`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
