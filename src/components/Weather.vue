<template>
  <div class="card-1">
    <div class="header">
      <div class="d-flex">
        <input
          type="search"
          v-model="searchQuery"
          @keyup.enter="getWeather"
          placeholder="Enter City"
          class="form-control me-2"
          id="searchCity"
        />
      </div>
    </div>

    <div v-if="weatherData" class="weather-data">
      <div class="top-section">
        <p class="city-name">{{ weatherData.name }}, {{ weatherData.sys.country }}</p>
        <p class="date-time">{{ cityLocalDay }}, {{ cityLocalFullDate }}</p>
        <p class="time">{{ cityLocalTime }}</p>
        <div class="weather-info">
          <p class="temperature">{{ Math.round(weatherData.main.temp) }}°C</p>
          <p class="description">{{ weatherData.weather[0].description }}</p>
        </div>
      </div>

      <div class="bottom-section">
        <div class="details">
          <div class="detail-item">
            <p>Sea Level</p>
            <p>{{ weatherData.main.sea_level || 'N/A' }}</p>
          </div>
          <div class="detail-item">
            <p>Humidity</p>
            <p>{{ weatherData.main.humidity }}%</p>
          </div>
          <div class="detail-item">
            <p>Wind Speed</p>
            <p>{{ weatherData.wind.speed }} m/s</p>
          </div>
        </div>
      </div>

      <DaysWeather :forecast="forecastData" />

      <div v-if="forecastData && forecastData.list && forecastData.list.length > 0">
          <ForecastChart :forecast="forecastData" />
      </div>

    </div>

    <div v-else-if="searchQuery.length > 0 && !weatherData && !error" class="text-light loading-state">
        <p>Loading weather data...</p>
    </div>

    <div v-else-if="searchQuery.length === 0 && !weatherData && !error" class="text-light loading-state">
        <p>Please enter a city name to get weather information.</p>
    </div>

    <div v-if="error" class="error-message">
        <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { defineComponent } from 'vue';
import DaysWeather from './DaysWeather.vue';
import ForecastChart from './ForecastChart.vue';

// --- GIF Imports: Ensure these are using 'import' and are at the top ---
import sunnyGif from '@/assets/gifs/sunny.gif';
import cloudyGif from '@/assets/gifs/cloudy.gif';
import rainyGif from '@/assets/gifs/rainy.gif';
import drizzlyGif from '@/assets/gifs/drizzly.gif';
import stormyGif from '@/assets/gifs/stormy.gif';
import snowyGif from '@/assets/gifs/snowy.gif';
import mistyGif from '@/assets/gifs/misty.gif';
import smokyGif from '@/assets/gifs/smoky.gif';
import foggyGif from '@/assets/gifs/foggy.gif';
import sandyGif from '@/assets/gifs/sandy.gif';
import ashyGif from '@/assets/gifs/ashy.gif';
import dustyGif from '@/assets/gifs/dusty.gif';
import tornadoGif from '@/assets/gifs/tornado.gif';
import earthGif from '@/assets/gifs/earth.gif'; // Your default fallback GIF

// No global debounceTimer needed if API call is only on Enter via getWeather()

