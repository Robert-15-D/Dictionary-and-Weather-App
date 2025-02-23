// Import necessary packages
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';  // Or 'import fetch from 'node-fetch';' if using ES module
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';  // Import the path module

// Fix __dirname in ESM 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create an instance of the Express app
const app = express();

// Enable CORS for cross-origin requests
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the port where the server will listen for requests
const PORT = process.env.PORT || 5000;

// Weather API Endpoint
app.get("/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }

    try {
        // Get the API key from environment variables
        const apiKey = process.env.WEATHER_API_KEY;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        
        // Handle fetch error if response is not OK
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
    
        // Parse the response data into JSON format
        const data = await response.json();
    
        // If city is not found, return 404 error
        if (data.cod !== 200) {
            return res.status(404).json({ error: "City not found" });
        }

        // Send the weather data to the frontend
        res.json(data);
        
    } catch (error) {
        // Log any errors that occur
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

// Serve index.html from the public folder when accessing the root path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Log message indicating the server is running and listening on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
