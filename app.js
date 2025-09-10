async function fetchMemes() {
  try {
    const res = await fetch("/.netlify/functions/reddit");
    const posts = await res.json();

    // 🎯 Trending logic: sort by momentum (ups/comments)
    const trending = [...posts]
      .sort((a, b) => (b.ups + b.comments) - (a.ups + a.comments))
      .slice(0, 3);

    // 🏆 Render scoreboard
    const trendingEl = document.getElementById("trending");
    trendingEl.innerHTML = trending
      .map(
        (m, i) =>
          `<li>#${i + 1} ${m.title} <span style="color:gray">(Momentum: ${
            m.ups + m.comments
          })</span></li>`
      )
      .join("");

    // 🎨 Render memes
    const memeContainer = document.getElementById("memes");
    memeContainer.innerHTML = "";

    posts.forEach((meme) => {
      const card = document.createElement("div");
      card.className = "meme-card";

      // 🔧 Coin generator
      const coinName = meme.title.split(" ").slice(0, 2).join(" ");
      const ticker = "$" + coinName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6);

      card.innerHTML = `
        <h3>${meme.title}</h3>
        ${meme.image ? `<img src="${meme.image}" alt="${meme.title}" />` : ""}
        <p class="stats">👍 ${meme.ups} | 💬 ${meme.comments}</p>
        <a href="${meme.permalink}" target="_blank">View on Reddit</a><br>
        <button class="btn btn-coin" onclick="alert('💰 Suggested Coin:\\nName: ${coinName}\\nTicker: ${ticker}')">🪙 Turn into Coin</button>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `🔥 Meme: ${meme.title}\\n💰 Suggested Coin: ${ticker}\\n🚀 Built with Trendcoin Memes`
        )}" target="_blank" class="btn btn-tweet">🐦 Tweet</a>
      `;

      memeContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error: Failed to fetch memes", err);
    document.getElementById("memes").innerHTML =
      "<p>⚠️ Failed to load memes.</p>";
  }
}

fetchMemes();
setInterval(fetchMemes, 30000); // refresh every 30s
