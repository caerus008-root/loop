const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// Initialize Gemini API (API key provided by Render environment variables)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-1.5-flash for free tier usage
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Serve the index.html file from the same directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { history, message } = req.body;
        
        // Start chat with context/history
        const chat = model.startChat({
            history: history ||[],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        
        res.json({ text: response.text() });
    } catch (error) {
        console.error("Error connecting to Gemini:", error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
