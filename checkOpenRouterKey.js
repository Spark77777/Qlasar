const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

if (!OPENROUTER_KEY) {
  console.error("❌ No OpenRouter API key found in environment variables.");
  process.exit(1);
}

(async () => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("✅ OpenRouter Key Status:\n", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error checking key:", err.message);
  }
})();
