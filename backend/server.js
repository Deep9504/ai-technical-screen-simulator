const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middleware to allow React to talk to this server
app.use(cors());
app.use(express.json());

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The route that handles the chat history
app.post('/api/chat', async (req, res) => {
  try {
    const { history } = req.body;

    // 1. Map the React history format to the Gemini format
    const formattedContents = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 2. Call Gemini with System Instructions to set the persona
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: `You are a strict but fair Senior Software Engineering Interviewer. 
        The user is interviewing for a Full-Stack developer role. 
        Ask ONE technical question at a time. Wait for the user to answer. 
        Evaluate their answer, correct any mistakes, and then ask the next question. 
        Do not provide the answer before they attempt it.`
      }
    });

    // 3. Send the AI's reply back to React
    res.json({ reply: response.text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});