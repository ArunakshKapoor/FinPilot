import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { theme } from '../constants/theme';
import { fetchStockPrice, fetchMarketNews } from '../services/marketDataService';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function DashboardScreen({ navigation }) {
  const appTheme = useTheme();
  const { stocks, totalValue, loading: portfolioLoading } = useSelector((state) => state.portfolio);
  
  // State variables
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketNews, setMarketNews] = useState([]);
  const [stockPrices, setStockPrices] = useState({});

  // Calculate total portfolio return (from purchase to today)
  const calculateTotalPortfolioReturn = (stocks, prices) => {
    if (!stocks.length) return 0;

    let totalCost = 0;
    let totalCurrentValue = 0;

    stocks.forEach(stock => {
      const currentPrice = prices[stock.ticker]?.currentPrice || stock.purchasePrice;
      const stockCost = stock.quantity * stock.purchasePrice;
      const stockCurrentValue = stock.quantity * currentPrice;
      
      totalCost += stockCost;
      totalCurrentValue += stockCurrentValue;
    });

    return ((totalCurrentValue - totalCost) / totalCost) * 100;
  };

  // Calculate portfolio allocation data for pie chart
  const calculatePortfolioAllocation = (stocks, prices) => {
    if (!stocks.length) return [];

    const totalValue = stocks.reduce((total, stock) => {
      const currentPrice = prices[stock.ticker]?.currentPrice || stock.purchasePrice;
      return total + (stock.quantity * currentPrice);
    }, 0);

    return stocks.map(stock => {
      const currentPrice = prices[stock.ticker]?.currentPrice || stock.purchasePrice;
      const value = stock.quantity * currentPrice;
      const percentage = (value / totalValue) * 100;

      return {
        name: stock.ticker,
        value: value,
        percentage: percentage,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        legendFontColor: appTheme.colors.text,
        legendFontSize: 12
      };
    });
  };

  // Calculate portfolio gainers and losers
  const calculatePortfolioGainersLosers = (stocks, prices) => {
    if (!stocks.length) return { gainers: [], losers: [] };

    const stockPerformance = stocks.map(stock => {
      const currentPrice = prices[stock.ticker]?.currentPrice || stock.purchasePrice;
      const purchasePrice = stock.purchasePrice;
      const returnPercentage = ((currentPrice - purchasePrice) / purchasePrice) * 100;
      const currentValue = stock.quantity * currentPrice;
      const gainLoss = currentValue - (stock.quantity * purchasePrice);
      
      return {
        ticker: stock.ticker,
        quantity: stock.quantity,
        purchasePrice,
        currentPrice,
        returnPercentage,
        gainLoss,
        currentValue
      };
    });

    // Sort by return percentage
    const sorted = [...stockPerformance].sort((a, b) => b.returnPercentage - a.returnPercentage);
    
    return {
      gainers: sorted.filter(stock => stock.returnPercentage > 0).slice(0, 3),
      losers: sorted.filter(stock => stock.returnPercentage < 0).slice(0, 3)
    };
  };
  
  // Load initial data
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current prices for all stocks
      const pricePromises = stocks.map(stock => fetchStockPrice(stock.ticker));
      const pricesData = await Promise.all(pricePromises);
      
      const newStockPrices = {};
      pricesData.forEach((price, index) => {
        if (!price) {
          throw new Error(`Failed to get price data for ${stocks[index].ticker}`);
        }
        newStockPrices[stocks[index].ticker] = price;
      });
      setStockPrices(newStockPrices);

      // Fetch market news
      const news = await fetchMarketNews();
      if (!news || news.length === 0) {
        throw new Error('No market news data available');
      }
      setMarketNews(news.slice(0, 5));
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      setError(`Failed to load real-time data: ${error.message}`);
      // Clear any stale data
      setStockPrices({});
      setMarketNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPortfolioData();
  }, []);

  // Loading state
  if (portfolioLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
        <Text style={styles.loadingText}>Loading your portfolio...</Text>
      </View>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubText}>Please ensure you have a valid API key configured.</Text>
        <Button 
          mode="contained" 
          onPress={loadPortfolioData} 
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  // Empty portfolio state
  if (!stocks || stocks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Stocks in Portfolio</Text>
          <Text style={styles.emptyText}>Add stocks to your portfolio to see insights and performance data.</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('AddStock')} 
            style={styles.emptyButton}
          >
            Add Your First Stock
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // No price data state
  if (Object.keys(stockPrices).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No Real-Time Data Available</Text>
          <Text style={styles.errorText}>Unable to fetch current market prices. Please check your API configuration.</Text>
          <Button 
            mode="contained" 
            onPress={loadPortfolioData} 
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Portfolio Overview Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Portfolio Overview</Text>
              <View style={styles.portfolioMetrics}>
                <Text style={styles.metricLabel}>Current Value:</Text>
                <Text style={styles.value}>
                  ${stocks.reduce((total, stock) => {
                    const currentPrice = stockPrices[stock.ticker]?.currentPrice || stock.purchasePrice;
                    return total + (stock.quantity * currentPrice);
                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.metricLabel}>Total Investment:</Text>
                <Text style={styles.value}>
                  ${stocks.reduce((total, stock) => total + (stock.quantity * stock.purchasePrice), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[
                  styles.change,
                  { color: calculateTotalPortfolioReturn(stocks, stockPrices) >= 0 ? appTheme.colors.success : appTheme.colors.error }
                ]}>
                  {calculateTotalPortfolioReturn(stocks, stockPrices).toFixed(2)}% total return
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Portfolio Allocation Pie Chart */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Portfolio Allocation</Text>
              {calculatePortfolioAllocation(stocks, stockPrices).length > 0 ? (
                <View style={styles.pieChartContainer}>
                  <PieChart
                    data={calculatePortfolioAllocation(stocks, stockPrices)}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="value"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              ) : (
                <Text style={styles.noDataText}>No allocation data available</Text>
              )}
            </Card.Content>
          </Card>

          {/* Portfolio Gainers and Losers */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Portfolio Impact</Text>
              
              {/* Top Gainers */}
              <View style={styles.impactSection}>
                <Text style={[styles.impactTitle, { color: appTheme.colors.success }]}>Top Gainers</Text>
                {calculatePortfolioGainersLosers(stocks, stockPrices).gainers.length > 0 ? (
                  calculatePortfolioGainersLosers(stocks, stockPrices).gainers.map((stock, index) => (
                    <View key={`gainer-${index}`} style={styles.impactItem}>
                      <View style={styles.impactHeader}>
                        <Text style={styles.impactTicker}>{stock.ticker}</Text>
                        <Text style={[styles.impactValue, { color: appTheme.colors.success }]}>
                          +{stock.returnPercentage.toFixed(2)}%
                        </Text>
                      </View>
                      <View style={styles.impactDetails}>
                        <Text style={styles.impactQuantity}>{stock.quantity} shares</Text>
                        <Text style={[styles.impactGainLoss, { color: appTheme.colors.success }]}>
                          +${stock.gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No gainers in your portfolio</Text>
                )}
              </View>
              
              <Divider style={styles.impactDivider} />
              
              {/* Top Losers */}
              <View style={styles.impactSection}>
                <Text style={[styles.impactTitle, { color: appTheme.colors.error }]}>Top Losers</Text>
                {calculatePortfolioGainersLosers(stocks, stockPrices).losers.length > 0 ? (
                  calculatePortfolioGainersLosers(stocks, stockPrices).losers.map((stock, index) => (
                    <View key={`loser-${index}`} style={styles.impactItem}>
                      <View style={styles.impactHeader}>
                        <Text style={styles.impactTicker}>{stock.ticker}</Text>
                        <Text style={[styles.impactValue, { color: appTheme.colors.error }]}>
                          {stock.returnPercentage.toFixed(2)}%
                        </Text>
                      </View>
                      <View style={styles.impactDetails}>
                        <Text style={styles.impactQuantity}>{stock.quantity} shares</Text>
                        <Text style={[styles.impactGainLoss, { color: appTheme.colors.error }]}>
                          ${stock.gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No losers in your portfolio</Text>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Holdings Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Holdings</Text>
              {stocks.map((stock, index) => {
                const currentPrice = stockPrices[stock.ticker]?.currentPrice || stock.purchasePrice;
                const totalReturn = ((currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;
                const dailyChange = stockPrices[stock.ticker]?.changePercent || 0;

                return (
                  <View key={`holding-${index}`} style={styles.holdingItem}>
                    <View style={styles.holdingHeader}>
                      <Text style={styles.holdingTicker}>{stock.ticker}</Text>
                      <Text style={styles.holdingValue}>
                        ${(stock.quantity * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={styles.holdingDetails}>
                      <View style={styles.holdingInfo}>
                        <Text style={styles.holdingQuantity}>{stock.quantity} shares</Text>
                        <Text style={[
                          styles.holdingReturn,
                          { color: totalReturn >= 0 ? appTheme.colors.success : appTheme.colors.error }
                        ]}>
                          Total Return: {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                        </Text>
                      </View>
                      <View style={styles.dailyChangeContainer}>
                        <Text style={styles.changeLabel}>Today:</Text>
                        <Text style={[
                          styles.changeValue,
                          { color: dailyChange >= 0 ? appTheme.colors.success : appTheme.colors.error }
                        ]}>
                          {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('News')}
            style={styles.button}
          >
            Latest Market News
          </Button>

          {/* Add Profile Button */}
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('UserProfile')} 
            style={[styles.button, { marginTop: 10 }]}
          >
            Get Personalized Insights
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  portfolioMetrics: {
    marginVertical: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: theme.spacing.sm,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  change: {
    fontSize: 16,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  holdingItem: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  holdingTicker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  holdingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingInfo: {
    flex: 1,
  },
  holdingQuantity: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
  },
  holdingReturn: {
    fontSize: 14,
    marginTop: 2,
  },
  dailyChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  changeLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginRight: 4,
  },
  changeValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    marginTop: theme.spacing.md,
  },
  impactSection: {
    marginBottom: theme.spacing.md,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  impactItem: {
    marginBottom: theme.spacing.sm,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactTicker: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  impactValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  impactDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  impactQuantity: {
    fontSize: 12,
    color: theme.colors.text,
  },
  impactGainLoss: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  impactDivider: {
    marginVertical: theme.spacing.md,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  noDataText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  errorSubText: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
}); 