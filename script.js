document.addEventListener("DOMContentLoaded", () => {
    const weatherSection = document.getElementById("weather");
    const weatherContent = document.querySelectorAll('.weather-content');
    const racingSection = document.getElementById("racing");
    const racingContent = document.querySelectorAll('.racing-content');
    const newsSection = document.getElementById("news");
    const newsContent = document.getElementById("news-content");
    const newsCountry = document.getElementById("news-country");
    const newsCategory = document.getElementById("news-category");
    const f1Section = document.getElementById("f1");
    const f1Content = document.getElementById("f1-content");
    const ufcSection = document.getElementById("ufc");
    const ufcContent = document.getElementById("ufc-content");
    const aiSection = document.getElementById("ai-apps");
    const aiContent = document.getElementById("ai-content");
    const weatherApiKey = "0c47cd3fae85aaa9ae678aeda7dce305";
    const openCageApiKey = "bc0eaeb72bd84c7e8b5c9084fd979fba";
    const newsApiKey = "cd0036d802097242c095659ca9f8873b";

    // Tab switching logic
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            const tabId = tab.getAttribute('data-tab');
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Trigger content load for the active tab
            if (tabId === 'weather') fetchDefaultWeather();
            else if (tabId === 'racing') fetchDefaultRacing();
            else if (tabId === 'news') fetchDefaultNews();
            else if (tabId === 'f1') fetchDefaultF1();
            else if (tabId === 'ufc') fetchDefaultUFC();
        });
    });

    // Set default active tab (Weather)
    tabs[0].click();

    // Mouseover outline color effect for header letters
    const letters = document.querySelectorAll('.letter');
    const outlineColors = ['#ff6f61', '#6b5b95', '#88b04b', '#f7cac9', '#92a8d1']; // Sample color palette

    letters.forEach(letter => {
        letter.addEventListener('mouseover', () => {
            const randomColor = outlineColors[Math.floor(Math.random() * outlineColors.length)];
            letter.style.webkitTextStroke = `1px ${randomColor}`;
            letter.style.textStroke = `1px ${randomColor}`;
        });
        letter.addEventListener('mouseout', () => {
            letter.style.webkitTextStroke = '1px #ffffff'; // Reset to default white outline
            letter.style.textStroke = '1px #ffffff';
        });
    });

    // Geolocation and initial data fetch
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
                            fetchRacingWeather(city);
                            fetchNews(newsCountry.value, newsCategory.value);
                            fetchF1Races();
                            fetchUFCEvents();
                        } else {
                            console.log("No location results, using defaults");
                            fetchDefaultWeather();
                            fetchDefaultRacing();
                            fetchDefaultNews();
                            fetchDefaultF1();
                            fetchDefaultUFC();
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching location:", error);
                        fetchDefaultWeather();
                        fetchDefaultRacing();
                        fetchDefaultNews();
                        fetchDefaultF1();
                        fetchDefaultUFC();
                    });
            },
            (error) => {
                console.error("Geolocation error:", error);
                weatherContent.forEach(wc => wc.innerHTML = "<p>Location access denied. Using default.</p>");
                racingContent.forEach(rc => rc.innerHTML += "<p>Location access denied. Using default weather.</p>");
                fetchDefaultWeather();
                fetchDefaultRacing();
                fetchDefaultNews();
                fetchDefaultF1();
                fetchDefaultUFC();
            }
        );
    } else {
        console.log("Geolocation not supported");
        weatherContent.forEach(wc => wc.innerHTML = "<p>Geolocation not supported. Using default.</p>");
        racingContent.forEach(rc => rc.innerHTML += "<p>Geolocation not supported. Using default weather.</p>");
        fetchDefaultWeather();
        fetchDefaultRacing();
        fetchDefaultNews();
        fetchDefaultF1();
        fetchDefaultUFC();
    }

    newsCountry.addEventListener("change", () => {
        console.log("Country dropdown changed to:", newsCountry.value);
        fetchNews(newsCountry.value, newsCategory.value);
    });

    newsCategory.addEventListener("change", () => {
        console.log("Category dropdown changed to:", newsCategory.value);
        fetchNews(newsCountry.value, newsCategory.value);
    });

    function fetchWeatherForecast(city) {
        const cities = ['Pretoria', 'Vereeniging', 'Brakpan', 'Hermanus'];
        weatherContent.forEach((wc, index) => {
            const targetCity = cities[index];
            const apiUrl = `/weather/forecast?q=${targetCity}&units=metric&appid=${weatherApiKey}`;
            console.log(`Fetching weather for: ${targetCity}`);
            wc.innerHTML = '<div class="spinner"></div>';
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.cod === "200") {
                        let forecastHtml = `<p><strong>Location:</strong> ${data.city.name}, ${data.city.country}</p>`;
                        const dailyData = data.list.filter((_, index) => index % 8 === 0).slice(0, 3);
                        dailyData.forEach(day => {
                            const date = new Date(day.dt * 1000).toLocaleDateString();
                            forecastHtml += `
                                <p><strong>${date}:</strong> ${day.main.temp}°C, ${day.weather[0].description}
                                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="weather-icon"></p>
                            `;
                        });
                        wc.innerHTML = forecastHtml;
                    } else {
                        wc.innerHTML = "<p>Weather data not available.</p>";
                    }
                })
                .catch(error => {
                    console.error(`Error fetching forecast for ${targetCity}:`, error);
                    wc.innerHTML = "<p>Failed to load forecast.</p>";
                });
        });
    }

    function fetchRacingWeather(city) {
        const cities = ['Pretoria', 'Vereeniging', 'Brakpan', 'Hermanus'];
        racingContent.forEach((rc, index) => {
            const targetCity = cities[index];
            const apiUrl = `/weather/weather?q=${targetCity}&units=metric&appid=${weatherApiKey}`;
            console.log(`Fetching weather for racing in: ${targetCity}`);
            const weatherElement = rc.querySelector('p:last-child'); // Target the "Current Weather" paragraph
            weatherElement.innerHTML = '<div class="spinner"></div>';
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.cod === 200) {
                        weatherElement.innerHTML = `<strong>Current Weather:</strong> ${data.main.temp}°C, ${data.weather[0].description}
                            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}" class="weather-icon">`;
                    } else {
                        weatherElement.innerHTML = "<strong>Current Weather:</strong> Data not available.";
                    }
                })
                .catch(error => {
                    console.error(`Error fetching weather for ${targetCity}:`, error);
                    weatherElement.innerHTML = "<strong>Current Weather:</strong> Failed to load.";
                });
        });
    }

    function fetchNews(country, category) {
        const apiUrl = `/news/top-headlines?q=${category}&country=${country}&lang=en&token=${newsApiKey}`;
        console.log("Fetching news with URL:", apiUrl);
        newsContent.innerHTML = '<div class="spinner"></div>';
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("GNews API response:", data);
                if (data.articles && data.articles.length > 0) {
                    let newsHtml = `<h2>Top ${category.charAt(0).toUpperCase() + category.slice(1)} News</h2>`;
                    data.articles.slice(0, 5).forEach(article => {
                        const thumb = article.image ? `<img src="${article.image}" alt="thumbnail" class="news-thumb">` : '';
                        newsHtml += `
                            <div class="news-item">
                                ${thumb}
                                <p><strong>${article.title}</strong></p>
                                <p><a href="${article.url}" target="_blank">Read more</a></p>
                            </div>
                        `;
                    });
                    newsContent.innerHTML = newsHtml;
                } else {
                    console.log(`No articles found for country: ${country}, category: ${category}`);
                    newsContent.innerHTML = "<p>No news available for this country and category combination.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching news:", error.message);
                newsContent.innerHTML = `<p>Failed to load news: ${error.message}</p>`;
            });
    }

    function fetchF1Races() {
        const apiUrl = `/f1/2025.json`;
        console.log("Fetching F1 races with URL:", apiUrl);
        f1Content.innerHTML = '<div class="spinner"></div>';
        fetch(apiUrl)
            .then(response => {
                console.log("F1 fetch response status:", response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Ergast API raw response:", JSON.stringify(data, null, 2));
                const races = data?.MRData?.RaceTable?.Races || [];
                console.log("Parsed races array:", races);
                if (races.length > 0) {
                    let f1Html = `<h2>F1 2025 Schedule</h2>`;
                    races.slice(0, 5).forEach(race => {
                        const raceDate = new Date(race.date + 'T' + (race.time || '00:00Z')).toLocaleString();
                        f1Html += `
                            <div class="f1-item">
                                <p><strong>${race.raceName}</strong></p>
                                <p>${race.Circuit.circuitName}</p>
                                <p>${raceDate}</p>
                            </div>
                        `;
                    });
                    f1Content.innerHTML = f1Html;
                } else {
                    console.log("No races found in response");
                    f1Content.innerHTML = "<p>No F1 race data available for 2025.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching F1 races:", error.message);
                f1Content.innerHTML = `<p>Failed to load F1 races: ${error.message}</p>`;
            });
    }

    function fetchUFCEvents() {
        const apiUrl = `/ufc/events`;
        console.log("Fetching UFC events with URL:", apiUrl);
        ufcContent.innerHTML = '<div class="spinner"></div>';
        fetch(apiUrl)
            .then(response => {
                console.log("UFC fetch response status:", response.status);
                console.log("UFC fetch response headers:", Array.from(response.headers.entries()));
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log("UFC API raw response:", JSON.stringify(data, null, 2));
                const events = data?.results || data || [];
                console.log("Parsed events array:", events);
                if (events.length > 0) {
                    let ufcHtml = `<h2>Recent UFC Events</h2>`;
                    events.slice(-5).reverse().forEach(event => {
                        const eventDate = new Date(event.event_date).toLocaleString();
                        ufcHtml += `
                            <div class="ufc-item">
                                <p><strong>${event.event_name || 'Unnamed Event'}</strong></p>
                                <p>${event.event_location || 'TBD'}</p>
                                <p>${eventDate}</p>
                            </div>
                        `;
                    });
                    ufcContent.innerHTML = ufcHtml;
                } else {
                    console.log("No events found in response");
                    ufcContent.innerHTML = "<p>No UFC event data available.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching UFC events:", error.message);
                ufcContent.innerHTML = `<p>Failed to load UFC events: ${error.message}</p>`;
            });
    }

    function fetchDefaultWeather() {
        console.log("Fetching default weather for all cities");
        fetchWeatherForecast("Johannesburg"); // Fallback city
    }

    function fetchDefaultRacing() {
        console.log("Fetching default racing info and weather for all cities");
        fetchRacingWeather("Pretoria"); // Fetch weather for racing locations
    }

    function fetchDefaultNews() {
        console.log("Fetching default news");
        fetchNews(newsCountry.value, newsCategory.value);
    }

    function fetchDefaultF1() {
        console.log("Fetching default F1 races");
        fetchF1Races();
    }

    function fetchDefaultUFC() {
        console.log("Fetching default UFC events");
        fetchUFCEvents();
    }
});
