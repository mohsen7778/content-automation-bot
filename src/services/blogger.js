const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
process.env.BLOGGER_CLIENT_ID,
process.env.BLOGGER_CLIENT_SECRET
);

oauth2Client.setCredentials({ refresh_token: process.env.BLOGGER_REFRESH_TOKEN });
const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

async function postToBlogger(blogData, imageUrl) {
// YOUR FINAL TEMPLATE - EXACTLY AS PROVIDED
const finalHtml = `

  <style>  
    html, body, .main-inner, .column-center-inner, .content-inner,   
    .post-outer, .post-body, .entry-content, #main-wrapper, .main-outer {  
      background: #ffffff !important; margin-top: 0 !important; padding-top: 0 !important; border: none !important;  
    }  
    #navbar, .navbar, .attribution, #Attribution1, .footer-outer, #footer-wrapper,   
    #BlogSearch1, .BlogSearch, .search, .search-button, .search-icon,   
    .search-target, .search-expand, .header-search, .post-feeds,   
    .status-msg-wrap, .comments, .mobile-nav, .sticky-header, .back-button,   
    .header-icon, .nav-menu, .header-header, .fixed-header, .mobile-header,  
    .centered-top-placeholder, #header-container, .header-cap, .cap-top,  
    .search-form, .search-expand-holder, .header-bar, .sticky-header-container,  
    .centered-top, .centered-top-container {  
      display: none !important; height: 0 !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; top: -2000px !important;   
    }  
    .mia-header-area { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; height: 85px !important; display: flex !important; justify-content: center !important; align-items: center !important; background: #ffffff !important; z-index: 999999 !important; border-bottom: 1px solid rgba(0,0,0,0.06); transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) !important; transform: translateY(0); }  
    .header-hidden { transform: translateY(-102%) !important; }  
    .brand-box { border: 1.5px solid #1f1f1f; padding: 10px 45px; display: inline-block; background: white; position: relative; }  
    .brand-box::after { content: ''; position: absolute; top: 3px; left: 3px; right: 3px; bottom: 3px; border: 1px solid #b08a5c; pointer-events: none; }  
    .brand-box span { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: #1f1f1f; }  
    .mia-main { max-width: 760px; margin: 0 auto !important; background: #ffffff; padding: 125px 22px 100px !important; position: relative; z-index: 10; }  
    .mia-meta { text-align: center; font-size: 0.76rem; letter-spacing: 3px; text-transform: uppercase; color: #b08a5c; margin: 0 0 10px 0 !important; font-weight: 600; }  
    .mia-title { font-family: 'Playfair Display', serif; font-size: clamp(2.3rem, 6vw, 3.4rem); text-align: center; line-height: 1.2; margin: 0 0 40px; color: #000; }  
    .mia-image-wrap { width: 100%; margin-bottom: 50px; }  
    .mia-image-wrap img { width: 100%; height: auto !important; max-height: none !important; object-fit: contain; border-radius: 15px; display: block; margin: 0 auto; }  
    .mia-body { font-size: 1.28rem; line-height: 1.95; color: #222; }  
    .mia-intro { font-size: 1.4rem; font-weight: 500; margin-bottom: 35px; color: #111; line-height: 1.7; }  
    .mia-quote-box { margin: 60px 0; padding: 55px 40px; background: #fdf5f3; border-radius: 0 50px 0 50px; text-align: center; font-family: 'Playfair Display', serif; font-size: 1.6rem; font-style: italic; line-height: 1.5; }  
    .mia-cta { background: #1f1f1f; color: #ffffff; padding: 65px 30px; text-align: center; margin-top: 90px; border-radius: 15px; }  
    @media (max-width: 768px) { .brand-box { padding: 8px 30px; } .mia-main { padding-top: 115px !important; } }  
  </style>    <div class="mia-header-area" id="miaHeader">  
    <div class="brand-box"><span>Notes from Mia</span></div>  
  </div>    <div class="mia-main">  
    <div class="mia-meta">${blogData.category}</div>  
    <h1 class="mia-title">${blogData.title}</h1>  
    <div class="mia-image-wrap"><img src="${imageUrl}"></div>  
    <div class="mia-body">  
      <div class="mia-intro">${blogData.intro}</div>  
      ${blogData.body}  
      <div class="mia-quote-box">"${blogData.quote}"</div>  
    </div>  
    <div class="mia-cta">  
      <h3 style="color:#fff;">Prioritize your peace today.</h3>  
      <p style="opacity:0.8;">Thank you for reading. Until next time, Mia.</p>  
    </div>  
  </div>    <script>  
    function killGhosts() {  
        const suspects = ['header-container', 'navbar', 'Attribution1', 'BlogSearch1', 'header-header', 'centered-top-placeholder', 'sticky-header-container'];  
        suspects.forEach(id => {  
            const el = document.getElementById(id) || document.querySelector('.' + id);  
            if (el) el.remove();   
        });  
    }  
    killGhosts();  
    setTimeout(killGhosts, 1000);  
    let lastScrollTop = 0;  
    const header = document.getElementById('miaHeader');  
    window.addEventListener('scroll', function() {  
      let st = window.pageYOffset || document.documentElement.scrollTop;  
      if (Math.abs(lastScrollTop - st) <= 25) return;  
      if (st > lastScrollTop && st > 100) { header.classList.add('header-hidden'); }   
      else { header.classList.remove('header-hidden'); }  
      lastScrollTop = st;  
    });  
  </script>  `;

const res = await blogger.posts.insert({
blogId: process.env.BLOGGER_BLOG_ID,
requestBody: { title: blogData.title, content: finalHtml },
});
return res.data.url;
}

module.exports = { postToBlogger };
