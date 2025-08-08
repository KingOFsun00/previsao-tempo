// Configurações
const API_KEY = '04ea5b0b6b77665f130a46c0c2ad67ea';
let currentCity = 'São Paulo';
let weatherMap = null;
let weatherChart = null;
let precipitationChart = null;

// Elementos do DOM
const elements = {
  cityInput: document.getElementById('city-input'),
  searchBtn: document.getElementById('search-btn'),
  locationBtn: document.getElementById('location-btn'),
  toggleModeBtn: document.querySelector('.toggle-mode'),
  cityName: document.getElementById('city-name'),
  neighborhood: document.getElementById('neighborhood'),
  weatherIcon: document.getElementById('weather-icon'),
  temperature: document.getElementById('temperature'),
  weatherDesc: document.getElementById('weather-description'),
  humidity: document.getElementById('humidity'),
  windSpeed: document.getElementById('wind-speed'),
  visibility: document.getElementById('visibility'),
  uvIndex: document.getElementById('uv-index'),
  precipitation: document.getElementById('precipitation'),
  pressure: document.getElementById('pressure'),
  feelsLike: document.getElementById('feels-like'),
  forecast: document.getElementById('forecast'),
  hourlyForecast: document.getElementById('hourly-forecast'),
  weatherMap: document.getElementById('weather-map'),
  tempChart: document.getElementById('temp-chart'),
  precipitationChart: document.getElementById('precipitation-chart'),
  neighborhoodDetails: document.getElementById('neighborhood-details')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Carrega cidade padrão
  fetchWeather(currentCity);
  
  // Event Listeners
  elements.searchBtn.addEventListener('click', handleSearch);
  elements.locationBtn.addEventListener('click', getLocation);
  elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  elements.toggleModeBtn.addEventListener('click', toggleDarkMode);
  
  // Carrega modo escuro salvo
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
});

