// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

// 1. Font Mapping: Safe font names for Cloudinary (No spaces allowed in IDs)
const FONT_MAP = {
  'Inter': 'Inter',
  'Source Sans Pro': 'SourceSansPro', 
  'Montserrat': 'Montserrat'
};

/**
 * Helper: Smartly breaks long text into two balanced lines.
 * Prevents 6-word hooks from becoming tiny unreadable text.
 */
const smartLineBreak = (text) => {
  const upperText = text.toUpperCase();
  const words = upperText.split(' ');

  // If short (3 words or less), keep it one line for maximum impact.
  if (words.length <= 3) return encodeURIComponent(upperText);

  // If long, split down the middle so it stacks nicely.
  const middle = Math.ceil(words.length / 2);
  const line1 = encodeURIComponent(words.slice(0, middle).join(' '));
  const line2 = encodeURIComponent(words.slice(middle).join(' '));
  
  // %0A is the Cloudinary code for a "Hard Return" (New Line)
  return `${line1}%0A${line2}`;
};

/**
 * Generates the final Pinterest Pin URL.
 * Features: Auto-Subject Crop, Contrast Protection, and Smart Text Wrapping.
 */
export const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  const publicId = encodeURIComponent(imageUrl);
  
  // 2. Process Text: Encodes and applies smart line breaks
  const cleanText = smartLineBreak(text);
  
  // 3. Theme & Font Logic
  const cloudFont = FONT_MAP[font] || 'Inter';
  const textColor = theme === 'dark' ? 'FFFFFF' : '000000';
  const borderColor = theme === 'dark' ? 'black' : 'white';

  // 4. Layer Construction
  // c_fill,g_auto -> Fills 100% of screen, centers subject.
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;

  // e_sharpen:60 -> Crisp details without artifacts.
  const visualPolish = `e_improve,e_sharpen:60,q_auto,f_auto`;

  // bo_4px_solid -> Adds contrast stroke.
  // line_spacing_-10 -> Tightens the gap between the two lines of text.
  const textLayer = `l_text:${cloudFont}_100_bold_center:${cleanText},co_rgb:${textColor},bo_4px_solid_${borderColor},line_spacing_-10,o_90,w_900,c_fit/fl_layer_apply,g_north,y_250`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};
