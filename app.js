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

    posts.forEach(meme => {
      const card = document.createElement("div");
      card.className = "meme-card";

      card.innerHTML = `
        <h3>${meme.title}</h3>
        ${meme.image ? `<img src="${meme.image}" alt="${meme.title}" />` : ""}
        <p>👍 ${meme.ups} | 💬 ${meme.comments}</p>
        <a href="${meme.permalink}" target="_blank">View on Reddit</a>
      `;

      // Add "Turn into Coin" button
      const button = document.createElement("button");
      button.className = "coin-btn";
      button.textContent = "🪙 Turn into Coin";

      button.addEventListener("click", () => {
        const coinName = meme.title.split(" ")[0];
        const ticker = "$" + coinName.toUpperCase().slice(0, 5);

        // Create or replace coin info div
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
        `;
      });

      card.appendChild(button);
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
