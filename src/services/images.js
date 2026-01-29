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
  // Remove any hashtags or markdown that might break rendering
  const cleanText = text.replace(/#/g, '').replace(/\*/g, '').trim(); 
  const upperText = cleanText.toUpperCase();
  const words = upperText.split(' ');

  if (words.length <= 3) return encodeURIComponent(upperText);

  const middle = Math.ceil(words.length / 2);
  const line1 = encodeURIComponent(words.slice(0, middle).join(' '));
  const line2 = encodeURIComponent(words.slice(middle).join(' '));
  
  return `${line1}%0A${line2}`;
};

const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  // FIX 1: Clean the Pexels URL. Remove everything after '?'.
  // This prevents 400 Errors caused by long/messy query strings.
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);
  
  const cleanText = smartLineBreak(text);
  
  const cloudFont = FONT_MAP[font] || 'Roboto';
  
  // FIX 2: Use strict 'rgb:000000' for the border. Named colors can sometimes fail.
  const textColor = 'FFFFFF'; 
  const borderColor = 'rgb:000000'; 

  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;
  const visualPolish = `e_improve,e_sharpen:60,q_auto,f_auto`;

  // g_auto: Avoids faces and high-saliency areas
  const textLayer = `l_text:${cloudFont}_100_bold_line_spacing_-10_center:${cleanText},co_rgb:${textColor},bo_8px_solid_${borderColor},o_100,w_900,c_fit/fl_layer_apply,g_auto`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
