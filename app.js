// === Fetch memes from Netlify function ===
async function fetchMemes() {
  try {
    console.log("🔄 Fetching memes...");
    const res = await fetch("/.netlify/functions/reddit");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const posts = await res.json();
    console.log("✅ API Response:", posts);

    const memeContainer = document.getElementById("memes");
    memeContainer.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      memeContainer.innerHTML = "<p>No memes found 😢</p>";
      return;
    }

    posts.forEach(meme => {
      if (!meme.image) return; // skip posts without images

      const card = document.createElement("div");
      card.className = "meme-card";

      const coin = generateCoinName(meme.title);

      card.innerHTML = `
        <h3>${meme.title}</h3>
        <img src="${meme.image}" alt="${meme.title}" />
        <p>👍 ${meme.ups || 0} | 💬 ${meme.comments || 0}</p>
        <a href="${meme.permalink}" target="_blank">View on Reddit</a>
        <br><br>
        <button onclick="showCoinName('${meme.title.replace(/'/g, "\\'")}')">🚀 Turn into Coin</button>
        <br><br>
        <a 
          href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `🚀 Meme: ${meme.title}\n💰 Coin idea: ${coin.ticker}\n${meme.permalink}`
          )}" 
          target="_blank">
          🐦 Tweet This
        </a>
      `;

      memeContainer.appendChild(card);
    });

    // update trending scoreboard
    updateTrending(posts);

  } catch (err) {
    console.error("❌ Error fetching memes:", err);
    document.getElementById("memes").innerHTML =
      "<p>⚠️ Failed to load memes. Check console for details.</p>";
  }
}

// === Trending Scoreboard ===
function updateTrending(posts) {
  const trendingContainer = document.getElementById("trending");
  trendingContainer.innerHTML = "<h2>🔥 Trending Scoreboard</h2>";

  const top3 = [...posts]
    .filter(m => m.ups && m.comments !== undefined)
    .sort((a, b) => (b.ups / (b.comments + 1)) - (a.ups / (a.comments + 1)))
    .slice(0, 3);

  top3.forEach((meme, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>#${i + 1}</strong> ${meme.title} 
      (Momentum: ${(meme.ups / (meme.comments + 1)).toFixed(2)})
    `;
    trendingContainer.appendChild(div);
  });
}

// === Rule-Based AI Coin Name Generator ===
function generateCoinName(title) {
  const words = title.split(" ");
  const name = words.slice(0, 2).join(" ");
  const ticker = "$" + words[0].substring(0, 4).toUpperCase();
  return { name, ticker };
}

function showCoinName(title) {
  const { name, ticker } = generateCoinName(title);
  alert(`💰 Suggested Coin:\nName: ${name}\nTicker: ${ticker}`);
}

// === Auto load memes and refresh ===
fetchMemes();
setInterval(fetchMemes, 30000); // refresh every 30s
