=const API_URL = "https://meme-api.com/gimme/20"; 
let coins = [];

// Generate random coin names from meme titles
function generateCoinName(title) {
  const suffixes = ["Coin", "Inu", "Token", "Swap", "Blast", "Pump"];
  const words = title.split(" ");
  const base = words[Math.floor(Math.random() * words.length)] || "Meme";
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return base.replace(/[^a-zA-Z]/g, "") + suffix;
}

// Fetch memes and assign them coin names
async function fetchCoins() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch trending memes.");
    const data = await res.json();

    coins = (data.memes || []).map(meme => {
      const coinName = generateCoinName(meme.title);
      return {
        title: meme.title,
        url: meme.url,
        subreddit: meme.subreddit,
        coinName
      };
    });

    displayCoins();
  } catch (err) {
    document.getElementById("coin-list").innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

// Display meme cards with generated coin names
function displayCoins() {
  const list = document.getElementById("coin-list");
  list.innerHTML = "";

  coins.forEach((coin) => {
    const card = document.createElement("div");
    card.className = "coin-card";

    const title = document.createElement("h2");
    title.textContent = coin.coinName;

    const img = document.createElement("img");
    img.src = coin.url || "https://via.placeholder.com/400x200?text=No+Image";
    img.alt = coin.title;

    const subreddit = document.createElement("p");
    subreddit.textContent = coin.subreddit ? `Source: r/${coin.subreddit}` : "";

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "🐦 Share on Twitter";
    shareBtn.onclick = () => {
      const tweetText = encodeURIComponent(`New memecoin idea: ${coin.coinName} 🚀 Inspired by trending memes on #Trendcoin`);
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

// 🔄 Auto-refresh every 2 minutes
setInterval(fetchCoins, 120000);

// 🔄 Manual refresh button
document.getElementById("refresh-btn").addEventListener("click", fetchCoins);
