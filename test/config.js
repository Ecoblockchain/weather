module.exports = {
  "test": {
    "limits": {
      "base": 10,
      "trade": 0
    },
    "feeders": {
      "bitcoincharts_csv": ["./test/coinbaseUSD.csv", "BTC", "USD", 10, 0]
    },
    "deciders": {
      //"guard": [.0005],
      "trendfollower": ["4 hour"]
    },
    "executers": {
      "backtest": []
    }
  }
};
