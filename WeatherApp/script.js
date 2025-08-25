// Weather Application JavaScript
class WeatherApp {
  constructor() {
    // WeatherAPI key
    this.apiKey = "dfd8adb5cf0a4052aae202623252408";
    this.apiUrl = "http://api.weatherapi.com/v1/current.json";

    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    // Get DOM elements
    this.getWeatherBtn = document.getElementById("getWeatherBtn");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.weatherDisplay = document.getElementById("weatherDisplay");
    this.errorDisplay = document.getElementById("errorDisplay");
    this.retryBtn = document.getElementById("retryBtn");

    // Weather display elements
    this.locationName = document.getElementById("locationName");
    this.locationDetails = document.getElementById("locationDetails");
    this.temperature = document.getElementById("temperature");
    this.condition = document.getElementById("condition");
    this.feelsLike = document.getElementById("feelsLike");
    this.humidity = document.getElementById("humidity");
    this.windSpeed = document.getElementById("windSpeed");
    this.visibility = document.getElementById("visibility");
    this.coordinates = document.getElementById("coordinates");
    this.errorMessage = document.getElementById("errorMessage");
  }

  bindEvents() {
    this.getWeatherBtn.addEventListener("click", () => this.getWeather());
    this.retryBtn.addEventListener("click", () => this.getWeather());
  }

  async getWeather() {
    try {
      this.showLoading();

      // Get user's current position
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Fetch weather data
      const weatherData = await this.fetchWeatherData(latitude, longitude);

      // Display weather data
      this.displayWeatherData(weatherData, latitude, longitude);
    } catch (error) {
      this.showError(error.message);
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          let errorMessage = "Unable to retrieve your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  async fetchWeatherData(latitude, longitude) {
    // Check if API key is set
    if (this.apiKey === "YOUR_API_KEY_HERE") {
      throw new Error(
        "Please set your WeatherAPI key in the script.js file. Get your free key from weatherapi.com"
      );
    }

    const url = `${this.apiUrl}?key=${this.apiKey}&q=${latitude},${longitude}&aqi=no`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your WeatherAPI key.");
        } else if (response.status === 400) {
          throw new Error("Invalid location coordinates.");
        } else {
          throw new Error(`Weather service error: ${response.status}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === "TypeError") {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      }
      throw error;
    }
  }

  displayWeatherData(data, latitude, longitude) {
    const { location, current } = data;

    // Update location information
    this.locationName.textContent = location.name;
    this.locationDetails.textContent = `${location.country}, ${location.region}`;

    // Update temperature information
    this.temperature.textContent = Math.round(current.temp_c);
    this.condition.textContent = current.condition.text;

    // Update weather details
    this.feelsLike.textContent = `${Math.round(current.feelslike_c)}°C`;
    this.humidity.textContent = `${current.humidity}%`;
    this.windSpeed.textContent = `${current.wind_kph} km/h`;
    this.visibility.textContent = `${current.vis_km} km`;

    // Update coordinates
    this.coordinates.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(
      4
    )}`;

    // Show weather display
    this.showWeatherDisplay();
  }

  showLoading() {
    this.hideAllDisplays();
    this.loadingSpinner.classList.remove("hidden");
    this.getWeatherBtn.disabled = true;
  }

  showWeatherDisplay() {
    this.hideAllDisplays();
    this.weatherDisplay.classList.remove("hidden");
    this.getWeatherBtn.disabled = false;
  }

  showError(message) {
    this.hideAllDisplays();
    this.errorMessage.textContent = message;
    this.errorDisplay.classList.remove("hidden");
    this.getWeatherBtn.disabled = false;
  }

  hideAllDisplays() {
    this.loadingSpinner.classList.add("hidden");
    this.weatherDisplay.classList.add("hidden");
    this.errorDisplay.classList.add("hidden");
  }
}

// Initialize the weather app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});

// Demo function for testing without API key

/*function loadDemoData() {
  const app = new WeatherApp();

  // Simulate demo weather data
  const demoData = {
    location: {
      name: "London",
      country: "United Kingdom",
      region: "City of London, Greater London",
    },
    current: {
      temp_c: 22,
      condition: {
        text: "Partly cloudy",
      },
      feelslike_c: 24,
      humidity: 65,
      wind_kph: 15,
      vis_km: 10,
    },
  };

  app.displayWeatherData(demoData, 51.5074, -0.1278);
} */
