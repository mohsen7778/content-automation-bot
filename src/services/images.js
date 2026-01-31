// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

const FONT_MAP = {
  'Inter': 'Roboto', 
  'Source Sans Pro': 'Arial',
  'Montserrat': 'Montserrat' 
};

// 🎨 ARTISTIC FILTERS (all 21 official Cloudinary filters)
const ARTISTIC_FILTERS = [
  'al_dente', 'athena', 'audrey', 'aurora', 'daguerre', 
  'eucalyptus', 'fes', 'frost', 'hairspray', 'hokusai', 
  'incognito', 'linen', 'peacock', 'primavera', 'quartz', 
  'red_rock', 'refresh', 'sizzle', 'sonnet', 'ukulele', 'zorro'
];

// ⚡ ENHANCEMENT CHAINS (different polish levels)
const ENHANCEMENT_CHAINS = [
  'e_improve/e_auto_contrast/e_sharpen:60',
  'e_improve/e_auto_color/e_vibrance:20/e_sharpen:70',
  'e_improve/e_sharpen:80/e_auto_brightness',
  'e_auto_color/e_contrast:10/e_sharpen:60',
  'e_improve/e_vibrance:15/e_sharpen:65/e_auto_contrast'
];

// 📍 TEXT POSITIONS (avoiding center/main subject areas)
const TEXT_POSITIONS = [
  { gravity: 'north', y: 150 },      // Top
  { gravity: 'north', y: 250 },      // Top-mid
  { gravity: 'south', y: 200 },      // Bottom
  { gravity: 'south', y: 350 },      // Bottom-mid
  { gravity: 'north_west', x: 100, y: 200 },  // Top-left
  { gravity: 'north_east', x: 100, y: 200 },  // Top-right
];

// 🎭 TEXT STYLING VARIATIONS
const TEXT_STYLES = [
  { color: 'FFFFFF', border: 'black', borderWidth: 8 },   // White text, black border
  { color: 'FFFFFF', border: '000000', borderWidth: 10 }, // White text, thicker black
  { color: '000000', border: 'FFFFFF', borderWidth: 8 },  // Black text, white border
  { color: 'FFEB3B', border: '000000', borderWidth: 8 },  // Yellow text, black border
  { color: 'FF6B6B', border: 'FFFFFF', borderWidth: 8 },  // Red text, white border
];

const smartLineBreak = (text) => {
  if (!text) return "";
  const cleanText = text.replace(/#/g, '').replace(/\*/g, '').trim(); 
  const upperText = cleanText.toUpperCase();
  
  // Break by character count instead of word count
  if (cleanText.length <= 20) return encodeURIComponent(upperText);

  const words = upperText.split(' ');
  const middle = Math.ceil(words.length / 2);
  const line1 = encodeURIComponent(words.slice(0, middle).join(' '));
  const line2 = encodeURIComponent(words.slice(middle).join(' '));
  
  return `${line1}%0A${line2}`;
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getDynamicFontSize = (text) => {
  const charCount = text.replace(/\s/g, '').length;
  // Dynamic sizing: shorter text = bigger, longer text = smaller
  return Math.max(70, Math.min(130, 900 / charCount));
};

const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  // 1. Clean Pexels URL
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);
  
  const cleanText = smartLineBreak(text);
  const cloudFont = FONT_MAP[font] || 'Roboto';
  const fontSize = getDynamicFontSize(text);

  // 2. Random artistic filter (50% intensity for subtlety)
  const randomFilter = getRandomElement(ARTISTIC_FILTERS);
  const filterEffect = `e_art:${randomFilter}:50`;

  // 3. Random enhancement chain
  const randomEnhancement = getRandomElement(ENHANCEMENT_CHAINS);

  // 4. Random text position (avoids center to not cover main subject)
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  let positionParams = `g_${randomPosition.gravity}`;
  if (randomPosition.x) positionParams += `,x_${randomPosition.x}`;
  if (randomPosition.y) positionParams += `,y_${randomPosition.y}`;

  // 5. Random text style
  const randomStyle = getRandomElement(TEXT_STYLES);

  // 6. Base Image Transformation (NO CROP - pad to fit Pinterest size)
  // c_pad with b_auto adds smart background padding to fit without cropping
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_pad,b_auto`;

  // 7. Apply filter + enhancement (FIXED: separated f_auto and q_auto)
  const visualPolish = `${filterEffect}/${randomEnhancement}/f_auto/q_auto`;

  // 8. Text Layer with random styling and positioning
  const textLayer = `l_text:${cloudFont}_${fontSize}_bold_line_spacing_-10_center:${cleanText},co_rgb:${randomStyle.color},bo_${randomStyle.borderWidth}px_solid_${randomStyle.border},w_950,c_fit/fl_layer_apply,${positionParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
