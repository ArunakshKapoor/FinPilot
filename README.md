# FinPilot

FinPilot is an AI-driven investment assistant that helps users make smarter financial decisions by analyzing their portfolio and providing personalized insights.

## Features

- Portfolio Upload (CSV or Manual Entry)
- Real-time Portfolio Analysis
- AI-Powered Investment Insights
- Market News and Trends
- Interactive Charts and Visualizations
- No Login Required

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- OpenAI API Key
- Finnhub API Key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/finpilot.git
cd finpilot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:

```
OPENAI_API_KEY=your_openai_api_key
FINNHUB_API_KEY=your_finnhub_api_key
```

4. Start the development server:

```bash
npx expo start
```

## Usage

1. Open the app in your browser or on your mobile device using the Expo Go app
2. Click "Get Started" on the welcome screen
3. Upload your portfolio via CSV or enter stocks manually
4. View your portfolio analysis and interact with the AI assistant
5. Explore market news and trends

## CSV Format

The CSV file should have the following headers:

- ticker
- quantity
- price
- date

Example:

```csv
ticker,quantity,price,date
AAPL,10,150.25,2024-01-01
GOOGL,5,2800.75,2024-01-15
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for educational purposes only. The information provided should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions.
