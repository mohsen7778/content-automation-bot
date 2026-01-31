// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

const FONT_MAP = {
  'Inter': 'Roboto', 
  'Source Sans Pro': 'Arial',
  'Montserrat': 'Montserrat' 
};

// 🎨 ARTISTIC FILTERS
const ARTISTIC_FILTERS = [
  'al_dente', 'athena', 'audrey', 'aurora', 'daguerre', 
  'eucalyptus', 'fes', 'frost', 'hairspray', 'hokusai', 
  'incognito', 'linen', 'peacock', 'primavera', 'quartz', 
  'red_rock', 'refresh', 'sizzle', 'sonnet', 'ukulele', 'zorro'
];

// ⚡ ENHANCEMENT CHAINS
const ENHANCEMENT_CHAINS = [
  'e_improve/e_auto_contrast/e_sharpen:60',
  'e_improve/e_auto_color/e_vibrance:20/e_sharpen:70',
  'e_improve/e_sharpen:80/e_auto_brightness',
  'e_auto_color/e_contrast:10/e_sharpen:60',
  'e_improve/e_vibrance:15/e_sharpen:65/e_auto_contrast'
];

// 📍 TEXT POSITIONS
const TEXT_POSITIONS = [
  { gravity: 'north', y: 150 },      
  { gravity: 'north', y: 250 },      
  { gravity: 'south', y: 200 },      
  { gravity: 'south', y: 350 },      
  { gravity: 'north_west', x: 100, y: 200 },
  { gravity: 'north_east', x: 100, y: 200 },
];

// 🎭 TEXT STYLING VARIATIONS
// FIX APPLIED: Added 'rgb:' prefix to border colors.
// Cloudinary crashes if you send 'bo_8px_solid_000000' without 'rgb:'.
const TEXT_STYLES = [
  { color: 'FFFFFF', border: 'rgb:000000', borderWidth: 8 },   // White text, black border
  { color: 'FFFFFF', border: 'rgb:000000', borderWidth: 10 },  // White text, thicker black
  { color: '000000', border: 'rgb:FFFFFF', borderWidth: 8 },   // Black text, white border
  { color: 'FFEB3B', border: 'rgb:000000', borderWidth: 8 },   // Yellow text, black border
  { color: 'FF6B6B', border: 'rgb:FFFFFF', borderWidth: 8 },   // Red text, white border
];

const smartLineBreak = (text) => {
  if (!text) return "";
  const cleanText = text.replace(/#/g, '').replace(/\*/g, '').trim(); 
  const upperText = cleanText.toUpperCase();
  
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
  return Math.max(70, Math.min(130, 900 / charCount));
};

const generatePinUrl = (imageUrl, text, theme = 'dark', font = 'Inter') => {
  // 1. Clean Pexels URL
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);
  
  const cleanText = smartLineBreak(text);
  const cloudFont = FONT_MAP[font] || 'Roboto';
  const fontSize = getDynamicFontSize(text);

  // 2. Random Design Elements
  const randomFilter = getRandomElement(ARTISTIC_FILTERS);
  const filterEffect = `e_art:${randomFilter}:50`;
  const randomEnhancement = getRandomElement(ENHANCEMENT_CHAINS);
  
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  let positionParams = `g_${randomPosition.gravity}`;
  if (randomPosition.x) positionParams += `,x_${randomPosition.x}`;
  if (randomPosition.y) positionParams += `,y_${randomPosition.y}`;

  const randomStyle = getRandomElement(TEXT_STYLES);

  // 3. Base Image
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_pad,b_auto`;

  // 4. Polish
  const visualPolish = `${filterEffect}/${randomEnhancement}/f_auto/q_auto`;

  // 5. Text Layer
  // bo_${...}px_solid_${randomStyle.border} now becomes bo_8px_solid_rgb:000000 (VALID)
  const textLayer = `l_text:${cloudFont}_${fontSize}_bold_line_spacing_-10_center:${cleanText},co_rgb:${randomStyle.color},bo_${randomStyle.borderWidth}px_solid_${randomStyle.border},w_950,c_fit/fl_layer_apply,${positionParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer}/${publicId}`;
};

module.exports = { generatePinUrl };
