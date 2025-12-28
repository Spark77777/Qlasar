export default function handler(req, res) {
  res.json({
    alerts: [
      { title: "AI Startup Funding Surge", summary: "Global AI funding increased this week." }
    ]
  });
}
