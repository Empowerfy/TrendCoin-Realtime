const API_URL = "https://meme-api.com/gimme/20"; 
let coins = [];
let votes = {}; // {coinName: voteCount}

// Generate random coin names
function generateCoinName(title) {
  const suffixes = ["Coin", "Inu", "Token", "Swap", "Blast", "Pump"];
  const words = title.split(" ");
  const base = words[Math.floor(Math.random() * words.length)] || "Meme";
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return base.replace(/[^a-zA-Z]/g, "") + suffix;
}

// Fetch memes/coins
async function fetchCoins() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch trending memes.");
    const data = await res.json();

    coins = (data.memes || []).map(meme => {
      const coinName = generateCoinName(meme.title);
      votes[coinName] = 0; // reset votes each refresh
      return {
        title: meme.title,
        url: meme.url,
        subreddit: meme.subreddit,
        coinName
      };
    });

    displayCoins();
    displayLeaderboard();
  } catch (err) {
    document.getElementById("coin-list").innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

// Display meme cards
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

    const voteBtn = document.createElement("button");
    voteBtn.textContent = "👍 Vote";
    voteBtn.onclick = () => {
      votes[coin.coinName]++;
      displayLeaderboard();
    };

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "🐦 Share on Twitter";
    shareBtn.onclick = () => {
      const tweetText = encodeURIComponent(`Check out ${coin.coinName} 🚀 trending now on #Trendcoin`);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(coin.url)}`;
      window.open(tweetUrl, "_blank");
    };

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(subreddit);
    card.appendChild(voteBtn);
    card.appendChild(shareBtn);

    list.appendChild(card);
  });
}

// Display leaderboard
function displayLeaderboard() {
  const board = document.getElementById("leaderboard");
  board.innerHTML = "";

  const sorted = [...coins].sort((a, b) => votes[b.coinName] - votes[a.coinName]);

  sorted.forEach((coin, index) => {
    const card = document.createElement("div");
    card.className = "coin-card";

    const rank = document.createElement("h2");
    rank.textContent = `#${index + 1} ${coin.coinName} (${votes[coin.coinName]} votes)`;

    const img = document.createElement("img");
    img.src = coin.url;

    card.appendChild(rank);
    card.appendChild(img);
    board.appendChild(card);
  });
}

// Load on startup
fetchCoins();

// 🔄 Auto-refresh every 2 minutes
setInterval(fetchCoins, 120000);

// 🔄 Manual refresh button
document.getElementById("refresh-btn").addEventListener("click", fetchCoins);
