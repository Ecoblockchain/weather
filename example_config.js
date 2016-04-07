module.exports = [
  {
    "limits": {
      "base": 10,
      "trade": 0
    },
    "feeders": {
      "bitcoincharts_csv": ["./test/krakenLTC.csv", "BTC", "LTC", 10, 0]
    },
    "deciders": {
      "guard": [.25],
      "trendfollower": ["5 minutes", 5, false]
    },
    "executers": {
      "backtest": []
    }
  }
];
