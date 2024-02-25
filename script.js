document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.querySelector('.city-input');
    const searchButton = document.querySelector(".search-btn");
    const locationButton = document.querySelector(".location-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");
    const API_KEY = "5c9982737bb5a205773575d1ecc655b2";
  
    const createWeatherCard = (cityName, weatherItem, index) => {
      const { dt_txt, main, weather, wind } = weatherItem;
      if (index === 0) {
        return `<div class="details">
                  <h2>${cityName} (${dt_txt.split(" ")[0]})</h2>
                  <h4>Temperature: ${(main.temp - 273.15).toFixed(2)}°C</h4>
                  <h4>Wind: ${wind.speed} M/S</h4>
                  <h4>Humidity: ${main.humidity}%</h4>
                </div>
                <div class="icon">
                  <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" alt="weather icon">
                  <h4>${weather[0].description}</h4>
                </div>`;
      } else {
        return `<li class="card">
                  <h3>(${dt_txt.split(" ")[0]})</h2>
                  <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" alt="weather icon">
                  <h4>Temp: ${(main.temp - 273.15).toFixed(2)}°C</h4>
                  <h4>Wind: ${wind.speed} M/S</h4>
                  <h4>Humidity: ${main.humidity}%</h4>
                </li>`;
      }
    };
  
    const getWeatherDetails = (cityName, lat, lon) => {
      const WEATHER_API_URL =` https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
          const uniqueForecastDays = [];
          const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
              uniqueForecastDays.push(forecastDate);
              return true;
            }
            return false;
          });
  
          currentWeatherDiv.innerHTML = createWeatherCard(cityName, fiveDaysForecast[0], 0);
          weatherCardsDiv.innerHTML = "";
          fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
              weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else {
              weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard("", weatherItem, index));
            }
          });
        })
        .catch(() => {
          alert("An error occurred while fetching the weather forecast!");
        });
    };
  
    const getCityCoordinates = () => {
      const cityName = cityInput.value.trim();
      if (!cityName) return;
      const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
      fetch(GEOCODING_API_URL)
        .then((res) => res.json())
        .then((data) => {
          if (data.length === 0) {
            alert("No coordinates found for ${cityName}");
          } else {
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
          }
        })
        .catch(() => {
          alert("An error occurred while fetching the coordinates");
        });
    };
  
    const getUserCoordinates = () => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;
          fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
              const { name } = data[0];
              getWeatherDetails(name, latitude, longitude);
            })
            .catch(() => {
              alert("An error occurred while fetching the city");
            });
        },
        error => {
          if (error.code === PERMISSION_DENIED) {
            alert("Geolocation request denied. Please reset location permission to grant access again.");
          }
        }
      );
    };
  
    locationButton.addEventListener("click", getUserCoordinates);
    searchButton.addEventListener("click", getCityCoordinates);
    cityInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        getCityCoordinates();
      }
    });
  });