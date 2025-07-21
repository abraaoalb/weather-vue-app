<template>
  <div id="app" class="container text-center mt-5">
    <h1 class="text-light mb-5">Welcome to your Weather App!</h1>
    <div class="d-flex justify-content-center align-items-center mb-4"></div>
    <br>
    <Weather :city="selectedCity"></Weather>
  </div>
</template>

<script>

import { defineComponent } from 'vue';
import Weather from './components/Weather.vue';

export default defineComponent({
  name: 'App',
  components:{
    Weather
  },
  data(){
    return{
      selectedCity: null
    }
  },
  methods:{
    
  }
})
</script>

<style>
/* Global body styles to ensure the entire page content is centered */
body {
  background-color: #121212 !important;
  display: flex; /* Make body a flex container */
  justify-content: center; /* Center content horizontally */
  align-items: flex-start; /* Align content to the top vertically (change to 'center' for full vertical centering) */
  min-height: 100vh; /* Ensure body takes full viewport height for centering to work */
  margin: 0; /* Remove default browser margin on body */
  width: 100%; /* Ensure body takes full width */
}

/* Target the root #app element where Vue mounts */
#app {
  width: 100%; /* Ensure it takes full width within the body's flex context */
  max-width: 960px; /* Apply a max-width to the overall app content, similar to Bootstrap's 'lg' container */
  /* You can add a background to #app if you want a box around your centered content */
}

/* Your custom styles */
.header { /* This class is not currently used in your template's HTML */
  background-color: #212730;
  border-radius: 20px;
  color: #fff;
  text-align: center;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  margin-top: 5rem;
}

.btn-search {
  background-image: linear-gradient(to right, cyan, magenta);
}


</style>
