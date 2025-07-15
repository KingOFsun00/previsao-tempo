// Configurações
const API_KEY = '35070fd09c634fd780187ef241b86fcf';
let currentCity = 'São Paulo';

// Elementos do DOM
const elements = {
  cityInput: document.getElementById('city-input'),
  searchBtn: document.getElementById('search-btn'),
  toggleModeBtn: document.querySelector('.toggle-mode'),
  cityName: document.getElementById('city-name'),
  weatherIcon: document.getElementById('weather-icon'),
  temperature: document.getElementById('temperature'),
  weatherDesc: document.getElementById('weather-description'),
  humidity: document.getElementById('humidity'),
  windSpeed: document.getElementById('wind-speed'),
  forecast: document.getElementById('forecast'),
  weatherMap: document.getElementById('weather-map'),
  tempChart: document.getElementById('temp-chart')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Carrega cidade padrão
  fetchWeather(currentCity);
  
  // Event Listeners
  elements.searchBtn.addEventListener('click', handleSearch);
  elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  elements.toggleModeBtn.addEventListener('click', toggleDarkMode);
  
  // Botão de Geolocalização
  const geoBtn = document.createElement('button');
  geoBtn.textContent = 'Usar minha localização';
  geoBtn.className = 'geo-btn';
  geoBtn.addEventListener('click', getLocation);
  elements.searchBox.insertAdjacentElement('beforeend', geoBtn);
});

// Funções Principais
async function fetchWeather(city) {
  try {
    elements.cityName.textContent = "Buscando...";
    
    const [current, forecast] = await Promise.all([
      fetch(`https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(city)}&key=${API_KEY}&lang=pt&units=M`),
      fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=${encodeURIComponent(city)}&key=${API_KEY}&lang=pt&units=M&days=5`)
    ]);
    
    if (!current.ok || !forecast.ok) throw new Error('Cidade não encontrada');
    
    const currentData = await current.json();
    const forecastData = await forecast.json();
    
    displayWeather(currentData.data[0], forecastData.data);
    initMap(currentData.data[0].lat, currentData.data[0].lon);
    checkAlerts(currentData.data[0]);
    
  } catch (error) {
    console.error('Erro:', error);
    alert(`Erro: ${error.message}`);
  }
}

// Exibir Dados
function displayWeather(current, forecast) {
  // Dados atuais
  elements.cityName.textContent = `${current.city_name}, ${current.country_code}`;
  elements.temperature.textContent = `${current.temp}°C`;
  elements.weatherDesc.textContent = current.weather.description;
  elements.humidity.textContent = `${current.rh}%`;
  elements.windSpeed.textContent = `${current.wind_spd.toFixed(1)} m/s`;
  elements.weatherIcon.src = `https://www.weatherbit.io/static/img/icons/${current.weather.icon}.png`;
  
  // Previsão
  elements.forecast.innerHTML = '';
  forecast.forEach(day => {
    const date = new Date(day.valid_date);
    const dayElement = document.createElement('div');
    dayElement.className = 'forecast-day';
    dayElement.innerHTML = `
      <h3>${date.toLocaleDateString('pt-BR', { weekday: 'short' })}</h3>
      <img src="https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png" alt="${day.weather.description}">
      <p>${day.max_temp}°C / ${day.min_temp}°C</p>
    `;
    elements.forecast.appendChild(dayElement);
  });
  
  // Atualiza gráfico (simplificado)
  updateChart(forecast);
}

// Geolocalização
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetch(`https://api.weatherbit.io/v2.0/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}&key=${API_KEY}&lang=pt`)
          .then(response => response.json())
          .then(data => {
            currentCity = data.data[0].city_name;
            fetchWeather(currentCity);
          });
      },
      (error) => {
        alert('Permissão de localização negada. Busque manualmente.');
      }
    );
  } else {
    alert('Geolocalização não suportada no seu navegador.');
  }
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Verificar Alertas
function checkAlerts(data) {
  if (data.precip > 5) {
    showAlert('Chuva intensa prevista! Leve um guarda-chuva.');
  } else if (data.temp > 30) {
    showAlert('Temperatura alta! Hidrate-se.');
  }
}

function showAlert(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'weather-alert';
  alertDiv.innerHTML = `⚠️ ${message}`;
  document.querySelector('.container').prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

let weatherMap = null; // Variável global para armazenar a instância do mapa

function initMap(lat, lon) {
  const mapContainer = document.getElementById('weather-map');
  
  // Verifica se o container existe
  if (!mapContainer) return;
  
  // Destrói o mapa anterior se existir
  if (weatherMap) {
    weatherMap.remove();
    weatherMap = null;
  }
  
  // Cria novo mapa
  weatherMap = L.map('weather-map').setView([lat, lon], 10);
  
  // Adiciona camada de tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(weatherMap);
  
  // Adiciona marcador
  L.marker([lat, lon]).addTo(weatherMap)
    .bindPopup(`<b>${document.getElementById('city-name').textContent}</b>`)
    .openPopup();
  
  // Ajusta o tamanho do mapa após carregamento
  setTimeout(() => {
    weatherMap.invalidateSize();
  }, 100);
}

// Gráfico (Chart.js)
let weatherChart = null;

function updateChart(forecast) {
  const ctx = document.getElementById('temp-chart').getContext('2d');
  
  // Destrói o gráfico anterior se existir
  if (weatherChart) {
    weatherChart.destroy();
  }
  
  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecast.map(day => 
        new Date(day.valid_date).toLocaleDateString('pt-BR', { weekday: 'short' })
      ),
      datasets: [{
        label: 'Máxima',
        data: forecast.map(day => day.max_temp),
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.3
      }, {
        label: 'Mínima',
        data: forecast.map(day => day.min_temp),
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw}°C`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => `${value}°C`
          }
        }
      }
    }
  });
}
// Handlers
function handleSearch() {
  const city = elements.cityInput.value.trim();
  if (city) {
    currentCity = city;
    fetchWeather(city);
  }
}