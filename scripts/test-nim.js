const fs = require('fs');

async function testNim() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const match = env.match(/NVIDIA_API_KEY="([^"]+)"/);
  if (!match) {
    console.log("No key found");
    return;
  }
  const key = match[1];
  console.log("Key starts with:", key.substring(0, 5));

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: "Say hello and return a simple JSON object: { \"message\": \"hello\" }" }],
        response_format: { type: "json_object" }
      })
    });
    
    console.log("Status:", res.status);
    console.log("Text:", await res.text());
  } catch (e) {
    console.error("Error:", e);
  }
}

testNim();
