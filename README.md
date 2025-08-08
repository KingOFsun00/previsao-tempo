# ClimaAgora - Previsão do Tempo Inteligente

Um aplicativo de previsão do tempo moderno e responsivo com informações de bairro, gráficos climáticos e mapa interativo.

## 🌟 Características

- **Informações de Bairro**: Detecta automaticamente o bairro da cidade
- **Gráficos Climáticos**: Gráficos interativos de temperatura e precipitação
- **Mapa Interativo**: Mini mapa com localização precisa
- **Previsão por Hora**: 12 horas de previsão detalhada
- **Previsão de 7 Dias**: Previsão semanal completa
- **Modo Escuro**: Interface adaptável com tema escuro
- **Geolocalização**: Detecta automaticamente sua localização
- **Design Responsivo**: Funciona perfeitamente em mobile, tablet e desktop
- **PWA**: Suporte para Progressive Web App

## 🚀 Como Usar

### 1. Configuração da API

Para obter dados reais do tempo, você precisa de uma API key gratuita:

1. Acesse [OpenWeatherMap](https://openweathermap.org/api)
2. Crie uma conta gratuita
3. Obtenha sua API key gratuita
4. Abra o arquivo `tempo.js`
5. Substitua `YOUR_OPENWEATHERMAP_API_KEY` pela sua chave:

```javascript
const API_KEY = 'sua_chave_aqui';
```

### 2. Executando o Projeto

1. Clone ou baixe os arquivos
2. Abra `index.html` no seu navegador
3. Ou hospede no GitHub Pages, Netlify, Vercel, etc.

### 3. Funcionalidades

- **Busca de Cidades**: Digite qualquer cidade do mundo
- **Geolocalização**: Clique em "Minha Localização" para detectar automaticamente
- **Modo Escuro**: Toggle no canto superior direito
- **Gráficos Interativos**: Clique nos gráficos para mais detalhes
- **Mapa Interativo**: Clique no marcador para informações

## 📱 Recursos Técnicos

- **HTML5**: Estrutura semântica moderna
- **CSS3**: Design responsivo com CSS Grid e Flexbox
- **JavaScript ES6+**: Código moderno e otimizado
- **APIs**: OpenWeatherMap + OpenStreetMap
- **Bibliotecas**: Leaflet (mapas), Chart.js (gráficos), Font Awesome (ícones)

## 🎨 Design

- **Glassmorphism**: Efeitos de vidro com backdrop blur
- **Gradientes**: Cores vibrantes e modernas
- **Animações**: Transições suaves e hover effects
- **Tipografia**: Hierarquia clara e legível
- **Responsivo**: Adaptável a todos os dispositivos

## 🔧 Personalização

### Cores
Edite as variáveis CSS em `tempo.css`:

```css
:root {
  --bg-color: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --accent-color: #4CAF50;
  --text-color: rgba(255, 255, 255, 0.95);
}
```

### Cidade Padrão
Altere a cidade inicial em `tempo.js`:

```javascript
let currentCity = 'Sua Cidade';
```

## 📊 APIs Utilizadas

- **OpenWeatherMap**: Dados meteorológicos em tempo real
- **OpenStreetMap Nominatim**: Geocodificação reversa para informações de bairro
- **OpenStreetMap Tiles**: Mapas interativos

## 🚀 Deploy

### GitHub Pages
1. Faça push para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch main
4. Seu site estará disponível em `https://seu-usuario.github.io/seu-repo`

### Netlify
1. Conecte seu repositório GitHub
2. Netlify detectará automaticamente os arquivos
3. Deploy automático a cada push

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para fornecer informações meteorológicas precisas e acessíveis.**
