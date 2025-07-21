```markdown
# My Weather App: A Vue & Node.js Weather Dashboard

This project is a web-based weather application built with Vue.js for the frontend and Node.js for the backend. It fetches weather data from the OpenWeatherMap API and displays current conditions, a 5-day forecast, and a temperature chart.

## Features:
* Search for weather by city.
* Display current temperature, humidity, wind speed, and sea level.
* View a 5-day weather forecast.
* Visualize temperature trends with a Chart.js graph.
* Backend proxy with caching for efficient API calls.

## Technologies Used:
* Frontend: Vue.js (with Vite), Chart.js
* Backend: Node.js, Express, Axios
* API: OpenWeatherMap

## Getting Started:

### Prerequisites:
* Node.js (LTS version recommended)
* npm (Node Package Manager)
* An OpenWeatherMap API Key (obtain one from [https://openweathermap.org/api](https://openweathermap.org/api))

### Setup:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/abraaoalb/weather-vue-app.git](https://github.com/abraaoalb/weather-vue-app.git)
    cd weather-vue-app
    ```
2.  **Backend Setup:**
    * Navigate to the backend directory:
        ```bash
        cd backend
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * **IMPORTANT:** Replace `'YOUR_OPENWEATHER_API_KEY'` in `server.js` with your actual OpenWeatherMap API Key.
        * (Currently, the key is hardcoded as `69c66fb8b5ce3baed25fdf3a8ffeff47`. For a production app, consider using environment variables.)
    * Start the backend server:
        ```bash
        node server.js
        ```
        (The server will run on `http://localhost:8081`)

3.  **Frontend Setup:**
    * Open a new terminal and navigate to the frontend directory:
        ```bash
        cd frontend
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * Start the frontend development server:
        ```bash
        npm run dev
        ```
        (The app will be available at `http://localhost:8080`)

## Usage:
1.  Ensure both backend and frontend servers are running.
2.  Open your browser to `http://localhost:8080`.
3.  Enter a city name in the search bar and press Enter.

## License:
[Optional: Add your preferred license information here, e.g., MIT License]