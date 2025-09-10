const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    // Step 1: Get OAuth token from Reddit
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization":
          "Basic " +
          Buffer.from(
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

    // Step 2: Subreddits to pull memes from
    const subs = ["memes", "dankmemes", "cryptomemes"];

    // Step 3: Fetch posts from each subreddit
    const results = await Promise.all(
      subs.map((sub) =>
        fetch(`https://oauth.reddit.com/r/${sub}/hot?limit=10`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "TrendcoinApp/1.0",
          },
        }).then((res) => res.json())
      )
    );

    // Step 4: Extract only the fields we need
    const posts = results.flatMap((r) =>
      r.data?.children?.map((c) => ({
        id: c.data.id,
        title: c.data.title,
        image: c.data.url_overridden_by_dest || c.data.thumbnail,
        ups: c.data.ups,
        comments: c.data.num_comments,
        permalink: `https://reddit.com${c.data.permalink}`,
      })) || []
    );

    return {
      statusCode: 200,
      body: JSON.stringify(posts),
    };
  } catch (err) {
    console.error("Reddit fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch Reddit data",
        details: err.message,
      }),
    };
  }
};
