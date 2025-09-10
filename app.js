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

    posts
      .filter(meme => meme.image && meme.image.endsWith(".jpg") || meme.image.endsWith(".png"))
      .forEach(meme => {
        const card = document.createElement("div");
        card.className = "meme-card";

        // Generate ticker suggestion
        const words = meme.title.split(" ");
        const ticker = "$" + words[0].substring(0, 5).toUpperCase();

        card.innerHTML = `
          <h3>${meme.title}</h3>
          <img src="${meme.image}" alt="${meme.title}" />
          <p>👍 ${meme.ups} | 💬 ${meme.comments}</p>
          <a href="${meme.permalink}" target="_blank">View on Reddit</a>
          <div class="buttons">
            <button class="coin-btn">🌍 Turn into Coin</button>
            <a class="tweet-btn" 
              href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `🚀 Meme: ${meme.title}\n💰 Ticker: ${ticker}\n${meme.permalink}`
              )}" 
              target="_blank">
              🐦 Tweet
            </a>
          </div>
        `;

        // Attach coin button popup
        card.querySelector(".coin-btn").addEventListener("click", () => {
          alert(`💰 Suggested Coin:\nName: ${meme.title}\nTicker: ${ticker}`);
        });

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
