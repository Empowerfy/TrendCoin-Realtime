export async function handler(event, context) {
  const sub = event.queryStringParameters.sub || "memes";
  const url = `https://www.reddit.com/r/${sub}/top.json?limit=20&t=day`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Reddit data" }),
    };
  }
}