// Funções Principais
async function fetchWeather(city) {
  try {
    elements.cityName.textContent = "Buscando...";
    elements.neighborhood.textContent = "Carregando...";
    
    // Se não tiver API key, usa dados mock para demonstração
    if (API_KEY === '04ea5b0b6b77665f130a46c0c2ad67ea') {
      showMockData(city);
      return;
    }
    
    const [current, forecast] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`)
    ]);
    
    if (!current.ok || !forecast.ok) throw new Error('Cidade não encontrada');
    
    const currentData = await current.json();
    const forecastData = await forecast.json();
    
    displayWeather(currentData, forecastData);
    initMap(currentData.coord.lat, currentData.coord.lon, city);
    fetchNeighborhoodInfo(currentData.coord.lat, currentData.coord.lon);
    checkAlerts(currentData);
    
  } catch (error) {
    console.error('Erro:', error);
    showAlert(`Erro: ${error.message}`, 'error');
  }
}

// Dados mock para demonstração
function showMockData(city) {
  const mockCurrent = {
    name: city,
    sys: { country: 'BR' },
    main: {
      temp: 25,
      feels_like: 27,
      humidity: 65,
      pressure: 1013
    },
    weather: [{ description: 'céu limpo', icon: '01d' }],
    wind: { speed: 3.5 },
    visibility: 10000,
    coord: { lat: -23.5505, lon: -46.6333 }
  };
  
  const mockForecast = {
    list: [
      { dt: Date.now() / 1000 + 3600, main: { temp: 26 }, weather: [{ description: 'céu limpo', icon: '01d' }] },
      { dt: Date.now() / 1000 + 7200, main: { temp: 28 }, weather: [{ description: 'poucas nuvens', icon: '02d' }] },
      { dt: Date.now() / 1000 + 10800, main: { temp: 30 }, weather: [{ description: 'nuvens dispersas', icon: '03d' }] },
      { dt: Date.now() / 1000 + 14400, main: { temp: 29 }, weather: [{ description: 'céu limpo', icon: '01d' }] },
      { dt: Date.now() / 1000 + 18000, main: { temp: 27 }, weather: [{ description: 'poucas nuvens', icon: '02d' }] },
      { dt: Date.now() / 1000 + 21600, main: { temp: 25 }, weather: [{ description: 'céu limpo', icon: '01n' }] },
      { dt: Date.now() / 1000 + 25200, main: { temp: 23 }, weather: [{ description: 'céu limpo', icon: '01n' }] },
      { dt: Date.now() / 1000 + 28800, main: { temp: 22 }, weather: [{ description: 'céu limpo', icon: '01n' }] },
      { dt: Date.now() / 1000 + 32400, main: { temp: 21 }, weather: [{ description: 'céu limpo', icon: '01n' }] },
      { dt: Date.now() / 1000 + 36000, main: { temp: 20 }, weather: [{ description: 'céu limpo', icon: '01n' }] },
      { dt: Date.now() / 1000 + 39600, main: { temp: 19 }, weather: [{ description: 'céu limpo', icon: '01n' }] },
      { dt: Date.now() / 1000 + 43200, main: { temp: 18 }, weather: [{ description: 'céu limpo', icon: '01n' }] }
    ]
  };
  
  displayWeather(mockCurrent, mockForecast);
  initMap(mockCurrent.coord.lat, mockCurrent.coord.lon, city);
  fetchNeighborhoodInfo(mockCurrent.coord.lat, mockCurrent.coord.lon);
  checkAlerts(mockCurrent);
  
  showAlert('Usando dados de demonstração. Obtenha uma API key gratuita em openweathermap.org para dados reais.', 'info');
}

// Exibir Dados
function displayWeather(current, forecast) {
  // Dados atuais
  elements.cityName.textContent = `${current.name}, ${current.sys.country}`;
  elements.temperature.textContent = `${Math.round(current.main.temp)}°C`;
  elements.weatherDesc.textContent = current.weather[0].description;
  elements.humidity.textContent = `${current.main.humidity}%`;
  elements.windSpeed.textContent = `${current.wind.speed.toFixed(1)} m/s`;
  elements.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
  elements.uvIndex.textContent = '--'; // OpenWeatherMap não fornece UV no plano gratuito
  elements.precipitation.textContent = '-- mm'; // Será atualizado se disponível
  elements.pressure.textContent = `${current.main.pressure} hPa`;
  elements.feelsLike.textContent = `Sensação: ${Math.round(current.main.feels_like)}°C`;
  elements.weatherIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  
  // Previsão por hora (próximas 12 horas)
  displayHourlyForecast(forecast.list.slice(0, 12));
  
  // Previsão de 7 dias (simulada com dados disponíveis)
  displayForecast(forecast.list);
  
  // Atualiza gráficos
  updateCharts(forecast.list);
}

// Exibir Previsão
function displayForecast(forecastList) {
  elements.forecast.innerHTML = '';
  
  // Agrupa por dia e pega o primeiro registro de cada dia
  const dailyForecast = [];
  const seenDays = new Set();
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!seenDays.has(dayKey) && dailyForecast.length < 7) {
      seenDays.add(dayKey);
      dailyForecast.push({
        date: date,
        temp: item.main.temp,
        weather: item.weather[0],
        max_temp: item.main.temp + 3, // Simulado
        min_temp: item.main.temp - 3  // Simulado
      });
    }
  });
  
  dailyForecast.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'forecast-day';
    dayElement.innerHTML = `
      <h4>${day.date.toLocaleDateString('pt-BR', { weekday: 'short' })}</h4>
      <p>${day.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather.icon}@2x.png" alt="${day.weather.description}">
      <div class="temp-range">${Math.round(day.max_temp)}°C / ${Math.round(day.min_temp)}°C</div>
      <div class="description">${day.weather.description}</div>
    `;
    elements.forecast.appendChild(dayElement);
  });
}

// Exibir Previsão por Hora
function displayHourlyForecast(hourlyList) {
  elements.hourlyForecast.innerHTML = '';
  hourlyList.forEach(hour => {
    const time = new Date(hour.dt * 1000);
    const hourElement = document.createElement('div');
    hourElement.className = 'hourly-item';
    hourElement.innerHTML = `
      <div class="time">${time.getHours()}:00</div>
      <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="${hour.weather[0].description}">
      <div class="temp">${Math.round(hour.main.temp)}°C</div>
      <div class="description">${hour.weather[0].description}</div>
    `;
    elements.hourlyForecast.appendChild(hourElement);
  });
}

// Informações do Bairro
async function fetchNeighborhoodInfo(lat, lon) {
  try {
    // Usando uma API gratuita para geocodificação reversa
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt`);
    const data = await response.json();
    
    if (data.address) {
      let neighborhood = 'Informações não disponíveis';
      
      // Tenta encontrar o nome do bairro
      if (data.address.suburb) {
        neighborhood = data.address.suburb;
      } else if (data.address.neighbourhood) {
        neighborhood = data.address.neighbourhood;
      } else if (data.address.city_district) {
        neighborhood = data.address.city_district;
      } else if (data.address.district) {
        neighborhood = data.address.district;
      }
      
      elements.neighborhood.textContent = neighborhood;
      
      // Informações detalhadas do bairro
      displayNeighborhoodDetails(data.address);
    }
  } catch (error) {
    console.error('Erro ao buscar informações do bairro:', error);
    elements.neighborhood.textContent = 'Informações não disponíveis';
  }
}

// Exibir Detalhes do Bairro
function displayNeighborhoodDetails(address) {
  const details = [];
  
  if (address.postcode) details.push({ icon: 'fas fa-mail-bulk', text: `CEP: ${address.postcode}` });
  if (address.city) details.push({ icon: 'fas fa-city', text: `Cidade: ${address.city}` });
  if (address.state) details.push({ icon: 'fas fa-map', text: `Estado: ${address.state}` });
  if (address.country) details.push({ icon: 'fas fa-globe', text: `País: ${address.country}` });
  if (address.road) details.push({ icon: 'fas fa-road', text: `Rua: ${address.road}` });
  
  elements.neighborhoodDetails.innerHTML = '';
  details.forEach(detail => {
    const item = document.createElement('div');
    item.className = 'neighborhood-item';
    item.innerHTML = `
      <i class="${detail.icon}"></i>
      <span>${detail.text}</span>
    `;
    elements.neighborhoodDetails.appendChild(item);
  });
}