export default defineComponent({
  name: 'myWeather',
  components: {
    DaysWeather,
    ForecastChart
  },
  props: {
    
  },
  data() {
    return {
      searchQuery: '', // Set to empty string for initial load without a default city
      weatherData: null,
      forecastData: null,
      error: null,
      weatherGifs: {
        'Clear': sunnyGif,
        'Clouds': cloudyGif,
        'Rain': rainyGif,
        'Drizzle': drizzlyGif,
        'Thunderstorm': stormyGif,
        'Snow': snowyGif,
        'Mist': mistyGif,
        'Smoke': smokyGif,
        'Haze': mistyGif,
        'Fog': foggyGif,
        'Sand': sandyGif,
        'Dust': dustyGif,
        'Ash': ashyGif,
        'Squall': stormyGif,
        'Tornado': tornadoGif,
        'default': earthGif // Fallback GIF
      }
    };
  },

  computed: {
    cityLocalTime() {
      if (!this.weatherData || typeof this.weatherData.timezone === 'undefined') {
        return '';
      }
      const utc_timestamp_ms = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000);
      const city_timestamp_ms = utc_timestamp_ms + (this.weatherData.timezone * 1000);
      const city_date = new Date(city_timestamp_ms);
      return city_date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    },
    cityLocalDay() {
      if (!this.weatherData || typeof this.weatherData.timezone === 'undefined') {
        return '';
      }
      const utc_timestamp_ms = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000);
      const city_timestamp_ms = utc_timestamp_ms + (this.weatherData.timezone * 1000);
      const city_date = new Date(city_timestamp_ms);
      return city_date.toLocaleDateString('en-US', { weekday: 'long' });
    },
    cityLocalFullDate() {
      if (!this.weatherData || typeof this.weatherData.timezone === 'undefined') {
        return '';
      }
      const utc_timestamp_ms = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000);
      const city_timestamp_ms = utc_timestamp_ms + (this.weatherData.timezone * 1000);
      const city_date = new Date(city_timestamp_ms);
      return city_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    },

    dynamicBackground() {
      if (this.weatherData && this.weatherData.weather && this.weatherData.weather[0]) {
        const weatherMain = this.weatherData.weather[0].main;
        if (this.weatherGifs[weatherMain]) {
          return `url(${this.weatherGifs[weatherMain]})`;
        }
      }
      return `url(${this.weatherGifs['default']})`;
    }
  },

  methods: {
    // This method is now solely responsible for triggering the API call
    // when the Enter key is pressed in the search input.
    async getWeather() {
        const newCity = this.searchQuery;

        if (!newCity || newCity.trim() === '') {
            console.log('Search query is empty or just whitespace. Not fetching.');
            // Optionally clear data if input is made empty and Enter is pressed
            this.weatherData = null;
            this.forecastData = null;
            this.error = null;
            document.body.style.backgroundImage = `url(${earthGif})`;
            return; // Do not proceed with API call if input is empty
        }

        try {
            console.log('Fetching weather for city on Enter:', newCity);
            this.error = null; // Clear previous errors before new fetch

            // --- Calling your Backend Proxy Service ---
            // IMPORTANT: Ensure your Node.js backend is running on port 8081.
            const backendResponse = await axios.get(`http://localhost:8081/api/weather/${newCity}`, {
                /*timeout: 5000 // Set a timeout for the request (5 seconds)*/
            });

            // Update weatherData and forecastData from the backend's combined response
            this.weatherData = backendResponse.data.currentWeather;
            this.forecastData = backendResponse.data.forecast;

            // Update background based on fetched weather
            document.body.style.backgroundImage = this.dynamicBackground;

            console.log('Backend Response Data (Current Weather):', this.weatherData);
            console.log('Backend Response Data (Forecast):', this.forecastData);

        } catch(err) {
            console.error('Error fetching data from backend for', newCity, ':', err);
            // Handle errors coming from your backend or network issues
            if (err.response && err.response.data && err.response.data.message) {
                // Error message from our backend (e.g., "City not found")
                this.error = err.response.data.message;
            } else if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
                // Axios timeout or general network error
                this.error = 'Could not connect to backend server or request timed out. Please ensure the backend is running and reachable.';
            } else {
                // Any other unexpected error
                this.error = 'An unexpected error occurred while fetching weather.';
            }
            this.weatherData = null; // Clear data on error
            this.forecastData = null; // Clear forecast on error
            document.body.style.backgroundImage = `url(${earthGif})`; // Set default background on error
        }
    }
  },

  watch: {
    // This watch now only handles clearing the UI when the searchQuery becomes empty.
    // It does NOT trigger API calls. API calls are exclusively via getWeather() on Enter.
    searchQuery(newCity){
        if (!newCity || newCity.trim() === '') {
            console.log('Search query is empty or just whitespace. Clearing data.');
            this.weatherData = null;
            this.forecastData = null;
            this.error = null;
            document.body.style.backgroundImage = `url(${earthGif})`;
            return;
        }
        // No API call or debounce logic here anymore for live search
    }
  },

  mounted() {
    // Set initial background. No initial API call here as we want Enter-only search.
    document.body.style.backgroundImage = `url(${this.weatherGifs['default']})`;
  }
});
</script>

<style> /* No 'scoped' here if applying to body/html */
/* IMPORTANT: Apply these styles in your main App.vue or a global CSS file, or remove 'scoped' */
/* from this style block if you want it to affect the body element */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  transition: background-image 1s ease-in-out; /* Smooth transition for background changes */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif; /* Example font */
}
</style>

<style scoped> /* This is for styles specific to Weather.vue component */
.card-1 {
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent background for the card */
  border-radius: 15px;
  padding: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 500px; /* Adjust as needed */
  margin: auto; /* Center the card */
}

.header {
  margin-bottom: 20px;
}

.d-flex {
  display: flex;
  justify-content: center; /* Center the search input */
}

.form-control {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 25px;
  text-align: center;
  width: 80%; /* Adjust width of the input field */
  max-width: 300px; /* Max width for input */
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.weather-data {
  margin-top: 20px;
}

.top-section {
  margin-bottom: 20px;
}

.city-name {
  font-size: 2.2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.date-time {
  font-size: 1.1em;
  opacity: 0.8;
}

.time {
  font-size: 1.8em;
  font-weight: bold;
  margin-top: 10px;
}

.weather-info .temperature {
  font-size: 4em;
  font-weight: bold;
  margin: 15px 0 5px;
}

.weather-info .description {
  font-size: 1.5em;
  text-transform: capitalize;
  opacity: 0.9;
}

.bottom-section {
  margin-top: 30px;
}

.details {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 20px;
}

.detail-item {
  text-align: center;
  flex: 1; /* Distribute space evenly */
  padding: 0 5px; /* Add some padding */
}

.detail-item p:first-child {
  font-size: 0.9em;
  opacity: 0.7;
  margin-bottom: 5px;
}

.detail-item p:last-child {
  font-size: 1.2em;
  font-weight: bold;
}

.loading-state, .error-message {
  padding: 20px;
  font-size: 1.2em;
  color: white;
  text-align: center;
  min-height: 150px; /* Ensure some height for consistency */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>