const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const subs = ["memes", "dankmemes", "cryptomemes"];
    const results = await Promise.all(
      subs.map(sub =>
        fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`).then(res => res.json())
      )
    );

    const posts = results.flatMap(r => r.data.children.map(c => c.data));

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
