import { v4 as uuidv4 } from 'uuid';

export const parseCSV = async (csvData) => {
  try {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const requiredHeaders = ['ticker', 'quantity', 'price', 'date'];
    const missingHeaders = requiredHeaders.filter(
      header => !headers.includes(header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const stocks = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const stock = {
        id: uuidv4(),
        ticker: values[headers.indexOf('ticker')].toUpperCase(),
        quantity: parseFloat(values[headers.indexOf('quantity')]),
        purchasePrice: parseFloat(values[headers.indexOf('price')]),
        purchaseDate: values[headers.indexOf('date')],
        currentPrice: 0, // Will be updated with real-time data
      };

      if (isNaN(stock.quantity) || isNaN(stock.purchasePrice)) {
        throw new Error('Invalid numeric values in CSV');
      }

      if (!isValidDate(stock.purchaseDate)) {
        throw new Error('Invalid date format in CSV');
      }

      return stock;
    });

    return stocks;
  } catch (error) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};

export const generateCSV = (portfolio) => {
  try {
    const headers = ['ticker', 'quantity', 'price', 'date'];
    const csvRows = [headers.join(',')];

    portfolio.forEach(entry => {
      const row = headers.map(header => entry[header]);
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  } catch (error) {
    throw new Error(`Error generating CSV: ${error.message}`);
  }
};

export const validatePortfolioData = (stocks) => {
  const errors = [];

  stocks.forEach((stock, index) => {
    if (!stock.ticker || stock.ticker.length === 0) {
      errors.push(`Row ${index + 1}: Missing ticker symbol`);
    }

    if (!stock.quantity || stock.quantity <= 0) {
      errors.push(`Row ${index + 1}: Invalid quantity`);
    }

    if (!stock.purchasePrice || stock.purchasePrice <= 0) {
      errors.push(`Row ${index + 1}: Invalid purchase price`);
    }

    if (!isValidDate(stock.purchaseDate)) {
      errors.push(`Row ${index + 1}: Invalid purchase date`);
    }
  });

  return errors;
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}; 