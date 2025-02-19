document.addEventListener("DOMContentLoaded", () => {
    const weatherSection = document.getElementById("weather");
    const newsSection = document.getElementById("news");
    const weatherLoading = document.getElementById("weather-loading");
    const newsLoading = document.getElementById("news-loading");
    const weatherContent = document.getElementById("weather-content");
    const newsContent = document.getElementById("news-content");

    // Hardcoded API Keys
    const apiKey = "0c47cd3fae85aaa9ae678aeda7dce305"; // OpenWeatherMap API Key
    const openCageApiKey = "bc0eaeb72bd84c7e8b5c9084fd979fba"; // OpenCage API Key
    const newsApiKey = "00f830d4d3ab417f86dc71daea685c34"; // Updated NewsAPI Key

    if ("geolocation" in navigator) {
        navigator.permissions.query({name:'geolocation'}).then(result => {
            if (result.state === 'granted' || result.state === 'prompt') {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchLocationData(latitude, longitude);
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                        handleGeolocationError();
                    }
                );
            } else {
                handleGeolocationError();
            }
        });
    } else {
        handleGeolocationError();
    }

    function fetchLocationData(latitude, longitude) {
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageApiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    const city = data.results[0].components.city || data.results[0].components.town || "Unknown";
                    const country = data.results[0].components.country_code.toUpperCase();
                    console.log("Detected City:", city, "Country:", country);
                    fetchWeatherDebounced(city);
                    fetchNewsDebounced(country);
                } else {
                    console.error("Location not found, using default.");
                    fetchDefaultWeather();
                    fetchDefaultNews();
                }
            })
            .catch(error => {
                console.error("Error fetching location:", error);
                fetchDefaultWeather();
                fetchDefaultNews();
            });
    }

    function fetchWeather(city) {
        weatherLoading.style.display = 'block';
        weatherContent.style.display = 'none';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    const weatherInfo = `
                        <p><strong>Location:</strong> ${data.name}, ${data.sys.country}</p>
                        <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
                        <p><strong>Weather:</strong> ${data.weather[0].description}</p>
                        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                    `;
                    weatherContent.innerHTML = weatherInfo;
                } else {
                    weatherContent.innerHTML = "<p>Weather data not available.</p>";
                }
                weatherLoading.style.display = 'none';
                weatherContent.style.display = 'block';
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                weatherContent.innerHTML = "<p>Failed to load weather. Please try again later.</p>";
                weatherLoading.style.display = 'none';
                weatherContent.style.display = 'block';
            });
    }

    function fetchNews(country) {
        newsLoading.style.display = 'block';
        newsContent.style.display = 'none';
        const apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${newsApiKey}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ok" && data.articles.length > 0) {
                    let newsHtml = "<h3>Top News</h3>";
                    data.articles.slice(0, 5).forEach(article => {
                        newsHtml += `
                            <p><strong>${article.title}</strong></p>
                            <p><a href="${article.url}" target="_blank">Read more</a></p>
                        `;
                    });
                    newsContent.innerHTML = newsHtml;
                } else {
                    newsContent.innerHTML = "<p>No news available.</p>";
                }
                newsLoading.style.display = 'none';
                newsContent.style.display = 'block';
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                newsContent.innerHTML = "<p>Failed to load news. Please try again later.</p>";
                newsLoading.style.display = 'none';
                newsContent.style.display = 'block';
            });
    }

    function handleGeolocationError() {
        weatherSection.innerHTML = "<p>Location access denied or not supported. Using default city.</p>";
        fetchDefaultWeather();
        fetchDefaultNews();
    }

    function fetchDefaultWeather() {
        fetchWeather("Johannesburg");
    }

    function fetchDefaultNews() {
        fetchNews("ZA");
    }

    // Debounce function to prevent multiple API calls on rapid changes
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const fetchWeatherDebounced = debounce(fetchWeather, 500);
    const fetchNewsDebounced = debounce(fetchNews, 500);
});
