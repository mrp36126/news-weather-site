document.addEventListener("DOMContentLoaded", () => {
    const weatherSection = document.getElementById("weather");
    const newsSection = document.getElementById("news");
    const apiKey = "0c47cd3fae85aaa9ae678aeda7dce305"; // OpenWeatherMap API Key
    const openCageApiKey = "bc0eaeb72bd84c7e8b5c9084fd979fba"; // OpenCage API Key
    const newsApiKey = "00f830d4d3ab417f86dc71daea685c34"; // NewsAPI Key

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Get city and country from OpenCage API
                fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageApiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results.length > 0) {
                            const city = data.results[0].components.city || data.results[0].components.town || "Unknown";
                            const country = data.results[0].components.country_code.toUpperCase();
                            console.log("Detected City:", city, "Country:", country); // Debugging
                            fetchWeather(city);
                            fetchNews(country);
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
            },
            (error) => {
                console.error("Geolocation error:", error);
                weatherSection.innerHTML = "<p>Location access denied. Using default city.</p>";
                fetchDefaultWeather();
                fetchDefaultNews();
            }
        );
    } else {
        weatherSection.innerHTML = "<p>Geolocation not supported. Using default city.</p>";
        fetchDefaultWeather();
        fetchDefaultNews();
    }

    function fetchWeather(city) {
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
                    weatherSection.innerHTML = weatherInfo;
                } else {
                    weatherSection.innerHTML = "<p>Weather data not available.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                weatherSection.innerHTML = "<p>Failed to load weather.</p>";
            });
    }

    function fetchNews(country) {
        const apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${newsApiKey}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ok" && data.articles.length > 0) {
                    let newsHtml = "<ul>";
                    data.articles.forEach(article => {
                        newsHtml += `<li><a href="${article.url}" target="_blank"><strong>${article.title}</strong></a>  Read more`;
                    });
                    newsHtml += "</ul>";
                    newsSection.innerHTML = newsHtml;
                } else {
                    newsSection.innerHTML = "<p>No news available.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                newsSection.innerHTML = "<p>Failed to load news.</p>";
            });
    }

    function fetchDefaultWeather() {
        fetchWeather("Johannesburg");
    }

    function fetchDefaultNews() {
        fetchNews("ZA");
    }
});
