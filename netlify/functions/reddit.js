const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    const subs = ["memes", "dankmemes", "cryptomemes"];
    const results = await Promise.all(
      subs.map(sub =>
        fetch(`https://old.reddit.com/r/${sub}/hot.json?limit=10`, {
          headers: {
            "User-Agent": "TrendCoinApp/1.0 (by u/yourusername)"
          }
        }).then(res => res.json())
      )
    );

    const posts = results.flatMap(r => (r.data ? r.data.children.map(c => c.data) : []));

    return {
      statusCode: 200,
      body: JSON.stringify(posts),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Reddit data", details: err.message }),
    };
  }
};
