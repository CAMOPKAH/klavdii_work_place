const API_KEY = 'f00c38e0279b7bc85480c3fe775d518c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityButtons = document.querySelectorAll('.city-btn');
const weatherCard = document.getElementById('weather-card');

const cityNameElement = document.getElementById('city-name');
const currentDateElement = document.getElementById('current-date');
const temperatureElement = document.getElementById('temperature');
const weatherIconElement = document.getElementById('weather-icon');
const weatherDescriptionElement = document.getElementById('weather-description');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const lastUpdatedElement = document.getElementById('last-updated');
const errorMessageElement = document.getElementById('error-message');

const weatherIcons = {
    '01d': 'fas fa-sun',
    '01n': 'fas fa-moon',
    '02d': 'fas fa-cloud-sun',
    '02n': 'fas fa-cloud-moon',
    '03d': 'fas fa-cloud',
    '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud',
    '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-rain',
    '09n': 'fas fa-cloud-rain',
    '10d': 'fas fa-cloud-sun-rain',
    '10n': 'fas fa-cloud-moon-rain',
    '11d': 'fas fa-bolt',
    '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake',
    '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog',
    '50n': 'fas fa-smog'
};

function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('ru-RU', options);
}

function formatTime(date) {
    return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.classList.add('show');
    
    setTimeout(() => {
        errorMessageElement.classList.remove('show');
    }, 5000);
}

function hideError() {
    errorMessageElement.classList.remove('show');
}

function updateWeatherIcon(iconCode) {
    const iconClass = weatherIcons[iconCode] || 'fas fa-cloud';
    weatherIconElement.className = iconClass;
}

function updateWeatherData(data) {
    const tempCelsius = Math.round(data.main.temp - 273.15);
    const feelsLike = Math.round(data.main.feels_like - 273.15);
    const windSpeed = data.wind.speed;
    const pressure = data.main.pressure;
    const visibility = data.visibility / 1000;
    
    cityNameElement.textContent = data.name + ', ' + data.sys.country;
    temperatureElement.textContent = tempCelsius;
    weatherDescriptionElement.textContent = data.weather[0].description;
    humidityElement.textContent = data.main.humidity + '%';
    windSpeedElement.textContent = windSpeed.toFixed(1) + ' м/с';
    pressureElement.textContent = pressure + ' гПа';
    visibilityElement.textContent = visibility.toFixed(1) + ' км';
    
    updateWeatherIcon(data.weather[0].icon);
    
    const now = new Date();
    currentDateElement.textContent = formatDate(now);
    lastUpdatedElement.textContent = formatTime(now);
    
    hideError();
    
    localStorage.setItem('lastCity', data.name);
}

async function fetchWeather(city) {
    try {
        const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&lang=ru`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Город не найден. Проверьте правильность написания.');
            } else if (response.status === 401) {
                throw new Error('Ошибка доступа к API. Попробуйте позже.');
            } else {
                throw new Error('Ошибка при получении данных о погоде.');
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        throw error;
    }
}

async function getWeatherByCity(city) {
    if (!city.trim()) {
        showError('Пожалуйста, введите название города');
        return;
    }
    
    try {
        const weatherData = await fetchWeather(city);
        updateWeatherData(weatherData);
    } catch (error) {
        showError(error.message);
    }
}

function handleSearch() {
    const city = cityInput.value.trim();
    getWeatherByCity(city);
}

function handleCityButtonClick(event) {
    const city = event.target.dataset.city;
    cityInput.value = city;
    getWeatherByCity(city);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

function loadLastCity() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeatherByCity(lastCity);
    } else {
        getWeatherByCity('Москва');
    }
}

function init() {
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', handleKeyPress);
    
    cityButtons.forEach(button => {
        button.addEventListener('click', handleCityButtonClick);
    });
    
    loadLastCity();
    
    const now = new Date();
    currentDateElement.textContent = formatDate(now);
}

document.addEventListener('DOMContentLoaded', init);