const apiKey = "a8a002917f3858818cd2a6a5b332339a";
const newsContainer = document.getElementById("news-container");
const categoryButtons = document.querySelectorAll(".category-btn");

async function fetchNews(topic = "world") {
  newsContainer.innerHTML = `<p class="text-center text-gray-500 text-lg">Loading ${topic} news...</p>`;

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=en&apikey=${apiKey}`
    );

    const data = await response.json();
    console.log(data); // Debugging: see what API returns

    if (!data.articles || data.articles.length === 0) {
      newsContainer.innerHTML = `<p class="text-center text-gray-600 text-lg">No news found for "${topic}".</p>`;
      return;
    }

    newsContainer.innerHTML = "";
    data.articles.forEach((article) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300";

      card.innerHTML = `
        <img src="${article.image || "https://via.placeholder.com/400x200?text=No+Image"}" 
             alt="news image" 
             class="w-full h-48 object-cover" />
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-2 line-clamp-2">${article.title}</h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-3">${article.description || ""}</p>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>${article.source.name || "Unknown"}</span>
            <a href="${article.url}" target="_blank" 
               class="text-blue-600 hover:text-blue-800 font-medium">Read more →</a>
          </div>
        </div>
      `;

      newsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    newsContainer.innerHTML =
      `<p class="text-center text-red-600 text-lg">Failed to load news. Please try again later.</p>`;
  }
}

// Map buttons to GNews topics
const topicMap = {
  general: "world",
  business: "business",
  sports: "sports",
  technology: "technology",
  entertainment: "entertainment",
};

categoryButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    const topic = topicMap[btn.dataset.category] || "world";
    fetchNews(topic);
  })
);

fetchNews(); // Load world news by default
