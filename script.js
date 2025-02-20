document.addEventListener("DOMContentLoaded", () => {
    const weatherSection = document.getElementById("weather");
    const weatherContent = document.getElementById("weather-content"); // New target
    const newsSection = document.getElementById("news");
    const newsContent = document.getElementById("news-content");
    const newsCountry = document.getElementById("news-country");
    const newsCategory = document.getElementById("news-category");
    const weatherApiKey = "0c47cd3fae85aaa9ae678aeda7dce305";
    const openCageApiKey = "bc0eaeb72bd84c7e8b5c9084fd979fba";
    const newsApiKey = "00f830d4d3ab417f86dc71daea685c34";

    console.log("DOM loaded, initializing...");

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Geolocation success:", latitude, longitude);
                fetch(`/geocode/json?q=${latitude}+${longitude}&key=${openCageApiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results.length > 0) {
                            const city = data.results[0].components.city || data.results[0].components.town || "Unknown";
                            console.log("City detected:", city);
                            fetchWeatherForecast(city);
                            fetchNews(newsCountry.value, newsCategory.value);
                        } else {
                            console.log("No location results, using defaults");
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
                weatherContent.innerHTML = "<p>Location access denied. Using default.</p>";
                fetchDefaultWeather();
                fetchDefaultNews();
            }
        );
    } else {
        console.log("Geolocation not supported");
        weatherContent.innerHTML = "<p>Geolocation not supported. Using default.</p>";
        fetchDefaultWeather();
        fetchDefaultNews();
    }

    newsCountry.addEventListener("change", () => {
        console.log("Country changed to:", newsCountry.value);
        fetchNews(newsCountry.value, newsCategory.value);
    });
    newsCategory.addEventListener("change", () => {
        console.log("Category changed to:", newsCategory.value);
        fetchNews(newsCountry.value, newsCategory.value);
    });

    function fetchWeatherForecast(city) {
        const apiUrl = `/weather/forecast?q=${city}&units=metric&appid=${weatherApiKey}`;
        console.log("Fetching weather for:", city);
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === "200") {
                    let forecastHtml = `<p><strong>Location:</strong> ${data.city.name}, ${data.city.country}</p>`;
                    const dailyData = data.list.filter((_, index) => index % 8 === 0).slice(0, 3);
                    dailyData.forEach(day => {
                        const date = new Date(day.dt * 1000).toLocaleDateString();
                        forecastHtml += `
                            <p><strong>${date}:</strong> ${day.main.temp}°C, ${day.weather[0].description}</p>
                        `;
                    });
                    weatherContent.innerHTML = forecastHtml; // Target content div
                } else {
                    weatherContent.innerHTML = "<p>Weather data not available.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching forecast:", error);
                weatherContent.innerHTML = "<p>Failed to load forecast.</p>";
            });
    }

    function fetchNews(country, category) {
        const apiUrl = `/news/top-headlines?country=${country}&category=${category}&apiKey=${newsApiKey}`;
        console.log("Fetching news for:", country, category);
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data.status === "ok" && data.articles.length > 0) {
                    let newsHtml = `<h2>Top ${category.charAt(0).toUpperCase() + category.slice(1)} News</h2>`;
                    data.articles.slice(0, 5).forEach(article => {
                        newsHtml += `
                            <p><strong>${article.title}</strong></p>
                            <p><a href="${article.url}" target="_blank">Read more</a></p>
                        `;
                    });
                    newsContent.innerHTML = newsHtml;
                } else {
                    newsContent.innerHTML = "<p>No news available for this selection.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                newsContent.innerHTML = "<p>Failed to load news. Check API key or network.</p>";
            });
    }

    function fetchDefaultWeather() {
        console.log("Fetching default weather");
        fetchWeatherForecast("Johannesburg");
    }

    function fetchDefaultNews() {
        console.log("Fetching default news");
        fetchNews(newsCountry.value, newsCategory.value);
    }
});
