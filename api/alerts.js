// api/alerts.js
import fetch from 'node-fetch'; // if using Node.js

const NEWSAPI_KEY = process.env.NEWSAPI_KEY; // or your key

export default async function handler(req, res) {
  if (!NEWSAPI_KEY) {
    return res.json({
      alerts: [{ title: "AI breakthrough", source: "Qlasar" }],
    });
  }

  const keywords = ["startup", "AI business", "SaaS", "freelancing", "funding"];
  const query = keywords.join(" OR ");
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevance&apiKey=${NEWSAPI_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "ok") {
      return res.status(500).json({ error: "Failed to fetch news" });
    }

    const articles = data.articles.slice(0, 10).map(article => ({
      title: article.title,
      source: article.source.name,
      url: article.url,
      type: "opportunity"
    }));

    res.json({ alerts: articles });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ error: "Error fetching news" });
  }
}
