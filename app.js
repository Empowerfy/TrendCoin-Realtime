const API_URL = '/.netlify/functions/reddit';

// Elements
const memesContainer = document.getElementById('memes');
const leaderboardContainer = document.getElementById('leaderboard');
const trendingContainer = document.getElementById('trending');
const errorMessage = document.getElementById('error-message');

let allMemes = [];

// Utility: Generate a coin name + ticker
function generateCoinName(title) {
  const words = title.split(" ");
  const mainWord = words[0].replace(/[^a-zA-Z]/g, "");
  const ticker = "$" + mainWord.slice(0, 5).toUpperCase();
  return `${mainWord} Coin → ${ticker}`;
}

// Render memes
function renderMemes(memes) {
  memesContainer.innerHTML = '';
  memes.forEach(meme => {
    const card = document.createElement('div');
    card.className = 'meme-card';
    card.innerHTML = `
      <img src="${meme.url}" alt="${meme.title}" />
      <h3>${meme.title}</h3>
      <p>👍 ${meme.ups}</p>
      <a href="https://reddit.com${meme.permalink}" target="_blank">View on Reddit</a>
      <button class="coin-btn">Turn into Coin 🚀</button>
    `;

    // Add coin generator button
    card.querySelector('.coin-btn').addEventListener('click', () => {
      alert(generateCoinName(meme.title));
    });

    memesContainer.appendChild(card);
  });
}

// Render leaderboard (top 5 memes)
function renderLeaderboard(memes) {
  const topMemes = [...memes]
    .sort((a, b) => b.ups - a.ups)
    .slice(0, 5);

  leaderboardContainer.innerHTML = `
    <h2>🔥 Pump.fun Leaderboard Predictions</h2>
    <ul>
      ${topMemes.map(m => `<li>${m.title} — ${m.ups} upvotes</li>`).join('')}
    </ul>
  `;
}

// Render fastest rising memes (last 3 with highest growth)
function renderTrending(memes) {
  const rising = [...memes]
    .sort((a, b) => b.ups - a.ups)
    .slice(0, 3);

  trendingContainer.innerHTML = `
    <h2>📈 Fastest Rising Memes</h2>
    <ul>
      ${rising.map(m => `<li>${m.title} — ${m.ups} upvotes</li>`).join('')}
    </ul>
  `;
}

// Fetch memes from Netlify function
async function fetchMemes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch memes");
    const data = await res.json();

    // Save all memes
    allMemes = data;

    // Render
    renderMemes(allMemes);
    renderLeaderboard(allMemes);
    renderTrending(allMemes);

    errorMessage.style.display = "none";
  } catch (err) {
    console.error(err);
    errorMessage.style.display = "block";
    errorMessage.innerText = "⚠️ Failed to load memes.";
  }
}

// Live updates every 10 seconds
setInterval(fetchMemes, 10000);

// Initial load
fetchMemes();