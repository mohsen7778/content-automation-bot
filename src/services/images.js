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
  { gravity: 'north', y: 120 },       
  { gravity: 'north', y: 200 },       
  { gravity: 'north', y: 300 },       
  { gravity: 'south', y: 150 },       
  { gravity: 'south', y: 280 },       
  { gravity: 'south', y: 400 },       
  { gravity: 'north_west', x: 80, y: 180 },   
  { gravity: 'north_east', x: 80, y: 180 },   
  { gravity: 'south_west', x: 80, y: 180 },   
  { gravity: 'south_east', x: 80, y: 180 },   
  { gravity: 'west', x: 60, y: 0 },           
  { gravity: 'east', x: 60, y: 0 },           
];

// 🎭 TEXT STYLING VARIATIONS
// UPDATED: Reduced outlineWidth to 4-5 (was 8-10) for a cleaner look.
const TEXT_STYLES = [
  { color: 'FFFFFF', outlineColor: '000000', outlineWidth: 5 },   
  { color: 'FFFFFF', outlineColor: '000000', outlineWidth: 6 },  
  { color: '000000', outlineColor: 'FFFFFF', outlineWidth: 4 },   
  { color: 'FFEB3B', outlineColor: '000000', outlineWidth: 5 },   
  { color: 'FF6B6B', outlineColor: 'FFFFFF', outlineWidth: 4 },   
  { color: '00D9FF', outlineColor: '000000', outlineWidth: 5 },   
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

// HELPER: Calculate subtitle Y position based on main title gravity
const getSubtitleParams = (mainPos) => {
  const offset = 120; // Distance between Title and Subtitle
  let y = mainPos.y || 0;
  let gravity = mainPos.gravity;

  // If top-aligned (north), subtitle goes DOWN (+y)
  if (gravity.includes('north')) return `g_${gravity},y_${y + offset}`;
  
  // If bottom-aligned (south), subtitle goes UP (closer to center, so smaller y from bottom)
  // Wait, south counts pixels from bottom. To place subtitle BELOW title (closer to bottom), 
  // we decrease Y. To place ABOVE, we increase Y.
  // Let's place subtitle BELOW title. 
  // Exception: If Y is too small, subtitle might get cut off. 
  if (gravity.includes('south')) return `g_${gravity},y_${Math.max(20, y - 100)}`;

  // If centered (west/east), Y starts at 0 (center). Subtitle goes DOWN.
  return `g_${gravity},y_${y + offset}`;
};

// UPDATED: Now accepts 'subText'
const generatePinUrl = (imageUrl, text, subText, theme = 'dark', font = 'Inter') => {
  const cleanImageUrl = imageUrl.split('?')[0];
  const publicId = encodeURIComponent(cleanImageUrl);
  
  const cleanText = smartLineBreak(text);
  const cleanSubText = smartLineBreak(subText || ""); // Handle subtitle
  
  const cloudFont = FONT_MAP[font] || 'Roboto';
  const fontSize = getDynamicFontSize(text);
  const subFontSize = Math.max(40, fontSize - 40); // Subtitle is smaller

  // Randoms
  const randomFilter = getRandomElement(ARTISTIC_FILTERS);
  const filterEffect = `e_art:${randomFilter}:50`;
  const randomEnhancement = getRandomElement(ENHANCEMENT_CHAINS);
  const randomPosition = getRandomElement(TEXT_POSITIONS);
  const randomStyle = getRandomElement(TEXT_STYLES);

  // Position Logic
  let mainPosParams = `g_${randomPosition.gravity}`;
  if (randomPosition.x) mainPosParams += `,x_${randomPosition.x}`;
  if (randomPosition.y) mainPosParams += `,y_${randomPosition.y}`;
  
  // Subtitle Position
  let subPosParams = getSubtitleParams(randomPosition);
  if (randomPosition.x) subPosParams += `,x_${randomPosition.x}`; // Keep same X alignment

  // Base
  const baseFrame = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto`;
  const visualPolish = `${filterEffect}/${randomEnhancement}/f_auto/q_auto`;

  // Layer 1: Main Title
  const textLayer1 = `l_text:${cloudFont}_${fontSize}_bold_line_spacing_-10_center:${cleanText},co_rgb:${randomStyle.color}/e_outline:${randomStyle.outlineWidth}:0,co_rgb:${randomStyle.outlineColor}/c_fit,w_950/fl_layer_apply,${mainPosParams}`;

  // Layer 2: Subtitle (Smaller, same style)
  // We use slightly thinner outline for smaller text
  const subOutline = Math.max(3, randomStyle.outlineWidth - 2);
  const textLayer2 = `l_text:${cloudFont}_${subFontSize}_bold_center:${cleanSubText},co_rgb:${randomStyle.color}/e_outline:${subOutline}:0,co_rgb:${randomStyle.outlineColor}/c_fit,w_850/fl_layer_apply,${subPosParams}`;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${baseFrame}/${visualPolish}/${textLayer1}/${textLayer2}/${publicId}`;
};

module.exports = { generatePinUrl };
