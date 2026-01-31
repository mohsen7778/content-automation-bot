const { google } = require('googleapis');

/**
 * CONNECTING TO BLOGGER
 * We use the Redirect URI from the Playground to ensure the token is accepted.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.BLOGGER_CLIENT_ID,
  process.env.BLOGGER_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: process.env.BLOGGER_REFRESH_TOKEN });
const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

async function postToBlogger(blogData) {
  try {
    // 1. YOUR DESIGN (Kept 100% as you built it)
    const finalHtml = `
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&family=Lora:ital,wght@1,400;1,500&display=swap" rel="stylesheet">
  <style>
    html, body, .main-inner, .post-body { background: #ffffff !important; margin: 0 !important; }
    #navbar, .navbar, .footer-outer { display: none !important; }
    .mia-header-area {
      position: fixed; top: 0; width: 100%; height: 85px; display: flex;
      justify-content: center; align-items: center; background: #fff; z-index: 999;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .brand-box { border: 1.5px solid #1f1f1f; padding: 10px 45px; }
    .brand-box span { font-family: 'Playfair Display', serif; letter-spacing: 4px; text-transform: uppercase; }
    .mia-main { max-width: 760px; margin: 40px auto; padding: 100px 20px; font-family: 'Inter', sans-serif; }
    .mia-meta { text-align: center; color: #b08a5c; letter-spacing: 3px; font-weight: 600; font-size: 0.7rem; }
    .mia-title { font-family: 'Playfair Display', serif; font-size: 2.4rem; text-align: center; margin: 20px 0; }
    .mia-image-wrap img { width: 100%; border-radius: 12px; }
    .mia-body { font-size: 1rem; line-height: 1.8; color: #333; }
    .mia-quote-box { margin: 40px 0; padding: 30px; background: #fdf5f3; border-radius: 0 40px; font-style: italic; text-align: center; font-family: 'Lora', serif; }
    .mia-cta { background: #1f1f1f; color: #fff; padding: 50px; text-align: center; border-radius: 15px; margin-top: 60px; }
  </style>

  <div class="mia-header-area"><div class="brand-box"><span>Notes from Mia</span></div></div>
  <div class="mia-main">
    <div class="mia-meta">${blogData.category}</div>
    <h1 class="mia-title">${blogData.title}</h1>
    <div class="mia-image-wrap"><img src="${blogData.featuredImage}"></div>
    <div class="mia-body">
      <p>${blogData.intro}</p>
      ${blogData.body}
      <div class="mia-quote-box">"${blogData.quote}"</div>
    </div>
    <div class="mia-cta">
      <h3 style="color:#fff;">Prioritize your peace today.</h3>
      <p>Until next time, Mia.</p>
    </div>
  </div>
  `;

    // 2. THE UPLOAD (Standard v3 API Method)
    console.log("🚀 Attempting Blogger Upload...");
    const res = await blogger.posts.insert({
      blogId: process.env.BLOGGER_BLOG_ID,
      requestBody: {
        title: blogData.title,
        content: finalHtml,
        labels: [blogData.category, "Automated"]
      },
    });

    console.log(`✅ Success! Post live at: ${res.data.url}`);
    return res.data.url;

  } catch (error) {
    // 3. 2026 ERROR HANDLING
    if (error.code === 403) {
      console.error("❌ Permission Denied: Check if the Blog ID is correct and the App is Published to Production.");
    } else if (error.code === 401) {
      console.error("❌ Invalid Token: You need to refresh your BLOGGER_REFRESH_TOKEN in GitHub Secrets.");
    } else {
      console.error("❌ Blogger Error:", error.message);
    }
    throw error;
  }
}

module.exports = { postToBlogger };
