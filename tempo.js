// Configurações
const API_KEY = '35070fd09c634fd780187ef241b86fcf';
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
    
    const [current, forecast, hourly] = await Promise.all([
      fetch(`https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(city)}&key=${API_KEY}&lang=pt&units=M`),
      fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=${encodeURIComponent(city)}&key=${API_KEY}&lang=pt&units=M&days=7`),
      fetch(`https://api.weatherbit.io/v2.0/forecast/hourly?city=${encodeURIComponent(city)}&key=${API_KEY}&lang=pt&units=M&hours=24`)
    ]);
    
    if (!current.ok || !forecast.ok || !hourly.ok) throw new Error('Cidade não encontrada');
    
    const currentData = await current.json();
    const forecastData = await forecast.json();
    const hourlyData = await hourly.json();
    
    displayWeather(currentData.data[0], forecastData.data, hourlyData.data);
    initMap(currentData.data[0].lat, currentData.data[0].lon, city);
    fetchNeighborhoodInfo(currentData.data[0].lat, currentData.data[0].lon);
    checkAlerts(currentData.data[0]);
    
  } catch (error) {
    console.error('Erro:', error);
    showAlert(`Erro: ${error.message}`, 'error');
  }
}

// Exibir Dados
function displayWeather(current, forecast, hourly) {
  // Dados atuais
  elements.cityName.textContent = `${current.city_name}, ${current.country_code}`;
  elements.temperature.textContent = `${Math.round(current.temp)}°C`;
  elements.weatherDesc.textContent = current.weather.description;
  elements.humidity.textContent = `${current.rh}%`;
  elements.windSpeed.textContent = `${current.wind_spd.toFixed(1)} m/s`;
  elements.visibility.textContent = `${(current.vis / 1000).toFixed(1)} km`;
  elements.uvIndex.textContent = current.uv;
  elements.precipitation.textContent = `${current.precip} mm`;
  elements.pressure.textContent = `${current.pres} hPa`;
  elements.feelsLike.textContent = `Sensação: ${Math.round(current.app_temp)}°C`;
  elements.weatherIcon.src = `https://www.weatherbit.io/static/img/icons/${current.weather.icon}.png`;
  
  // Previsão de 7 dias
  displayForecast(forecast);
  
  // Previsão por hora
  displayHourlyForecast(hourly);
  
  // Atualiza gráficos
  updateCharts(forecast);
}

// Exibir Previsão
function displayForecast(forecast) {
  elements.forecast.innerHTML = '';
  forecast.forEach(day => {
    const date = new Date(day.valid_date);
    const dayElement = document.createElement('div');
    dayElement.className = 'forecast-day';
    dayElement.innerHTML = `
      <h4>${date.toLocaleDateString('pt-BR', { weekday: 'short' })}</h4>
      <p>${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
      <img src="https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png" alt="${day.weather.description}">
      <div class="temp-range">${Math.round(day.max_temp)}°C / ${Math.round(day.min_temp)}°C</div>
      <div class="description">${day.weather.description}</div>
    `;
    elements.forecast.appendChild(dayElement);
  });
}

// Exibir Previsão por Hora
function displayHourlyForecast(hourly) {
  elements.hourlyForecast.innerHTML = '';
  hourly.slice(0, 12).forEach(hour => {
    const time = new Date(hour.timestamp);
    const hourElement = document.createElement('div');
    hourElement.className = 'hourly-item';
    hourElement.innerHTML = `
      <div class="time">${time.getHours()}:00</div>
      <img src="https://www.weatherbit.io/static/img/icons/${hour.weather.icon}.png" alt="${hour.weather.description}">
      <div class="temp">${Math.round(hour.temp)}°C</div>
      <div class="description">${hour.weather.description}</div>
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
          const response = await fetch(`https://api.weatherbit.io/v2.0/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}&key=${API_KEY}&lang=pt`);
          const data = await response.json();
          
          if (data.data && data.data[0]) {
            currentCity = data.data[0].city_name;
            elements.cityInput.value = currentCity;
            fetchWeather(currentCity);
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
  
  if (data.precip > 5) {
    alerts.push('Chuva intensa prevista! Leve um guarda-chuva.');
  }
  if (data.temp > 30) {
    alerts.push('Temperatura alta! Hidrate-se adequadamente.');
  }
  if (data.temp < 10) {
    alerts.push('Temperatura baixa! Agasalhe-se.');
  }
  if (data.uv > 8) {
    alerts.push('Índice UV muito alto! Use protetor solar.');
  }
  if (data.wind_spd > 10) {
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
function updateCharts(forecast) {
  updateTemperatureChart(forecast);
  updatePrecipitationChart(forecast);
}

function updateTemperatureChart(forecast) {
  const ctx = document.getElementById('temp-chart').getContext('2d');
  
  if (weatherChart) {
    weatherChart.destroy();
  }
  
  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecast.map(day => 
        new Date(day.valid_date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      ),
      datasets: [{
        label: 'Máxima',
        data: forecast.map(day => day.max_temp),
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Mínima',
        data: forecast.map(day => day.min_temp),
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

function updatePrecipitationChart(forecast) {
  const ctx = document.getElementById('precipitation-chart').getContext('2d');
  
  if (precipitationChart) {
    precipitationChart.destroy();
  }
  
  precipitationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: forecast.map(day => 
        new Date(day.valid_date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      ),
      datasets: [{
        label: 'Precipitação (mm)',
        data: forecast.map(day => day.precip),
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
            label: (context) => `Precipitação: ${context.raw} mm`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value} mm`,
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