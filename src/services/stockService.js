import axios from 'axios';
import { FINNHUB_API_KEY } from '@env';

const MOCK_STOCK_DATA = {
  AAPL: {
    c: 175.50,
    d: 2.5,
    dp: 1.45,
    h: 176.20,
    l: 174.30,
    o: 174.50,
    pc: 173.00,
    t: 1234567890
  },
  GOOGL: {
    c: 2800.75,
    d: -15.25,
    dp: -0.54,
    h: 2815.00,
    l: 2795.50,
    o: 2800.00,
    pc: 2816.00,
    t: 1234567890
  },
  MSFT: {
    c: 310.25,
    d: 5.75,
    dp: 1.89,
    h: 311.00,
    l: 308.50,
    o: 309.00,
    pc: 304.50,
    t: 1234567890
  }
};

const MOCK_NEWS = [
  {
    id: 1,
    headline: "Tech stocks rally as market optimism grows",
    source: "Financial Times",
    url: "https://example.com/news/1",
    datetime: new Date().toISOString()
  },
  {
    id: 2,
    headline: "Market analysis: What's driving the current rally?",
    source: "Bloomberg",
    url: "https://example.com/news/2",
    datetime: new Date().toISOString()
  },
  {
    id: 3,
    headline: "Investment strategies for volatile markets",
    source: "Reuters",
    url: "https://example.com/news/3",
    datetime: new Date().toISOString()
  }
];

export const getStockPrice = async (symbol) => {
  if (!FINNHUB_API_KEY) {
    console.log('Using mock data - Finnhub API key not configured');
    return MOCK_STOCK_DATA[symbol] || {
      c: 100.00,
      d: 0,
      dp: 0,
      h: 101.00,
      l: 99.00,
      o: 100.00,
      pc: 100.00,
      t: Date.now()
    };
  }

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return MOCK_STOCK_DATA[symbol] || {
      c: 100.00,
      d: 0,
      dp: 0,
      h: 101.00,
      l: 99.00,
      o: 100.00,
      pc: 100.00,
      t: Date.now()
    };
  }
};

export const getMarketNews = async () => {
  if (!FINNHUB_API_KEY) {
    console.log('Using mock data - Finnhub API key not configured');
    return MOCK_NEWS;
  }

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
    );
    return response.data.slice(0, 10);
  } catch (error) {
    console.error('Error fetching market news:', error);
    return MOCK_NEWS;
  }
};

export const getStockNews = async (symbol) => {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
      params: {
        symbol,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        token: process.env.FINNHUB_API_KEY
      }
    });
    return response.data.slice(0, 5); // Return only the 5 most recent news items
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return [];
  }
};

export const getHistoricalData = async (symbol, resolution = 'D', from, to) => {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to,
        token: process.env.FINNHUB_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
};

export const validateStockSymbol = async (symbol) => {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/stock/symbol`, {
      params: {
        exchange: 'US',
        token: process.env.FINNHUB_API_KEY
      }
    });
    return response.data.some(stock => stock.symbol === symbol);
  } catch (error) {
    console.error('Error validating stock symbol:', error);
    return false;
  }
}; 