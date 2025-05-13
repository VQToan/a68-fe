/**
 * Chart service to fetch candlestick data from Binance
 */


export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Convert Binance interval to milliseconds for calculating request params
const intervalToMs: Record<string, number> = {
  "1m": 60 * 1000,
  "3m": 3 * 60 * 1000,
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "30m": 30 * 1000,
  "1h": 60 * 60 * 1000,
  "2h": 2 * 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
  "1M": 30 * 24 * 60 * 60 * 1000,
};

/**
 * Fetch candle data directly from Binance public API
 * @param symbol - Trading pair (e.g., 'BTCUSDT')
 * @param interval - Time interval (e.g., '1m', '1h')
 * @param from - Start timestamp in milliseconds
 * @param to - End timestamp in milliseconds
 */
export const fetchCandleData = async (
  symbol: string,
  interval: string,
  from: number,
  to: number
): Promise<CandleData[]> => {
  try {
    // Calculate the approximate number of candles based on time range and interval
    const intervalMs = intervalToMs[interval] || 60000; // Default to 1m if interval not found
    const estimatedCandleCount = Math.ceil((to - from) / intervalMs);

    // Binance limits: Max 1000 candles per request
    const limit = Math.min(1000, estimatedCandleCount);

    // Build Binance API URL - using public API endpoint
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&startTime=${from}&endTime=${to}&limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Binance API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Binance kline format:
    // [
    //  0: Open time
    //  1: Open
    //  2: High
    //  3: Low
    //  4: Close
    //  5: Volume
    //  ...other fields we don't need
    // ]
    return data.map((candle: any[]) => ({
      time: candle[0], // Open time
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
    }));
  } catch (error) {
    console.error("Error fetching candle data from Binance:", error);
    throw error;
  }
};

/**
 * For large date ranges that might exceed Binance's limit of 1000 candles,
 * this function fetches data in chunks
 */
export const fetchLargeCandleDataSet = async (
  symbol: string,
  interval: string,
  from: number,
  to: number
): Promise<CandleData[]> => {
  const intervalMs = intervalToMs[interval] || 60000;
  const maxCandles = 1000;
  const maxTimespan = maxCandles * intervalMs;

  let allCandles: CandleData[] = [];
  let currentFrom = from;

  while (currentFrom < to) {
    const chunkTo = Math.min(currentFrom + maxTimespan, to);
    const candles = await fetchCandleData(
      symbol,
      interval,
      currentFrom,
      chunkTo
    );

    allCandles = [...allCandles, ...candles];

    if (candles.length < maxCandles || chunkTo >= to) {
      break;
    }

    // Set next chunk start time (add 1ms to avoid duplicating the last candle)
    currentFrom = chunkTo + 1;
  }

  return allCandles;
};

/**
 * Get historical candle data for a symbol and interval
 * @param symbol Symbol to get candles for (e.g., "BTCUSDT")
 * @param interval Time interval (e.g., "1m", "5m", "1h")
 * @param startTime Start time in milliseconds
 * @param endTime End time in milliseconds
 * @returns Promise with candle data
 */
export const getCandles = async (
  symbol: string,
  interval: string,
  startTime: number,
  endTime: number
): Promise<{ data: CandleData[] }> => {
  // Use direct Binance API instead of going through our backend
  try {
    const candles = await fetchLargeCandleDataSet(
      symbol,
      interval,
      startTime,
      endTime
    );
    return { data: candles };
  } catch (error) {
    console.error("Error fetching candles from Binance:", error);
    throw error;
  }
};

/**
 * Get available symbols for chart data
 * @returns Promise with available symbols
 */
export const getAvailableSymbols = async (): Promise<{ data: string[] }> => {
  try {
    // Fetch from Binance exchange info API
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter for USDT markets which are most common for trading
    const symbols = data.symbols
      .filter((symbol: any) => symbol.quoteAsset === 'USDT' && symbol.status === 'TRADING')
      .map((symbol: any) => symbol.symbol);
    
    return { data: symbols };
  } catch (error) {
    console.error("Error fetching available symbols:", error);
    throw error;
  }
};

/**
 * Get the latest price for a symbol
 * @param symbol Symbol to get price for (e.g., "BTCUSDT")
 * @returns Promise with latest price data
 */
export const getLatestPrice = async (symbol: string): Promise<{ data: { symbol: string, price: number } }> => {
  try {
    const formattedSymbol = symbol.toUpperCase().includes('USDT') 
      ? symbol.toUpperCase() 
      : `${symbol.toUpperCase()}USDT`;
      
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${formattedSymbol}`);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return { 
      data: {
        symbol: data.symbol,
        price: parseFloat(data.price)
      } 
    };
  } catch (error) {
    console.error("Error fetching latest price:", error);
    throw error;
  }
};
