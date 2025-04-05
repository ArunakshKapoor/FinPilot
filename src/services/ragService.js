import axios from 'axios';

// TODO: Replace with your RAG API endpoint when ready
const RAG_API_ENDPOINT = process.env.RAG_API_ENDPOINT || 'http://your-rag-api-endpoint';

export const getPersonalizedInsights = async (userProfile, portfolio) => {
  try {
    const response = await axios.post(`${RAG_API_ENDPOINT}/insights`, {
      userProfile,
      portfolio,
      timestamp: new Date().toISOString()
    });

    if (!response.data) {
      throw new Error('No data received from RAG API');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting insights from RAG:', error);
    throw new Error(`Failed to get personalized insights: ${error.message}`);
  }
};

export const validateRagApiConnection = async () => {
  try {
    const response = await axios.get(`${RAG_API_ENDPOINT}/health`);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('RAG API health check failed:', error);
    return false;
  }
};

// Expected response format from the RAG API:
/*
{
  summary: string,
  riskAnalysis: {
    title: string,
    content: string,
    recommendations: string[]
  },
  portfolioFit: {
    title: string,
    content: string,
    recommendations: string[]
  },
  actionItems: {
    title: string,
    items: Array<{
      action: string,
      description: string,
      priority: 'High' | 'Medium' | 'Low'
    }>
  }
}
*/ 