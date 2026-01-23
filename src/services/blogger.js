const { google } = require('googleapis');

// We will get these credentials from Google Cloud Console later
const oauth2Client = new google.auth.OAuth2(
  process.env.BLOGGER_CLIENT_ID,
  process.env.BLOGGER_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.BLOGGER_REFRESH_TOKEN
});

const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

async function postToBlogger(title, content, imageUrl) {
  const blogId = process.env.BLOGGER_BLOG_ID;

  // We wrap the content in HTML to include the image at the top
  const finalHtml = `
    <div style="text-align: center;">
      <img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 10px;" />
    </div>
    <br/>
    ${content}
  `;

  const response = await blogger.posts.insert({
    blogId: blogId,
    requestBody: {
      title: title,
      content: finalHtml,
    },
  });

  return response.data.url; // Returns the link to the new post
}

module.exports = { postToBlogger };
