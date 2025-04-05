import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseCSV } from '../utils/csvUtils';

// Async thunk for loading portfolio from storage
export const loadPortfolio = createAsyncThunk(
  'portfolio/loadPortfolio',
  async () => {
    try {
      const storedPortfolio = await AsyncStorage.getItem('portfolio');
      return storedPortfolio ? JSON.parse(storedPortfolio) : {
        stocks: [],
        totalValue: 0,
        dailyChange: 0,
        lastUpdated: null
      };
    } catch (error) {
      console.error('Error loading portfolio:', error);
      return {
        stocks: [],
        totalValue: 0,
        dailyChange: 0,
        lastUpdated: null
      };
    }
  }
);

// Async thunk for saving portfolio to storage
export const savePortfolio = createAsyncThunk(
  'portfolio/savePortfolio',
  async (_, { getState }) => {
    try {
      const portfolio = getState().portfolio;
      const portfolioToSave = {
        stocks: portfolio.stocks,
        totalValue: portfolio.totalValue,
        dailyChange: portfolio.dailyChange,
        lastUpdated: portfolio.lastUpdated
      };
      await AsyncStorage.setItem('portfolio', JSON.stringify(portfolioToSave));
      return portfolioToSave;
    } catch (error) {
      console.error('Error saving portfolio:', error);
      throw error;
    }
  }
);

// Async thunk for processing CSV upload
export const processCSVUpload = createAsyncThunk(
  'portfolio/processCSVUpload',
  async (csvData) => {
    const parsedData = await parseCSV(csvData);
    return parsedData;
  }
);

const initialState = {
  stocks: [],
  totalValue: 0,
  dailyChange: 0,
  loading: false,
  error: null,
  lastUpdated: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addStock: (state, action) => {
      state.stocks.push(action.payload);
      state.totalValue = calculateTotalValue(state.stocks);
      state.lastUpdated = new Date().toISOString();
    },
    removeStock: (state, action) => {
      state.stocks = state.stocks.filter(stock => stock.id !== action.payload);
      state.totalValue = calculateTotalValue(state.stocks);
      state.lastUpdated = new Date().toISOString();
    },
    updateStock: (state, action) => {
      const index = state.stocks.findIndex(stock => stock.id === action.payload.id);
      if (index !== -1) {
        state.stocks[index] = action.payload;
        state.totalValue = calculateTotalValue(state.stocks);
        state.lastUpdated = new Date().toISOString();
      }
    },
    clearPortfolio: (state) => {
      state.stocks = [];
      state.totalValue = 0;
      state.dailyChange = 0;
      state.lastUpdated = new Date().toISOString();
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPortfolio.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload.stocks;
        state.totalValue = action.payload.totalValue;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(loadPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(savePortfolio.fulfilled, (state, action) => {
        state.stocks = action.payload.stocks;
        state.totalValue = action.payload.totalValue;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(processCSVUpload.pending, (state) => {
        state.loading = true;
      })
      .addCase(processCSVUpload.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload;
        state.totalValue = calculateTotalValue(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(processCSVUpload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Helper function to calculate total portfolio value
const calculateTotalValue = (stocks) => {
  return stocks.reduce((total, stock) => {
    return total + (stock.quantity * (stock.currentPrice || stock.purchasePrice));
  }, 0);
};

export const { addStock, removeStock, updateStock, clearPortfolio, setError, clearError } = portfolioSlice.actions;
export default portfolioSlice.reducer; 