const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.BLOGGER_CLIENT_ID,
  process.env.BLOGGER_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.BLOGGER_REFRESH_TOKEN
});

const blogger = google.blogger({ version: "v3", auth: oauth2Client });

async function postToBlogger(blogData) {
  const finalHtml = `
<style>
  html, body, .main-inner, .column-center-inner, .content-inner, 
  .post-outer, .post-body, .entry-content, #main-wrapper, .main-outer {
    background: #ffffff !important;
    margin-top: 0 !important;
    padding-top: 0 !important;
    border: none !important;
  }

  #navbar, .navbar, .attribution, #Attribution1, .footer-outer, #footer-wrapper {
    display: none !important;
  }

  .mia-header-area {
    position: fixed;
    top: 0;
    width: 100%;
    height: 85px;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .brand-box {
    border: 1.5px solid #1f1f1f;
    padding: 10px 45px;
  }

  .mia-main {
    max-width: 760px;
    margin: 0 auto;
    padding: 125px 22px 100px;
  }

  .mia-title {
    font-family: serif;
    font-size: 3rem;
    text-align: center;
    margin-bottom: 40px;
  }

  .mia-image-wrap img {
    width: 100%;
    height: auto;
    border-radius: 15px;
    margin-bottom: 50px;
  }

  .mia-body {
    font-size: 1.28rem;
    line-height: 1.95;
  }

  .mia-quote-box {
    margin: 60px 0;
    padding: 50px;
    background: #fdf5f3;
    text-align: center;
    font-style: italic;
  }
</style>

<div class="mia-header-area">
  <div class="brand-box">Notes from Mia</div>
</div>

<div class="mia-main">
  <div class="mia-meta">${blogData.category}</div>
  <h1 class="mia-title">${blogData.title}</h1>

  <div class="mia-body">
    <div class="mia-intro">${blogData.intro}</div>

    ${blogData.body}

    <div class="mia-quote-box">"${blogData.quote}"</div>
  </div>
</div>
`;

  const res = await blogger.posts.insert({
    blogId: process.env.BLOGGER_BLOG_ID,
    requestBody: {
      title: blogData.title,
      content: finalHtml
    }
  });

  return res.data.url;
}

module.exports = { postToBlogger };
