interface WeightedItem {
  weight: number;
}

interface TimePoint {
  time: number;
  timeWeight?: number;
}

interface ChartOptions {
  localization?: {
    precision: number;
  };
}

function markWithGreaterWeight(a: WeightedItem, b: WeightedItem): WeightedItem {
  return a.weight > b.weight ? a : b;
}

class HorzScaleBehaviorPrice {
  private _options: ChartOptions;

  constructor() {
    this._options = {};
  }

  options(): ChartOptions {
    return this._options;
  }

  setOptions(options: ChartOptions): void {
    this._options = options;
  }

  preprocessData(_data: unknown): void {}

  updateFormatter(options: ChartOptions["localization"]): void {
    if (!this._options) {
      return;
    }
    this._options.localization = options;
  }

  createConverterToInternalObj(_data: unknown): (price: number) => number {
    return (price: number) => price;
  }

  key(internalItem: number): number {
    return internalItem;
  }

  cacheKey(internalItem: number): number {
    return internalItem;
  }

  convertHorzItemToInternal(item: unknown): unknown {
    return item;
  }

  formatHorzItem(item: number): string {
    return item.toFixed(this._precision());
  }

  formatTickmark(item: TimePoint, _localizationOptions: unknown): string {
    return item.time.toFixed(this._precision());
  }

  maxTickMarkWeight(marks: WeightedItem[]): number {
    return marks.reduce(markWithGreaterWeight, marks[0]).weight;
  }

  fillWeightsForPoints(
    sortedTimePoints: TimePoint[],
    startIndex: number
  ): void {
    const priceWeight = (price: number): number => {
      if (price === Math.ceil(price / 100) * 100) {
        return 8;
      }
      if (price === Math.ceil(price / 50) * 50) {
        return 7;
      }
      if (price === Math.ceil(price / 25) * 25) {
        return 6;
      }
      if (price === Math.ceil(price / 10) * 10) {
        return 5;
      }
      if (price === Math.ceil(price / 5) * 5) {
        return 4;
      }
      if (price === Math.ceil(price)) {
        return 3;
      }
      if (price * 2 === Math.ceil(price * 2)) {
        return 1;
      }
      return 0;
    };
    for (let index = startIndex; index < sortedTimePoints.length; ++index) {
      sortedTimePoints[index].timeWeight = priceWeight(
        sortedTimePoints[index].time
      );
    }
  }

  private _precision(): number {
    return this._options?.localization?.precision || 0;
  }
}

const getIntervalInMs = (intervalStr: string): number => {
  const intervalMap: Record<string, number> = {
    "1m": 60 * 1000,
    "3m": 3 * 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
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
  return intervalMap[intervalStr] || 60 * 1000; // Default to 1m if interval not found
};

const getFormattedSymbol = (symbolStr: string) => {
  return symbolStr.toUpperCase().includes("USDT")
    ? symbolStr.toUpperCase()
    : `${symbolStr.toUpperCase()}USDT`;
};

export { HorzScaleBehaviorPrice, getIntervalInMs, getFormattedSymbol };
