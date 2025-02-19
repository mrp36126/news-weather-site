document.addEventListener("DOMContentLoaded", () => {
    const weatherSection = document.getElementById("weather");
    const newsSection = document.getElementById("news");
    const apiKey = "0c47cd3fae85aaa9ae678aeda7dce305"; // OpenWeatherMap API Key
    const openCageApiKey = "bc0eaeb72bd84c7e8b5c9084fd979fba"; // OpenCage API Key
    const newsApiKey = "bc0eaeb72bd84c7e8b5c9084fd979fba"; // NewsAPI Key

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
                if (data.articles && data.articles.length > 0) {
                    let newsHTML = "<h2>Top News</h2>";
                    data.articles.slice(0, 5).forEach(article => {
                        newsHTML += `
                            <div class='news-item'>
                                <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                                <p>${article.description || "No description available."}</p>
                            </div>
                        `;
                    });
                    newsSection.innerHTML = newsHTML;
                } else {
                    newsSection.innerHTML = "<p>No news available.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching news data:", error);
                newsSection.innerHTML = "<p>Failed to load news.</p>";
            });
    }

    function fetchDefault() {
        fetchWeather("Pretoria");
        fetchNews("za");
        fetchNews("us");
    }

    fetchDefault();
});
