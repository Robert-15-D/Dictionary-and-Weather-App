// Define the backend server URL
const SERVER_URL = "http://localhost:5000";

// function to set visibility
function setVisibility(elementId, show) {
    document.getElementById(elementId).classList.toggle("hidden", !show);
}

// Show dictionary page
function showDictionary() {
    setVisibility("main-menu", false);
    setVisibility("dictionary", true);
    setVisibility("definition", false);
    setVisibility("twitterShareDictionary", false);
}

// Show weather page
function showWeather() {
    setVisibility("main-menu", false);
    setVisibility("weather", true);
    setVisibility("weatherResult", false);
    setVisibility("twitterShareWeather", false);
}

// Go back to main menu
function goBack() {
    setVisibility("dictionary", false);
    setVisibility("weather", false);
    setVisibility("main-menu", true);
}

// Function to share on Twitter
function shareOnTwitter(content, alertMessage) {
    if (!content) {
        alert(alertMessage);
        return;
    }
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(content)}`;
    window.open(shareUrl, "_blank");
}

// Share dictionary definition
function shareOnTwitterDictionary() {
    const word = document.getElementById("wordInput").value;
    const definition = document.getElementById("definition").textContent.trim();
    shareOnTwitter(`Check out this word: "${word}" - ${definition}`, "Please search for a word first.");
}

// Share weather info
function shareOnTwitterWeather() {
    const weatherInfo = document.getElementById("weatherResult").textContent.trim();
    shareOnTwitter(`Current weather update: ${weatherInfo}`, "Please fetch the weather first.");
}

// Fetch definition from API
async function fetchDefinition() {
    const word = document.getElementById("wordInput").value.trim();
    const definitionBox = document.getElementById("definition");
    const errorBox = document.getElementById("error");
    const shareButton = document.getElementById("twitterShareDictionary");

    // Clear previous content
    errorBox.textContent = "";
    definitionBox.textContent = "";
    setVisibility("definition", false);
    setVisibility("twitterShareDictionary", false);

    // If the input is empty, show an error message and stop execution
    if (!word) {
        errorBox.textContent = "Please enter a word.";
        return;
    }

    try {
        // Fetch the word definition from DictionaryAPI.dev
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();

        // Check if the API returned valid data; if not, throw an error
        if (!data || data.title === "No Definitions Found") throw new Error();

        // Extract the first definition from the API response
        const definition = data[0].meanings[0].definitions[0].definition;
        
        // Display the definition in the UI
        definitionBox.textContent = `Definition: ${definition}`;
        
        // Show the definition box and enable the Twitter share button
        setVisibility("definition", true);
        setVisibility("twitterShareDictionary", true);

    } catch {
        //Error message if the word is not found
        errorBox.textContent = "Word not found. Please try again.";
    }
}

// Fetch weather from API
async function fetchWeather() {
    const city = document.getElementById("cityInput").value.trim();
    const weatherBox = document.getElementById("weatherResult");
    const weatherError = document.getElementById("weatherError");
    const shareButton = document.getElementById("twitterShareWeather");

    // Clear previous content
    weatherError.textContent = "";
    weatherBox.textContent = "";

    // Hide weather result and Twitter share button
    setVisibility("weatherResult", false);
    setVisibility("twitterShareWeather", false);

    // If the input is empty, show an error message and stop execution
    if (!city) {
        weatherError.textContent = "Please enter a city name.";
        return;
    }

    try {
        // Display "Loading..." text while fetching weather data
        weatherBox.textContent = "Loading...";
        setVisibility("weatherResult", true);

        // Fetch weather data from the server API for the given city
        const response = await fetch(`${SERVER_URL}/weather?city=${city}`);
        const data = await response.json();

        // If an error is returned from the API, throw an error message
        if (data.error) throw new Error(data.error);

        // Convert sunrise and sunset timestamps to human-readable time
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

        // Display the retrieved weather information from the API
        weatherBox.innerHTML = `
            Weather in ${data.name}: ${data.weather[0].description}, ${data.main.temp}°C
            <br>Sunrise: ${sunrise}
            <br>Sunset: ${sunset}
        `;

        // Show the weather result and enable the share button
        setVisibility("weatherResult", true);
        setVisibility("twitterShareWeather", true);

    } catch {
        // If an error occurs, display an error message and hide the weather result to avoid showing outdated data
        weatherError.textContent = "City not found. Please try again.";
        setVisibility("weatherResult", false);
    }
}
