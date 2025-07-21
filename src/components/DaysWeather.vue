<template>
  <div class="days-weather-container d-flex justify-content-around mt-4 mb-4">
    <div
      v-for="(dayForecast, index) in dailyForecasts"
      :key="index"
      class="card day-card text-center p-3 mx-2"
    >
      <p class="mb-1 day-name">{{ dayForecast.day }}</p>
      <img :src="dayForecast.iconUrl" alt="Weather Icon" class="weather-icon mx-auto d-block" />
      <p class="mb-0 temp-day">{{ Math.round(dayForecast.temp) }}&deg;</p>
      <small>{{ dayForecast.description }}</small>
    </div>
    <div v-if="!forecast || dailyForecasts.length === 0" class="text-light">
      <p>Loading 5-day forecast...</p>
    </div>
    <div v-else-if="forecast && dailyForecasts.length === 0" class="text-light col-12 text=-center">
        <p>No forecast data available for this city.</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DaysWeather',
  props: {
    forecast: Object, // Accept the forecast data as a prop
  },
    data() {
       return {
         dailyForecasts: [],
        };
    },
    watch: {
        forecast: {
         immediate: true,
            handler(newForecast) {
              this.dailyForecasts = []; // Clear previous forecasts
                if (newForecast && newForecast.list) {
                 const processedForecasts = this.processForecastData(newForecast);
                 this.dailyForecasts = processedForecasts;
                }
            },
        },
    },
    methods: {
        processForecastData(forecastData) {
         const dailyDataMap = new Map(); // Use a Map to maintain insertion order if needed, or simply store objects
         const timezoneOffsetSeconds = forecastData.city.timezone;

         // Get the current day in city's local time (e.g., 'Thursday')
         const now = new Date();
         const currentUtcTimestampMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
         const currentCityDate = new Date(currentUtcTimestampMs + (timezoneOffsetSeconds * 1000));
         const currentDayString = currentCityDate.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });

            forecastData.list.forEach(item => {
             const utc_timestamp_ms = item.dt * 1000;
             const city_date = new Date(utc_timestamp_ms + (timezoneOffsetSeconds * 1000));

             const dayKey = city_date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' }); // e.g., "7/18/2025"
             const dayName = city_date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Thu"
             const hour = city_date.getHours();

             // Skip the current day's forecast, as it's shown in the main card.
             // Or, if you want to include today but starting from the next full forecast point, adjust logic.
                if (dayKey === currentDayString) {
                 return; // Skip today's entries
                }

             // Only add if we haven't already captured a forecast for this specific day (dayKey)
             // AND ideally, we pick a midday forecast (12 PM - 3 PM) for better daily representation
                if (!dailyDataMap.has(dayKey)) {
                    // First entry for this new day
                    dailyDataMap.set(dayKey, {
                     day: dayName,
                     date: city_date, // Store the full date object for sorting
                     temp: item.main.temp,
                     description: item.weather[0].description,
                     iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                    });
                }   else {
                     // If we already have an entry for the day, check if current item is closer to midday or better representative
                     // This is optional, but helps pick more meaningful daily forecasts
                     const existingEntry = dailyDataMap.get(dayKey);
                     const existingHourDiff = Math.abs(existingEntry.date.getHours() - 14); // How far from 2PM
                     const currentHourDiff = Math.abs(hour - 14); // How far from 2PM
                    
                        if (currentHourDiff < existingHourDiff) { // If current item is closer to 2 PM
                            dailyDataMap.set(dayKey, {
                             day: dayName,
                             date: city_date,
                             temp: item.main.temp,
                             description: item.weather[0].description,
                             iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                            });
                        }
                    }
            });

         // Convert Map values to an array and sort by date
         const forecastArray = Array.from(dailyDataMap.values());

         // Sort chronologically by the 'date' property
         forecastArray.sort((a, b) => a.date.getTime() - b.date.getTime());

         // Return the first 4 (or desired number) of upcoming days
         return forecastArray.slice(0, 4);
        },
    },
});
</script>

<style scoped>
/* ... (your existing styles for .days-weather-container, .day-card, etc.) ... */
.days-weather-container {
  width: 100%;
  max-width: 600px; /* Match your table's max-width for alignment */
  margin: 20px auto; /* Center the container */
  justify-content: space-around; /* Distribute cards evenly */
}

.day-card {
  background-color: #3b4252 !important; /* Darker background for distinction */
  color: #fff;
  border-radius: 10px;
  min-width: 90px; /* Adjust card width */
  max-width: 120px;
  flex: 1; /* Allow cards to grow/shrink */
  margin: 0 5px; /* Space between cards */
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Space out content vertically */
  align-items: center; /* Center content horizontally */
}

.day-card:hover {
  transform: translateY(-5px); /* Slight lift on hover */
  transition: transform 0.2s ease-in-out;
}

.day-name {
  font-weight: bold;
  font-size: 1.1em;
}

.weather-icon {
  width: 60px; /* Adjust icon size */
  height: 60px;
}

.temp-day {
  font-size: 1.4em;
  font-weight: 600;
  margin-top: 5px;
  margin-bottom: 5px;
}

small {
  font-size: 0.8em;
  text-align: center;
}
</style>