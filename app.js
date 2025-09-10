// Example API endpoint – replace with your actual meme/coin API
const API_URL = "https://meme-api.com/gimme/5"; 

async function fetchCoins() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch trending coins/memes.");
    const data = await res.json();

    // Assume API gives array of memes; adapt if your API is different
    displayCoins(data.memes || []);
  } catch (err) {
    document.getElementById("error-message").textContent = err.message;
  }
}

function displayCoins(coins) {
  const list = document.getElementById("coin-list");
  list.innerHTML = "";

  if (coins.length === 0) {
    document.getElementById("error-message").textContent = "No trending coins found.";
    return;
  }

  coins.forEach((coin, index) => {
    const card = document.createElement("div");
    card.className = "coin-card";

    const title = document.createElement("h2");
    title.textContent = coin.title || `Coin #${index + 1}`;

    const img = document.createElement("img");
    img.src = coin.url || "https://via.placeholder.com/400x200?text=No+Image";
    img.alt = coin.title || "Trending Meme";

    const subreddit = document.createElement("p");
    subreddit.textContent = coin.subreddit ? `Source: r/${coin.subreddit}` : "";

    const shareBtn = document.createElement("button");
    shareBtn.className = "share-btn";
    shareBtn.textContent = "Share on Twitter";
    shareBtn.onclick = () => {
      const tweetText = encodeURIComponent(`${coin.title} 🚀 Check out this trending meme on #Trendcoin`);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(coin.url)}`;
      window.open(tweetUrl, "_blank");
    };

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(subreddit);
    card.appendChild(shareBtn);
    list.appendChild(card);
  });
}

// Load on startup
fetchCoins();
