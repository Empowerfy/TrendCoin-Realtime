let trendData = {};
let charts = {};

function generateCoinName(title) {
  const words = title.split(/\s+/).slice(0, 2);
  const name = words.join(" ") + " Coin";
  const ticker = "$" + words.map(w => w[0].toUpperCase()).join("");
  return { name, ticker };
}

function tweetCoin(name, ticker, postLink) {
  const text = encodeURIComponent(
    `Just spotted this meme 🚀 Perfect for ${name} ${ticker} on Pump.fun!\n${postLink}\ntrendcoin.app`
  );
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
}

function isCryptoMeme(title) {
  const keywords = ["doge", "pepe", "elon", "moon", "pump", "coin", "token", "crypto", "shiba", "ape"];
  return keywords.some(k => title.toLowerCase().includes(k));
}

async function fetchSubreddit(sub) {
  const res = await fetch(`/.netlify/functions/reddit?sub=${sub}`);
  return await res.json();
}

async function loadMemes() {
  const root = document.getElementById('root');
  const subs = ["memes", "me_irl", "dankmemes", "wholesomememes", "cryptomemes"];
  try {
    const results = await Promise.all(subs.map(fetchSubreddit));

    const memes = results.flatMap(r =>
      r.data.children
        .filter(c => c.data.post_hint === "image")
        .map(c => ({
          title: c.data.title,
          url: c.data.url,
          ups: c.data.ups,
          postLink: "https://reddit.com" + c.data.permalink
        }))
    );

    const grid = document.getElementById('grid') || (() => {
      const g = document.createElement('div');
      g.id = 'grid';
      g.className = 'grid';
      root.appendChild(g);
      return g;
    })();

    const leaderboardList = document.getElementById('leaderboard-list') || (() => {
      const lb = document.createElement('div');
      lb.id = 'leaderboard';
      lb.innerHTML = "<h2>🔥 Fastest Rising Memes (Momentum)</h2><ol id='leaderboard-list'></ol>";
      root.prepend(lb);
      return document.getElementById('leaderboard-list');
    })();

    let momentumScores = [];

    memes.forEach((meme) => {
      if (!trendData[meme.postLink]) {
        trendData[meme.postLink] = [];
      }
      const history = trendData[meme.postLink];
      const prevUps = history.length > 0 ? history[history.length - 1].ups : meme.ups;
      const delta = meme.ups - prevUps;

      trendData[meme.postLink].push({ time: Date.now(), ups: meme.ups || 0 });
      momentumScores.push({ title: meme.title, delta: delta, ups: meme.ups, postLink: meme.postLink });

      let card = document.querySelector(`[data-post='${meme.postLink}']`);
      if (!card) {
        const { name, ticker } = generateCoinName(meme.title);
        const cryptoTag = isCryptoMeme(meme.title) ? '<div class="tag">🚀 Pump Candidate</div>' : '';

        card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-post', meme.postLink);
        card.innerHTML = `
          <img src="${meme.url}" alt="${meme.title}" />
          <div class="info">
            <h2 style="font-size:1rem;margin-bottom:8px;">${meme.title}</h2>
            ${cryptoTag}
            <a href="${meme.postLink}" target="_blank" style="color:#4fc3f7;">View on Reddit</a><br/>
            <button onclick="showCoin('${meme.title.replace(/'/g, "")}', this)">Turn into Coin 🚀</button>
            <div class="coin-result"></div>
            <button class="tweet-btn" onclick="tweetCoin('${name}', '${ticker}', '${meme.postLink}')">Tweet This 📢</button>
            <canvas id="chart-${btoa(meme.postLink)}"></canvas>
          </div>`;
        grid.appendChild(card);

        const ctx = card.querySelector(`#chart-${btoa(meme.postLink)}`).getContext('2d');
        charts[meme.postLink] = new Chart(ctx, {
          type: 'line',
          data: {
            labels: trendData[meme.postLink].map(d => new Date(d.time).toLocaleTimeString()),
            datasets: [{
              data: trendData[meme.postLink].map(d => d.ups),
              borderColor: '#4fc3f7',
              fill: false,
              tension: 0.3
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { point: { radius: 0 } }
          }
        });
      } else {
        const chart = charts[meme.postLink];
        if (chart) {
          chart.data.labels.push(new Date().toLocaleTimeString());
          chart.data.datasets[0].data.push(meme.ups);
          chart.update();
        }
      }
    });

    momentumScores = momentumScores.filter(m => m.delta > 0);
    momentumScores.sort((a, b) => b.delta - a.delta);
    leaderboardList.innerHTML = "";
    momentumScores.slice(0, 5).forEach((m, i) => {
      const li = document.createElement('li');
      li.textContent = `${m.title} — +${m.delta} (now ${m.ups} upvotes)`;
      leaderboardList.appendChild(li);
    });

    const viralRoot = document.getElementById('viral-root');
    viralRoot.innerHTML = "<h2>📈 Today’s Viral Top 3</h2>";
    const viralGrid = document.createElement('div');
    viralGrid.className = "grid";
    momentumScores.slice(0, 3).forEach(entry => {
      const cryptoTag = isCryptoMeme(entry.title) ? '<div class="tag">🚀 Pump Candidate</div>' : '';
      const card = document.createElement('div');
      card.className = "card";
      card.innerHTML = `
        <div class="info">
          <h3>${entry.title}</h3>
          ${cryptoTag}
          <p>${entry.ups} upvotes</p>
          <a href="${entry.postLink}" target="_blank" style="color:#4fc3f7;">View on Reddit</a>
        </div>`;
      viralGrid.appendChild(card);
    });
    viralRoot.appendChild(viralGrid);

  } catch (err) {
    root.innerHTML = '<p style="color:red;">⚠️ Failed to load memes.</p>';
    console.error(err);
  }
}

function showCoin(title, btn) {
  const { name, ticker } = generateCoinName(title);
  btn.nextElementSibling.innerHTML = `<strong>${name}</strong> → ${ticker}`;
}

loadMemes();
setInterval(loadMemes, 10000);