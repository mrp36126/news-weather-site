// Tab Switching Logic
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing tabs and weather updates...");

    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Default to Weather tab on load
    document.querySelector('.tab[data-tab="weather"]').click();

    // Fetch weather data for both Weather and Racing tabs
    console.log("Calling updateWeatherTiles...");
    updateWeatherTiles();
    console.log("Calling updateRacingWeatherTiles...");
    updateRacingWeatherTiles();
});

// Fetch Weather Data from OpenWeatherMap API
async function fetchWeather(city) {
    const apiKey = process.env.WEATHER_API_KEY || "0c47cd3fae85aaa9ae678aeda7dce305";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},ZA&appid=${apiKey}&units=metric`;

    console.log(`Fetching weather for ${city}... URL: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather data unavailable for ${city}: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`Weather data for ${city}:`, data);
        return {
            city: data.name,
            temp: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon
        };
    } catch (error) {
        console.error(`Error fetching weather for ${city}:`, error.message);
        return { city, temp: null, description: "Data unavailable", icon: null };
    }
}

// Update Weather Tiles (Weather Tab)
async function updateWeatherTiles() {
    const tiles = document.querySelectorAll('.weather-tile');
    console.log(`Found ${tiles.length} weather tiles to update.`);

    for (const tile of tiles) {
        const city = tile.getAttribute('data-city');
        const content = tile.querySelector('.weather-content');

        console.log(`Updating weather for ${city} in Weather tab...`);
        const weather = await fetchWeather(city);
        const weatherText = weather.temp !== null 
            ? `${weather.temp}°C, ${weather.description}` 
            : weather.description;

        // Update the existing weather paragraph (assumes only one <p> for weather)
        const weatherPara = content.querySelector('p');
        if (weatherPara) {
            weatherPara.innerHTML = `<strong>Current Weather in ${city}:</strong> ${weatherText}`;
            if (weather.icon) {
                const icon = document.createElement('img');
                icon.src = `https://openweathermap.org/img/wn/${weather.icon}.png`;
                icon.alt = weather.description;
                icon.className = 'weather-icon';
                weatherPara.appendChild(icon);
            }
        } else {
            console.warn(`No weather paragraph found for ${city} in Weather tab.`);
        }
    }
}

// Update Racing Tiles (Racing Tab)
async function updateRacingWeatherTiles() {
    const tiles = document.querySelectorAll('.racing-tile');
    console.log(`Found ${tiles.length} racing tiles to update.`);

    for (const tile of tiles) {
        const city = tile.getAttribute('data-city');
        const content = tile.querySelector('.racing-content');

        console.log(`Updating weather for ${city} in Racing tab...`);
        const weather = await fetchWeather(city);
        const weatherText = weather.temp !== null 
            ? `${weather.temp}°C, ${weather.description}` 
            : weather.description;

        // Replace the placeholder with the fetched weather data
        const placeholder = content.querySelector('.weather-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `<strong>Current Weather:</strong> ${weatherText}`;
            if (weather.icon) {
                const icon = document.createElement('img');
                icon.src = `https://openweathermap.org/img/wn/${weather.icon}.png`;
                icon.alt = weather.description;
                icon.className = 'weather-icon';
                placeholder.appendChild(icon);
            }
        } else {
            console.warn(`No weather placeholder found for ${city} in Racing tab.`);
        }
    }
}
