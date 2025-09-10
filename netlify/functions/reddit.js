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

    // Step 2: Fetch memes from multiple subs
    const subs = ["memes", "dankmemes", "cryptomemes"];
    const results = await Promise.all(
      subs.map(sub =>
        fetch(`https://oauth.reddit.com/r/${sub}/hot?limit=10`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "User-Agent": process.env.REDDIT_USER_AGENT,
          },
        }).then(res => res.json())
      )
    );

    // Step 3: Flatten results
    const posts = results.flatMap(r =>
      r.data?.children?.map(c => c.data) || []
    );

    return {
      statusCode: 200,
      body: JSON.stringify(posts),
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
