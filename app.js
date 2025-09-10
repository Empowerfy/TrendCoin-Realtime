async function fetchMemes() {
  try {
    console.log("🔄 Fetching memes...");
    const res = await fetch("/.netlify/functions/reddit");
    const posts = await res.json();

    console.log("✅ API Response:", posts);

    const memeContainer = document.getElementById("memes");
    memeContainer.innerHTML = ""; // clear old content

    if (!Array.isArray(posts) || posts.length === 0) {
      memeContainer.innerHTML = "<p>No memes found 😢</p>";
      return;
    }

    posts.forEach(meme => {
      const card = document.createElement("div");
      card.className = "meme-card";

      const title = meme.title || "Untitled Meme";
      const img = meme.image ? `<img src="${meme.image}" alt="${title}" />` : "";
      const ups = meme.ups || 0;
      const comments = meme.comments || 0;
      const link = meme.permalink || "#";

      card.innerHTML = `
        <h3>${title}</h3>
        ${img}
        <p>👍 ${ups} | 💬 ${comments}</p>
        <a href="${link}" target="_blank">View on Reddit</a>
      `;

      memeContainer.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error fetching memes:", err);
    const memeContainer = document.getElementById("memes");
    memeContainer.innerHTML =
      "<p>⚠️ Failed to load memes. Check console for details.</p>";
  }
}

// Auto load memes
fetchMemes();
setInterval(fetchMemes, 30000); // refresh every 30s