// Geolocalização
function getLocation() {
  if (navigator.geolocation) {
    elements.locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localizando...';
    elements.locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
            // Usa dados mock para demonstração
            currentCity = 'Sua Localização';
            elements.cityInput.value = currentCity;
            showMockData(currentCity);
          } else {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric&lang=pt_br`);
            const data = await response.json();
            
            if (data.name) {
              currentCity = data.name;
              elements.cityInput.value = currentCity;
              fetchWeather(currentCity);
            }
          }
        } catch (error) {
          showAlert('Erro ao obter dados da sua localização', 'error');
        } finally {
          elements.locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Minha Localização';
          elements.locationBtn.disabled = false;
        }
      },
      (error) => {
        showAlert('Permissão de localização negada. Busque manualmente.', 'warning');
        elements.locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Minha Localização';
        elements.locationBtn.disabled = false;
      }
    );
  } else {
    showAlert('Geolocalização não suportada no seu navegador.', 'warning');
  }
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  
  // Atualiza ícone do botão
  const icon = elements.toggleModeBtn.querySelector('i');
  if (isDark) {
    icon.className = 'fas fa-sun';
    elements.toggleModeBtn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
  } else {
    icon.className = 'fas fa-moon';
    elements.toggleModeBtn.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
  }
}

// Verificar Alertas
function checkAlerts(data) {
  const alerts = [];
  
  if (data.main.temp > 30) {
    alerts.push('Temperatura alta! Hidrate-se adequadamente.');
  }
  if (data.main.temp < 10) {
    alerts.push('Temperatura baixa! Agasalhe-se.');
  }
  if (data.wind.speed > 10) {
    alerts.push('Ventos fortes! Tenha cuidado ao sair.');
  }
  
  alerts.forEach(alert => showAlert(alert, 'info'));
}

// Mostrar Alertas
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `weather-alert alert-${type}`;
  alertDiv.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
    ${message}
  `;
  
  document.querySelector('.weather-alerts').appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    setTimeout(() => alertDiv.remove(), 300);
  }, 5000);
}

// Mapa Interativo
function initMap(lat, lon, cityName) {
  const mapContainer = document.getElementById('weather-map');
  
  if (!mapContainer) return;
  
  // Destrói o mapa anterior se existir
  if (weatherMap) {
    weatherMap.remove();
    weatherMap = null;
  }
  
  // Cria novo mapa
  weatherMap = L.map('weather-map').setView([lat, lon], 12);
  
  // Adiciona camada de tiles com tema escuro
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(weatherMap);
  
  // Adiciona marcador personalizado
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: '<i class="fas fa-map-marker-alt" style="color: #4CAF50; font-size: 24px;"></i>',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
  
  L.marker([lat, lon], { icon: customIcon }).addTo(weatherMap)
    .bindPopup(`<b>${cityName}</b><br>Clique para mais informações`)
    .openPopup();
  
  // Ajusta o tamanho do mapa após carregamento
  setTimeout(() => {
    weatherMap.invalidateSize();
  }, 100);
}

// Gráficos
function updateCharts(forecastList) {
  updateTemperatureChart(forecastList);
  updatePrecipitationChart(forecastList);
}

function updateTemperatureChart(forecastList) {
  const ctx = document.getElementById('temp-chart').getContext('2d');
  
  if (weatherChart) {
    weatherChart.destroy();
  }
  
  // Pega os primeiros 7 dias únicos
  const dailyTemps = [];
  const seenDays = new Set();
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!seenDays.has(dayKey) && dailyTemps.length < 7) {
      seenDays.add(dayKey);
      dailyTemps.push({
        date: date,
        temp: item.main.temp,
        max_temp: item.main.temp + 3,
        min_temp: item.main.temp - 3
      });
    }
  });
  
  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyTemps.map(day => 
        day.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      ),
      datasets: [{
        label: 'Máxima',
        data: dailyTemps.map(day => day.max_temp),
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Mínima',
        data: dailyTemps.map(day => day.min_temp),
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color')
          }
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
            callback: (value) => `${value}°C`,
            color: getComputedStyle(document.body).getPropertyValue('--text-color')
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color')
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function updatePrecipitationChart(forecastList) {
  const ctx = document.getElementById('precipitation-chart').getContext('2d');
  
  if (precipitationChart) {
    precipitationChart.destroy();
  }
  
  // Simula dados de precipitação para demonstração
  const dailyPrecip = [];
  const seenDays = new Set();
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!seenDays.has(dayKey) && dailyPrecip.length < 7) {
      seenDays.add(dayKey);
      dailyPrecip.push({
        date: date,
        precip: Math.random() * 10 // Simulado
      });
    }
  });
  
  precipitationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dailyPrecip.map(day => 
        day.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      ),
      datasets: [{
        label: 'Precipitação (mm)',
        data: dailyPrecip.map(day => day.precip),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: '#36a2eb',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color')
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `Precipitação: ${context.raw.toFixed(1)} mm`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value.toFixed(1)} mm`,
            color: getComputedStyle(document.body).getPropertyValue('--text-color')
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color')
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
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