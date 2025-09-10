async function fetchMemes() {
  try {
    const res = await fetch("/.netlify/functions/reddit");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const posts = await res.json();
    console.log("✅ Fetched posts:", posts); // DEBUG LOG

    const memeContainer = document.getElementById("memes");
    memeContainer.innerHTML = ""; // clear old content

    if (!Array.isArray(posts) || posts.length === 0) {
      memeContainer.innerHTML = "<p>No memes found 😢</p>";
      return;
    }

    posts.forEach(meme => {
      if (!meme.image) return; // skip text-only posts

      const card = document.createElement("div");
      card.className = "meme-card";

      card.innerHTML = `
        <h3>${meme.title}</h3>
        <img src="${meme.image}" alt="${meme.title}" />
        <p>👍 ${meme.ups || 0} | 💬 ${meme.comments || 0}</p>
        <a href="${meme.permalink}" target="_blank">View on Reddit</a>
      `;

      memeContainer.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error: Failed to fetch memes", err);
    document.getElementById("memes").innerHTML =
      "<p>⚠️ Failed to load memes.</p>";
  }
}

fetchMemes();
setInterval(fetchMemes, 30000);
