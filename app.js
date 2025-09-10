async function fetchMemes() {
  try {
    const res = await fetch("/.netlify/functions/reddit");
    const posts = await res.json();

    const memeContainer = document.getElementById("memes");
    memeContainer.innerHTML = ""; // clear old content

    if (!posts.length) {
      memeContainer.innerHTML = "<p>No memes found 😢</p>";
      return;
    }

    posts.forEach(meme => {
      const card = document.createElement("div");
      card.className = "meme-card";

      card.innerHTML = `
        <h3>${meme.title}</h3>
        ${meme.image ? `<img src="${meme.image}" alt="${meme.title}" />` : ""}
        <p>👍 ${meme.ups} | 💬 ${meme.comments}</p>
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
setInterval(fetchMemes, 30000); // refresh every 30s
