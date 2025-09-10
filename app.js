const API_URL = "https://api.imgflip.com/get_memes"; 
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
    if (!res.ok) throw new Error("Failed to fetch memes.");
    const data = await res.json();

    if (!data.success || !data.data || !data.data.memes) {
      throw new Error("No memes found.");
    }

    // Take 20 random memes
    const shuffled = data.data.memes.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20);

    coins = selected.map(meme => {
      const coinName = generateCoinName(meme.name);
      const trendScore = Math.floor(Math.random() * 101); // 0–100
      return {
        title: meme.name,
        url: meme.url,
        coinName,
        trendScore
      };
    });

    displayLeaderboard();
    displayCoins();
  } catch (err) {
    document.getElementById("coin-list").innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// Display top 3 leaderboard
function displayLeaderboard() {
  const board = document.getElementById("leaderboard");
  board.innerHTML = "";

  // Sort coins by score, take top 3
  const topCoins = [...coins].sort((a, b) => b.trendScore - a.trendScore).slice(0, 3);

  topCoins.forEach((coin, index) => {
    const card = document.createElement("div");
    card.className = "coin-card";
    card.style.background = index === 0 ? "#2ea04333" : index === 1 ? "#f0ad4e33" : "#f8514933";

    const rank = document.createElement("h2");
    rank.textContent = `#${index + 1} ${coin.coinName} (${coin.trendScore}/100)`;

    const img = document.createElement("img");
    img.src = coin.url;

    card.appendChild(rank);
    card.appendChild(img);
    board.appendChild(card);
  });
}

// Display all meme cards with trend scores
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

    // 🔥 Trend Score
    const scoreWrapper = document.createElement("div");
    scoreWrapper.style.width = "100%";
    scoreWrapper.style.marginTop = "0.5rem";

    const scoreLabel = document.createElement("p");
    scoreLabel.textContent = `🔥 Trend Score: ${coin.trendScore}/100`;
    scoreLabel.style.margin = "0 0 0.3rem 0";

    const progressBar = document.createElement("div");
    progressBar.style.width = "100%";
    progressBar.style.height = "10px";
    progressBar.style.background = "#30363d";
    progressBar.style.borderRadius = "5px";

    const progressFill = document.createElement("div");
    progressFill.style.height = "100%";
    progressFill.style.width = `${coin.trendScore}%`;
    progressFill.style.borderRadius = "5px";
    progressFill.style.background = coin.trendScore > 70 ? "#2ea043" : coin.trendScore > 40 ? "#f0ad4e" : "#f85149";

    progressBar.appendChild(progressFill);

    scoreWrapper.appendChild(scoreLabel);
    scoreWrapper.appendChild(progressBar);

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "🐦 Share on Twitter";
    shareBtn.onclick = () => {
      const tweetText = encodeURIComponent(`New memecoin idea: ${coin.coinName} 🚀 Trend Score: ${coin.trendScore}/100 #Trendcoin`);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(coin.url)}`;
      window.open(tweetUrl, "_blank");
    };

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(scoreWrapper);
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
