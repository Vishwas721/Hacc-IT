// File: server/checkModels.js
require('dotenv').config(); // Loads your .env file
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  try {
    console.log("--- Connecting to Google AI with your API key... ---");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // This is the command that asks Google for the list
    const models = await genAI.listModels();

    console.log("--- ✅ SUCCESS! Here are the models your key can use: ---");
    
    for await (const m of models) {
      // We only care about models that can 'generateContent'
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`Model: ${m.name}`);
      }
    }
    
    console.log("---------------------------------------------------------");
    console.log("Pick the best text and vision models from this list.");
    console.log("The text model will be something like 'models/gemini-pro' or 'models/gemini-1.5-flash-latest'");
    console.log("The vision model will be 'models/gemini-pro-vision' or similar.");
    console.log("---------------------------------------------------------");

  } catch (error) {
    console.error("--- ❌ FAILED to list models ---:", error.message);
  }
}

listAvailableModels();