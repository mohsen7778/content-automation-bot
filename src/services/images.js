const axios = require("axios");

async function getImages(query, count = 3) {
  try {
    const res = await axios.get("https://api.pexels.com/v1/search", {
      params: {
        query,
        per_page: count,
        orientation: "landscape"
      },
      headers: {
        Authorization: process.env.PEXELS_API_KEY
      }
    });

    return res.data.photos.map(photo => photo.src.large);

  } catch (err) {
    console.error("Pexels image error:", err.message);
    return [];
  }
}

module.exports = { getImages };
