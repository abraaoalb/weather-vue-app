<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
// Import the specific Chart.js components needed for a line chart
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale, // For X-axis (time labels)
  LinearScale,   // For Y-axis (temperature values)
  PointElement   // For points on the line
} from 'chart.js';

// IMPORTANT: Register the necessary Chart.js components.
// If you don't register these, the chart will not render.
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default defineComponent({
  name: 'ForecastChart',
  components: {
    Line // Make the Line chart component available in this template
  },
  props: {
    forecast: {
      type: Object, // The forecast object passed from Weather.vue
      required: true
    }
  },
  setup(props) {
    // Computed property to prepare data for the chart from the 'forecast' prop
    const chartData = computed(() => {
      // Safety check: ensure forecast data exists and has a list property
      if (!props.forecast || !props.forecast.list || props.forecast.list.length === 0) {
        return {
          labels: [],
          datasets: []
        };
      }

      // OpenWeatherMap's forecast 'list' contains data every 3 hours.
      // We'll typically show data for the next 24-48 hours for a concise chart.
      // Take the first 8-16 entries (8 entries = 24 hours, 16 entries = 48 hours).
      const dataPoints = props.forecast.list.slice(0, 16);

      // Map forecast items to chart labels (time and weekday)
      const labels = dataPoints.map(item => {
        const date = new Date(item.dt * 1000); // Convert Unix timestamp (seconds) to Date object (milliseconds)
        // Format to show Day of week and Hour (e.g., "Mon 15:00")
        // Ensure you use 'en-US' or your preferred locale for consistent formatting
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', weekday: 'short' });
      });

      // Map forecast items to temperature values
      const temperatures = dataPoints.map(item => item.main.temp);

      // Return the Chart.js data object
      return {
        labels: labels,
        datasets: [
          {
            label: 'Temperature (°C)', // Label for the dataset (shown in legend and tooltip)
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light blue-green fill color for the area under the line
            borderColor: 'rgba(75, 192, 192, 1)',     // Solid blue-green color for the line itself
            pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Color of data points
            pointBorderColor: '#fff', // Border color of data points
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
            data: temperatures, // The actual temperature data points
            fill: false,        // Do not fill the area under the line (set to 'origin' or 'start' to fill)
            tension: 0.3        // Smoothness of the line (0 for sharp corners, 0.4 for very smooth)
          }
        ]
      };
    });

    // Chart.js options for appearance and interactivity
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false, // Allows the chart to respect the height set by CSS
      plugins: {
        title: {
          display: true,
          text: 'Temperature Forecast (Next 24-48 hours)', // Chart title
          color: 'white' // Title text color
        },
        legend: {
            labels: {
                color: 'white' // Legend text color
            }
        },
        tooltip: {
            // Custom tooltip to show temperature with °C
            callbacks: {
                label: function(context) {
                    return `${context.dataset.label}: ${context.raw}°C`;
                }
            }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)' // X-axis tick label color
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)' // X-axis grid lines color (subtle white)
          }
        },
        y: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)' // Y-axis tick label color
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)' // Y-axis grid lines color (subtle white)
          }
        }
      }
    };

    return {
      chartData,    // The prepared data for the chart
      chartOptions  // The configuration options for the chart
    };
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px; /* Set a fixed height for the chart to ensure it renders correctly */
  width: 100%;
  margin-top: 30px; /* Space above the chart for separation */
  background-color: rgba(0, 0, 0, 0.3); /* Slightly darker background for the chart area */
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box; /* Include padding in the element's total width and height */
}
</style>