# Steam Deck Settings Database

A comprehensive web application that allows users to query a database with collected information about optimal game settings for Steam Deck hardware.

## 🎮 Features

- **Game Search**: Search for Steam games by name with real-time results
- **Settings Database**: Access AI-curated optimal settings for thousands of games
- **Performance Optimization**: Get specific configuration recommendations for Steam Deck
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Accessibility**: Full WCAG compliance with keyboard navigation and screen reader support

## 🚀 Live Demo

Visit the live application: [Steam Deck Settings Database](https://dlb-demos.s3.eu-west-1.amazonaws.com/index.html)

## 🛠 Technical Stack

- **Frontend**: Vue.js 3 with Composition API
- **Routing**: Vue Router 4
- **Build Tool**: Vite
- **Icons**: Lucide Vue Next
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Grid and Flexbox
- **API Integration**: Steam Web API and custom backend services

## 📱 Application Structure

### Routes
- `/` - Home page with game search functionality
- `/game/:gameId` - Individual game settings page

### Key Components
- **GameSearch**: Search and select games from Steam database
- **GameSettings**: Display optimized settings for selected games
- **Home**: Landing page with search interface
- **GamePage**: Individual game settings page

## 🏗 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
git clone https://github.com/dani-beltran/steam-deck-db.git
cd steamdeck-settings-db-web
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 Data Sources

Game settings recommendations are AI-generated from:
- Community forums and guides
- Steam Deck official website  
- Performance benchmarking data

> **Disclaimer**: Recommendations are community-sourced and may not be suitable for every system configuration. Users assume all risks when applying settings.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Community

Join the Steam Deck Unofficial DB community:
- [Discord Server](https://discord.gg/e5q4QqfVQx)

---

*Built with ❤️ for the Steam Deck gaming community*
