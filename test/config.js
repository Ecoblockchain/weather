module.exports = {
  "test": {
    "limits": {
      "base": 10,
      "trade": 0
    },
    "feeders": {
      "bitcoincharts_csv": ["./test/krakenLTC.csv", "BTC", "LTC", 10, 0]
    },
    "deciders": {
      "trendfollower": ["4 hour"]
    },
    "executers": {
      "backtest": []
    }
  }
};
