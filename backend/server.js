// backend/server.js

import express from 'express';
import axios from 'axios';
import cors from 'cors'; // Import CORS middleware

const app = express();
const PORT = process.env.PORT || 8081; // Already set to 8081, good.

// --- IMPORTANT: Replace with your actual OpenWeatherMap API Key ---
// For a production app, you would use environment variables (e.g., process.env.OPENWEATHER_API_KEY)
// For this example, we'll put it directly here.
const OPENWEATHER_API_KEY = '69c66fb8b5ce3baed25fdf3a8ffeff47'; // Your API Key (from previous successful calls)

// --- Basic In-Memory Cache (Optional Feature) ---
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Middleware
app.use(cors()); // Enable CORS for all routes, allowing frontend to access
app.use(express.json()); // For parsing application/json

// --- REST API Endpoint for Weather Requests ---
// This endpoint will be called by your frontend
app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;
    const cacheKey = city.toLowerCase(); // Use lowercase city name as cache key

    // 1. Check Cache
    if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
            console.log(`[Backend] Serving "${city}" from cache.`);
            return res.json(cachedData.data);
        } else {
            console.log(`[Backend] Cache for "${city}" expired.`);
            cache.delete(cacheKey); // Remove expired entry
        }
    }

    // 2. Validate City Input (Basic)
    if (!city || city.trim() === '') {
        return res.status(400).json({ message: 'City name is required.' });
    }

    try {
        console.log(`[Backend] Fetching weather data for "${city}" from OpenWeatherMap.`);

        // Make concurrent calls to OpenWeatherMap API for current weather and forecast
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`),
            axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`)
        ]);

        // Combine or format the data as needed
        // For now, we'll return an object containing both
        const formattedData = {
            currentWeather: currentWeatherResponse.data,
            forecast: forecastResponse.data
        };

        // 3. Cache the successful response
        cache.set(cacheKey, {
            data: formattedData,
            timestamp: Date.now()
        });
        console.log(`[Backend] "${city}" data cached.`);

        // Send the formatted data back to the frontend
        res.json(formattedData);

    } catch (error) {
        console.error(`[Backend] Error fetching data for "${city}":`, error.message);

        // Handle different types of errors from OpenWeatherMap
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 404) {
                return res.status(404).json({ message: `City "${city}" not found.` });
            } else if (error.response.status === 401) {
                return res.status(401).json({ message: 'Invalid OpenWeatherMap API key or unauthorized.' });
            } else {
                return res.status(error.response.status).json({ message: `OpenWeatherMap API error: ${error.response.statusText || 'Unknown error'}` });
            }
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(500).json({ message: 'No response from OpenWeatherMap API. Network error.' });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).json({ message: `Error setting up request: ${error.message}` });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend proxy server running on http://localhost:${PORT}`);
    console.log('Frontend should now point its API calls to this address.');
}).on('error', (err) => { // <--- ADD THIS BLOCK HERE
    console.error('Failed to start backend server:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please choose a different port or stop the other process.`);
    }
});