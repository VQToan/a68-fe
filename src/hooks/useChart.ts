import { useState, useCallback } from 'react';
import * as chartService from '@services/chart.service';
import type { CandleData } from '@services/chart.service';

/**
 * Custom hook để lấy và quản lý dữ liệu biểu đồ
 */
export const useChart = () => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy dữ liệu nến từ Binance
   * @param symbol Cặp giao dịch (ví dụ: 'BTCUSDT')
   * @param interval Khung thời gian (ví dụ: '1m', '1h')
   * @param startTime Thời gian bắt đầu (milliseconds)
   * @param endTime Thời gian kết thúc (milliseconds)
   */
  const fetchCandles = useCallback(async (
    symbol: string,
    interval: string,
    startTime: number,
    endTime: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Đảm bảo symbol được định dạng đúng (thêm 'USDT' nếu cần)
      const formattedSymbol = symbol.toUpperCase().includes('USDT') 
        ? symbol.toUpperCase() 
        : `${symbol.toUpperCase()}USDT`;

      // Lấy dữ liệu nến từ Binance qua service đã cập nhật
      const response = await chartService.getCandles(
        formattedSymbol,
        interval,
        startTime,
        endTime
      );
      setChartData(response.data);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching chart data:', err);
      setError(err.message || 'Không thể tải dữ liệu biểu đồ');
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Lấy thông tin các symbols có sẵn từ API
   */
  const getSymbols = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy danh sách symbols từ API
      const response = await chartService.getAvailableSymbols();
      
      setLoading(false);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching available symbols:', err);
      setError(err.message || 'Không thể tải danh sách symbols');
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Lấy giá mới nhất cho một symbol
   * @param symbol Cặp giao dịch (ví dụ: 'BTCUSDT')
   */
  const getPrice = useCallback(async (symbol: string) => {
    try {
      // Lấy giá mới nhất từ API
      const response = await chartService.getLatestPrice(symbol);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching latest price:', err);
      throw err;
    }
  }, []);

  return {
    chartData,
    loading,
    error,
    fetchCandles,
    getSymbols,
    getPrice
  };
};