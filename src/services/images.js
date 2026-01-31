// src/services/images.js

const PINTEREST_WIDTH = 1080;
const PINTEREST_HEIGHT = 1620;

const HEADING_FONTS = [
  'Playfair Display',
  'Oswald',
  'Raleway'
];

const SUBHEADING_FONTS = [
  'Poppins',
  'Lato',
  'Nunito',
  'Open Sans'
];

const TEXT_POSITIONS = [
  { gravity: 'north', mainY: 150 },
  { gravity: 'north', mainY: 200 },
  { gravity: 'south', mainY: 450 },
  { gravity: 'center', mainY: -80 }
];

const smartLineBreak = (text, maxChars = 20) => {
  if (!text) return "";
  const t = text.replace(/[#*]/g, '').trim().toUpperCase();
  if (t.length <= maxChars) return encodeURIComponent(t);

  const w = t.split(' ');
  const m = Math.ceil(w.length / 2);
  return (
    encodeURIComponent(w.slice(0, m).join(' ')) +
    '%0A' +
    encodeURIComponent(w.slice(m).join(' '))
  );
};

const rand = (a) => a[Math.floor(Math.random() * a.length)];

const fontSize = (text, sub = false) => {
  const c = text.replace(/\s/g, '').length;
  return sub
    ? Math.max(40, Math.min(52, 460 / c))
    : Math.max(70, Math.min(110, 900 / c));
};

const generatePinUrl = (imageUrl, mainHeading, subHeading) => {
  const img = encodeURIComponent(imageUrl.split('?')[0]);

  const mainText = smartLineBreak(mainHeading, 18);
  const subText = encodeURIComponent(
    subHeading.replace(/[#*]/g, '').trim().toUpperCase()
  );

  const hFont = rand(HEADING_FONTS).replace(/ /g, '%20');
  const sFont = rand(SUBHEADING_FONTS).replace(/ /g, '%20');

  const hSize = fontSize(mainHeading);
  const sSize = fontSize(subHeading, true);

  const pos = rand(TEXT_POSITIONS);

  const base = `w_${PINTEREST_WIDTH},h_${PINTEREST_HEIGHT},c_fill,g_auto,f_auto,q_auto`;

  const mainShadow =
    `l_text:${hFont}_${hSize}_bold_line_spacing_-10_center:${mainText},` +
    `co_rgb:000000,o_60,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},x_2,y_${pos.mainY + 2}`;

  const mainTextLayer =
    `l_text:${hFont}_${hSize}_bold_line_spacing_-10_center:${mainText},` +
    `co_rgb:FFFFFF,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},y_${pos.mainY}`;

  const subShadow =
    `l_text:${sFont}_${sSize}_bold_center:${subText},` +
    `co_rgb:000000,o_55,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},x_2,y_${pos.mainY + 162}`;

  const subTextLayer =
    `l_text:${sFont}_${sSize}_bold_center:${subText},` +
    `co_rgb:FFFFFF,w_864,c_fit` +
    `/fl_layer_apply,g_${pos.gravity},y_${pos.mainY + 160}`;

  return (
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/` +
    `${base}/` +
    `${mainShadow}/` +
    `${mainTextLayer}/` +
    `${subShadow}/` +
    `${subTextLayer}/` +
    `${img}`
  );
};

module.exports = { generatePinUrl };
