import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const MOCK_INSIGHTS = {
  portfolio: {
    risk: "Your portfolio shows moderate risk with a good mix of growth and value stocks.",
    diversification: "Consider adding more international exposure to improve diversification.",
    performance: "Overall portfolio performance is above market average.",
    recommendations: [
      "Consider increasing allocation to technology sector",
      "Add more defensive stocks for better risk management",
      "Look into emerging market opportunities"
    ]
  },
  stock: {
    analysis: "This stock shows strong fundamentals with good growth potential.",
    sentiment: "Market sentiment is positive with increasing institutional interest.",
    outlook: "Short-term outlook is bullish, but monitor market conditions.",
    risks: [
      "Market volatility",
      "Industry competition",
      "Economic factors"
    ]
  }
};

export const getPortfolioInsights = async (portfolio) => {
  if (!OPENAI_API_KEY) {
    console.log('Using mock data - OpenAI API key not configured');
    return MOCK_INSIGHTS.portfolio;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor providing portfolio analysis.'
          },
          {
            role: 'user',
            content: `Analyze this portfolio: ${JSON.stringify(portfolio)}`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error getting portfolio insights:', error);
    return MOCK_INSIGHTS.portfolio;
  }
};

export const getStockAnalysis = async (symbol) => {
  if (!OPENAI_API_KEY) {
    console.log('Using mock data - OpenAI API key not configured');
    return MOCK_INSIGHTS.stock;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst providing stock analysis.'
          },
          {
            role: 'user',
            content: `Analyze this stock: ${symbol}`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error getting stock analysis:', error);
    return MOCK_INSIGHTS.stock;
  }
}; 