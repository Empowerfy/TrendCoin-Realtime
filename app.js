=async function fetchMemes() {
  try {
    const res = await fetch("/.netlify/functions/reddit");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const posts = await res.json();
    console.log("Fetched posts:", posts); // 🔍 Debug log

    const memeContainer = document.getElementById("memes");
    memeContainer.innerHTML = ""; // clear old content

    if (!Array.isArray(posts) || !posts.length) {
      memeContainer.innerHTML = "<p>No memes found 😢</p>";
      return;
    }

    posts.forEach(meme => {
      const card = document.createElement("div");
      card.className = "meme-card";

      card.innerHTML = `
        <h3>${meme.title}</h3>
        ${meme.image ? `<img src="${meme.image}" alt="${meme.title}" />` : ""}
        <p>👍 ${meme.ups || 0} | 💬 ${meme.comments || 0}</p>
        <a href="${meme.permalink}" target="_blank">View on Reddit</a>
      `;

      memeContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error: Failed to fetch memes", err);
    document.getElementById("memes").innerHTML =
      "<p>⚠️ Failed to load memes.</p>";
  }
}

// Auto load memes
fetchMemes();
setInterval(fetchMemes, 30000);
