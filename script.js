document.addEventListener("DOMContentLoaded", () => {
    const OPENWEATHER_API_KEY = "0c47cd3fae85aaa9ae678aeda7dce305";
    const NEWS_API_KEY = "00f830d4d3ab417f86dc71daea685c34";
    const OPENCAGE_API_KEY = "bc0eaeb72bd84c7e8b5c9084fd979fba";
    const city = "Pretoria";
    const country = "ZA";
    
    function fetchWeather() {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=${OPENWEATHER_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("weather").innerHTML = `
                    <h2>Weather Update (${city}, South Africa)</h2>
                    <p>${data.weather[0].description}, ${data.main.temp}°C</p>
                    <p>Humidity: ${data.main.humidity}% | Wind Speed: ${data.wind.speed} m/s</p>
                `;
            });
    }

    function fetchForecast() {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&units=metric&appid=${OPENWEATHER_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                let forecastHtml = "<h3>7-Day Forecast</h3>";
                for (let i = 0; i < data.list.length; i += 8) {
                    let day = new Date(data.list[i].dt_txt).toDateString();
                    forecastHtml += `<p>${day}: ${data.list[i].weather[0].description}, ${data.list[i].main.temp}°C</p>`;
                }
                document.getElementById("forecast").innerHTML = forecastHtml;
            });
    }

    function fetchNews() {
        fetch(`https://newsapi.org/v2/top-headlines?q=${city}&country=${country}&apiKey=${NEWS_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                let newsHtml = "";
                data.articles.forEach(article => {
                    newsHtml += `
                        <div class="news-item">
                            <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                            <p>${article.description || "No description available."}</p>
                        </div>
                    `;
                });
                document.getElementById("news-articles").innerHTML = newsHtml || "No news available.";
            });
    }

    function fetchTimezones() {
        const timezones = ["America/New_York", "Europe/London", "Asia/Tokyo", "Africa/Johannesburg"];
        let timeHtml = "<h3>Global Time Zones</h3>";
        timezones.forEach(zone => {
            let time = new Date().toLocaleString("en-US", { timeZone: zone });
            timeHtml += `<p>${zone}: ${time}</p>`;
        });
        document.getElementById("timezones").innerHTML = timeHtml;
    }

    fetchWeather();
    fetchForecast();
    fetchNews();
    fetchTimezones();
    setInterval(fetchTimezones, 60000);
});
