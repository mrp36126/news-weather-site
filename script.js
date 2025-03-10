document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(button.dataset.tab).classList.add("active");
        });
    });

    // Fetch News
    fetch("/news/top-headlines?country=za&apikey=YOUR_NEWS_API_KEY")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("news-container");
            container.innerHTML = data.articles.map(article => `
                <div class="card">
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <a href="${article.url}" target="_blank">Read more</a>
                </div>
            `).join("");
        });

    // Fetch F1 Data
    fetch("/f1/current.json")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("f1-container");
            container.innerHTML = data.MRData.RaceTable.Races.map(race => `
                <div class="card">
                    <h3>${race.raceName}</h3>
                    <p>${race.Circuit.circuitName}, ${race.Circuit.Location.country}</p>
                    <p>${race.date}</p>
                </div>
            `).join("");
        });

    // Fetch UFC Data
    fetch("/ufc/events")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("ufc-container");
            container.innerHTML = data.map(event => `
                <div class="card">
                    <h3>${event.title}</h3>
                    <p>${event.date}</p>
                </div>
            `).join("");
        });
});
