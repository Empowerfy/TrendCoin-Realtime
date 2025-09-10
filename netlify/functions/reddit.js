const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    // Step 1: Get OAuth token
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(
          process.env.REDDIT_CLIENT_ID + ":" + process.env.REDDIT_CLIENT_SECRET
        ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error("Failed to get Reddit token: " + JSON.stringify(tokenData));
    }

    const accessToken = tokenData.access_token;
    const subs = ["memes", "dankmemes", "cryptomemes"];

    // Step 2: Fetch posts from each subreddit
    const results = await Promise.all(
      subs.map(sub =>
        fetch(`https://oauth.reddit.com/r/${sub}/hot?limit=10`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "User-Agent": "trendcoin-app/0.1 by you"
          }
        }).then(res => res.json())
      )
    );

    // Step 3: Normalize response into clean JSON
    const posts = results.flatMap(r =>
      r.data?.children?.map(c => ({
        id: c.data.id,
        title: c.data.title,
        image: c.data.url_overridden_by_dest && c.data.url_overridden_by_dest.match(/\.(jpg|png|gif)$/i)
          ? c.data.url_overridden_by_dest
          : null, // only return images
        ups: c.data.ups,
        comments: c.data.num_comments,
        permalink: `https://reddit.com${c.data.permalink}`
      })) || []
    );

    // Only keep posts that have at least a title
    const cleanPosts = posts.filter(p => p.title);

    return {
      statusCode: 200,
      body: JSON.stringify(cleanPosts),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch Reddit data",
        details: err.message,
      }),
    };
  }
};
