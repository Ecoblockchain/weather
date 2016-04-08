module.exports = [
  {
    "feeders": {
      "bitcoincharts_csv": ["./test/krakenLTC.csv", "BTC", "LTC", 10, 0]
    },
    "analyzers": {
      "candlestick": ["5 minutes"]
    },
    "deciders": {
      "guard": [.25],
      "trendfollower": [5, true]
    },
    "executers": {
      "backtest": []
    }
  }
];
