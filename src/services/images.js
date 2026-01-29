// src/services/images.js

// ... (keep PINTEREST_WIDTH, FONT_MAP, and smartLineBreak as they are)

/**
 * Generates the final Pinterest Pin URL.
 */
const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  const publicId = encodeURIComponent(imageUrl);
  const cleanText = smartLineBreak(text);
  
  const cloudFont = FONT_MAP[font] || 'Inter';
  const textColor = theme === 'dark' ? 'FFFFFF' : '000000';
  const borderColor = theme === 'dark' ? 'black' : 'white';

  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;
  const visualPolish = `e_improve,e_sharpen:60,q_auto,f_auto`;

  // FIXED LINE: line_spacing is now inside the l_text definition
  // Format: l_text:Font_Size_Style_line-spacing_center:Text
  const textLayer = `l_text:${cloudFont}_100_bold_line_spacing_-10_center:${cleanText},co_rgb:${textColor},bo_4px_solid_${borderColor},o_90,w_900,c_fit/fl_layer_apply,g_north,y_250`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
