# Weather

Because playing the markets is like predicting the weather.

### Goal

Weather plans to be an easily configurable, backtest-able trading bot able to execute multiple trading strategies simultaneously. It aims to allow for trading against one currency, or many, on one or multiple exchanges, allowing for regular trading as well as arbitrage. Note that there is still more work to be done. 

### Usage

```
$ git clone https://github.com/tcoulter/weather
$ cd weather
$ npm install
$ ./bin/weather.js -c ./example_config.js
```

### Configuration

Configuration is a Javascript or JSON file that looks like this:

```javascript
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
      "trendfollower": [5]
    },
    "executers": {
      "backtest": []
    }
  }
];

```

The configuration consists of specifying feeders, analyzers, deciders and executers, that together form a strategy. Your configuration should be an array of one more strategies. Feeders, analyzers, deciders, and executers have different responsibilities within a strategy:

* Feeders feed market data and account state to the strategy. In the example above, we're feeding CSV data from the file `./test/krakenLTC.csv` that was pulled from [bitcoincharts](https://api.bitcoincharts.com/v1/csv/) for the purposes of backtesting. The currencies being traded are BTC and LTC, with starting amounts of 10 BTC and 0 LTC.
* Analyzers use a specific formula or method to analyze the market and provide information to deciders. The analyzer specified in the example above takes tick data and converts it into candlesticks with 5 minute resolution that can be used by the deciders.
* Deciders decide when to make and cancel trades, and decide trade amounts. Here we have a strategy of two deciders: One that follows the trend via the candlestick analyzer, confirming trends after 5 successful candlesticks; and the other cutting our losses after the market goes the wrong direction by 25%. 
* Executors execute the trades. Here we have a backtest executor which automatically fills all trades. 

You can potentionally have multiple feeders, analyzers, deciders and executors depending on your strategy. Some deciders expect a specific analyzer to exist within the configuration and will error if the analyzer is not present.

### Output

When running `./bin/weather.js`, you'll get output for the most successful strategy, which looks like this:

```
[... all trades for this strategy ...]
------------------
Strategy:
   Guard: 0.25
   Trendfollower: 5,true
   Candlestick: 5 minutes

Total Trades:  114
Profit:  44.17737732051443
Loss:  14.856173361874792
P/L %:  33.628463849473704
Total P/L:  29.32120395863964
```  

### Tuning Strategies

You can use `./test/runner.js` to create very fine-tuned strategies and then run them in parallel using all your processor cores. Though it's a brute force method, you can fine tune your strategies to determine the best parameters for your specific markets.  

### Work Requests

Any and all help would be much appreciated. Here's what I think needs to be done in the short term:

* ~~Break out deciders into both deciders and analyzers.~~
* Graph trade output against the market to see when positions were opened or closed.
* Trade executors and feeders: Poloniex, Kraken, Bitfinex, etc. 
* More mathematical market analyzers like MACD and Bollinger Bands, moving averages, etc.
* More realistic backtesting.


### Donate

If you found this useful, please donate. 

Ether: 0x2a3a69c490dd4c3b15959d4df6531d37e4f3e0d6