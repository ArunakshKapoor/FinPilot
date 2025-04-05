import axios from 'axios';
import { FINNHUB_API_KEY } from '@env';

const finnhubClient = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  headers: {
    'X-Finnhub-Token': FINNHUB_API_KEY,
  },
});

// Validate API key and configuration
const validateApiKey = () => {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key is not configured. Please check your environment variables.');
  }
};

// Helper function to calculate percentage change
const calculatePercentageChange = (currentPrice, previousPrice) => {
  if (!previousPrice || previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

// Function to get historical price for a specific date
const getHistoricalPriceForDate = async (symbol, timestamp) => {
  try {
    validateApiKey();
    const response = await finnhubClient.get(`/stock/candle`, {
      params: {
        symbol,
        resolution: 'D',
        from: timestamp - 24 * 60 * 60, // One day before to ensure we get the price
        to: timestamp + 24 * 60 * 60    // One day after to ensure we get the price
      }
    });

    if (response.data.s === 'ok' && response.data.c && response.data.c.length > 0) {
      return response.data.c[0]; // Return the closing price
    }
    return null;
  } catch (error) {
    console.error(`Error fetching historical price for ${symbol}:`, error);
    return null;
  }
};

// Enhanced stock price fetch with historical changes
export const fetchStockPrice = async (symbol) => {
  try {
    // Get current quote
    const quoteResponse = await finnhubClient.get(`/quote?symbol=${symbol}`);
    const currentPrice = quoteResponse.data.c;

    // Calculate timestamps for 1 month and 1 year ago
    const now = Math.floor(Date.now() / 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60);
    const oneYearAgo = now - (365 * 24 * 60 * 60);

    // Get historical prices
    const [monthPrice, yearPrice] = await Promise.all([
      getHistoricalPriceForDate(symbol, oneMonthAgo),
      getHistoricalPriceForDate(symbol, oneYearAgo)
    ]);

    // Calculate percentage changes
    const monthlyChangePercent = calculatePercentageChange(currentPrice, monthPrice);
    const yearlyChangePercent = calculatePercentageChange(currentPrice, yearPrice);

    return {
      currentPrice: quoteResponse.data.c,
      change: quoteResponse.data.d,
      changePercent: quoteResponse.data.dp,
      high: quoteResponse.data.h,
      low: quoteResponse.data.l,
      open: quoteResponse.data.o,
      previousClose: quoteResponse.data.pc,
      timestamp: quoteResponse.data.t,
      monthlyChangePercent,
      yearlyChangePercent
    };
  } catch (error) {
    throw new Error(`Failed to fetch stock price for ${symbol}: ${error.message}`);
  }
};

export const fetchStockNews = async (symbol) => {
  try {
    const response = await finnhubClient.get(`/company-news?symbol=${symbol}&from=2024-01-01&to=2024-12-31`);
    return response.data.map(article => ({
      id: article.id,
      title: article.headline,
      source: article.source,
      date: new Date(article.datetime * 1000).toISOString(),
      url: article.url,
      summary: article.summary,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch news for ${symbol}: ${error.message}`);
  }
};

export const fetchMarketNews = async () => {
  try {
    const response = await finnhubClient.get('/news?category=general');
    return response.data.map(article => ({
      id: article.id,
      title: article.headline,
      source: article.source,
      date: new Date(article.datetime * 1000).toISOString(),
      url: article.url,
      summary: article.summary,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch market news: ${error.message}`);
  }
};

export const fetchCompanyProfile = async (symbol) => {
  try {
    const response = await finnhubClient.get(`/stock/profile2?symbol=${symbol}`);
    return {
      name: response.data.name,
      ticker: response.data.ticker,
      country: response.data.country,
      currency: response.data.currency,
      exchange: response.data.exchange,
      ipo: response.data.ipo,
      marketCapitalization: response.data.marketCapitalization,
      phone: response.data.phone,
      shareOutstanding: response.data.shareOutstanding,
      weburl: response.data.weburl,
      logo: response.data.logo,
      finnhubIndustry: response.data.finnhubIndustry,
    };
  } catch (error) {
    throw new Error(`Failed to fetch company profile for ${symbol}: ${error.message}`);
  }
};

export const fetchHistoricalData = async (symbol, resolution = 'D', from, to) => {
  try {
    // For S&P 500 data, return mock data
    if (symbol === '^GSPC') {
      // Filter mock data based on the requested time range
      const filteredData = {
        t: MOCK_SP500_DATA.t.filter(timestamp => timestamp >= from && timestamp <= to),
        c: MOCK_SP500_DATA.c.slice(
          MOCK_SP500_DATA.t.findIndex(timestamp => timestamp >= from),
          MOCK_SP500_DATA.t.findIndex(timestamp => timestamp > to) + 1
        ),
        s: 'ok'
      };
      
      if (filteredData.t.length === 0) {
        throw new Error('No data available for the specified time range');
      }
      
      return filteredData;
    }

    // For other symbols, try the API
    validateApiKey();
    
    const response = await finnhubClient.get(`/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to
      }
    });

    // Check if the response contains valid data
    if (response.data.s === 'no_data') {
      throw new Error('No historical data available for the specified period');
    }

    // Validate that we have all required data points
    if (!response.data.t || !response.data.c || response.data.t.length === 0) {
      throw new Error('Invalid or incomplete historical data received');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 403) {
        throw new Error('API access denied. Please check your API key configuration.');
      } else if (error.response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
    }
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
  }
}; 