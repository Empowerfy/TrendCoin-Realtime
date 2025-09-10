async function fetchMemes() {
  try {
    const res = await fetch("/.netlify/functions/reddit");
    const posts = await res.json();

    // 🎯 Trending logic
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

      // 🔧 Generate coin suggestion
      const coinName = meme.title.split(" ").slice(0, 2).join(" ");
      const ticker = "$" + coinName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6);

      // 🎨 Unique DiceBear image based on ticker
      const coinImageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
        ticker
      )}`;

      card.innerHTML = `
        <h3>${meme.title}</h3>
        ${meme.image ? `<img src="${meme.image}" alt="${meme.title}" />` : ""}
        <p class="stats">👍 ${meme.ups} | 💬 ${meme.comments}</p>
        <a href="${meme.permalink}" target="_blank">View on Reddit</a><br>
        <button class="btn btn-coin" onclick="showCoinInfo(this, '${coinName}', '${ticker}', '${coinImageUrl}')">🪙 Turn into Coin</button>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `🔥 Meme: ${meme.title}\n💰 Suggested Coin: ${ticker}\n🚀 Built with Trendcoin Memes`
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

// === Show Coin Info + Image inside card ===
function showCoinInfo(button, coinName, ticker, imgUrl) {
  const card = button.closest(".meme-card");

  let coinDiv = card.querySelector(".coin-info");
  if (!coinDiv) {
    coinDiv = document.createElement("div");
    coinDiv.className = "coin-info";
    card.appendChild(coinDiv);
  }

  coinDiv.innerHTML = `
    <p>💰 <strong>Suggested Coin:</strong></p>
    <p><strong>Name:</strong> ${coinName}</p>
    <p><strong>Ticker:</strong> ${ticker}</p>
    <img src="${imgUrl}" alt="${ticker}" style="max-width:80px;margin-top:0.5rem;">
  `;
}

fetchMemes();
setInterval(fetchMemes, 30000);
