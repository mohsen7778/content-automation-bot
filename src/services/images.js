// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

const FONT_MAP = {
  'Inter': 'Roboto', 
  'Source Sans Pro': 'Arial',
  'Montserrat': 'Montserrat' 
};

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

const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  const publicId = encodeURIComponent(imageUrl);
  const cleanText = smartLineBreak(text);
  
  const cloudFont = FONT_MAP[font] || 'Roboto';
  
  // FIX: Cloudinary border param (bo_) requires a named color or 'rgb:xxxxxx'.
  // We use 'black' to be safe.
  const textColor = 'FFFFFF'; 
  const borderColor = 'black'; 

  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;
  const visualPolish = `e_improve,e_sharpen:60,q_auto,f_auto`;

  // co_rgb:${textColor} -> co_rgb:FFFFFF (Valid)
  // bo_8px_solid_${borderColor} -> bo_8px_solid_black (Valid)
  const textLayer = `l_text:${cloudFont}_100_bold_line_spacing_-10_center:${cleanText},co_rgb:${textColor},bo_8px_solid_${borderColor},o_100,w_900,c_fit/fl_layer_apply,g_auto`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
