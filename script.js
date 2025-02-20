document.addEventListener("DOMContentLoaded", () => {
    const weatherSection = document.getElementById("weather");
    const newsSection = document.getElementById("news");
    const newsCategory = document.getElementById("news-category");
    const weatherApiKey = "0c47cd3fae85aaa9ae678aeda7dce305"; // OpenWeatherMap
    const openCageApiKey = "bc0eaeb72bd84c7e8b5c9084fd979fba"; // OpenCage
    const newsApiKey = "00f830d4d3ab417f86dc71daea685c34"; // NewsAPI key

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageApiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results.length > 0) {
                            const city = data.results[0].components.city || data.results[0].components.town || "Unknown";
                            const country = data.results[0].components.country_code.toUpperCase();
                            fetchWeatherForecast(city);
                            fetchNews(country, newsCategory.value);
                        } else {
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
                weatherSection.innerHTML = "<p>Location access denied. Using default.</p>";
                fetchDefaultWeather();
                fetchDefaultNews();
            }
        );
    } else {
        weatherSection.innerHTML = "<p>Geolocation not supported. Using default.</p>";
        fetchDefaultWeather();
        fetchDefaultNews();
    }

    // Update news when category changes
    newsCategory.addEventListener("change", () => {
        fetchNews(getCountryFromWeather(), newsCategory.value);
    });

    function fetchWeatherForecast(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${weatherApiKey}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === "200") {
                    let forecastHtml = `<p><strong>Location:</strong> ${data.city.name}, ${data.city.country}</p>`;
                    // Show next 3 days (every 24 hours)
                    const dailyData = data.list.filter((_, index) => index % 8 === 0).slice(0, 3);
                    dailyData.forEach(day => {
                        const date = new Date(day.dt * 1000).toLocaleDateString();
                        forecastHtml += `
                            <p><strong>${date}:</strong> ${day.main.temp}°C, ${day.weather[0].description}</p>
                        `;
                    });
                    weatherSection.innerHTML = forecastHtml;
                } else {
                    weatherSection.innerHTML = "<p>Weather data not available.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching forecast:", error);
                weatherSection.innerHTML = "<p>Failed to load forecast.</p>";
            });
    }

    function fetchNews(country, category) {
        const apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${newsApiKey}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ok" && data.articles.length > 0) {
                    let newsHtml = `<h2>Top ${category.charAt(0).toUpperCase() + category.slice(1)} News</h2>`;
                    data.articles.slice(0, 5).forEach(article => {
                        newsHtml += `
                            <p><strong>${article.title}</strong></p>
                            <p><a href="${article.url}" target="_blank">Read more</a></p>
                        `;
                    });
                    newsSection.innerHTML = newsHtml;
                } else {
                    newsSection.innerHTML = "<p>No news available for this category.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                newsSection.innerHTML = "<p>Failed to load news.</p>";
            });
    }

    function getCountryFromWeather() {
        const locationText = weatherSection.querySelector("p")?.textContent;
        return locationText?.match(/, ([A-Z]{2})/)?.[1] || "ZA";
    }

    function fetchDefaultWeather() {
        fetchWeatherForecast("Johannesburg");
    }

    function fetchDefaultNews() {
        fetchNews("ZA", newsCategory.value);
    }
});
