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
    "name": "Test Strategy",
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
    }, 
    "summarizers": {
      "overview": [],
      "graph": []
    }
  }
];

```

The configuration consists of specifying feeders, analyzers, deciders, executers, and summarizers that together form a strategy. Your configuration should be an array of one more strategies. Feeders, analyzers, deciders, executers and summarizers have different responsibilities within a strategy:

* Feeders feed market data and account state to the strategy. In the example above, we're feeding CSV data from the file `./test/krakenLTC.csv` that was pulled from [bitcoincharts](https://api.bitcoincharts.com/v1/csv/) for the purposes of backtesting. The currencies being traded are BTC and LTC, with starting amounts of 10 BTC and 0 LTC.
* Analyzers use a specific formula or method to analyze the market and provide information to deciders. The analyzer specified in the example above takes tick data and converts it into candlesticks with 5 minute resolution that can be used by the deciders.
* Deciders decide when to make and cancel trades, and decide trade amounts. Here we have a strategy of two deciders: One that follows the trend via the candlestick analyzer, confirming trends after 5 successful candlesticks; and the other cutting our losses after the market goes the wrong direction by 25%. 
* Executors execute the trades. Here we have a backtest executor which automatically fills all trades. 
* Lastly, summarizers display the trade summary in creative ways, and do not take part in the trading process until the end. Here we have the overview summarizer -- the default -- which provies a text-based overview, as well as a graph summarizer which creates that shows the trades over time against market action.

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

### Live Backtesting

Not satisfied with testing your strategy against a bunch of old data? You don't have to. Just use a live feeder (such as the Poloniex feeder) with the backtest executor and get a good sense of how your strategy will perform in real time.

### Graphing Trades

The "graph" summarizer will automatically graph the final trade data for you, creating an HTML file that will display the graph.

![Example Graph](https://raw.githubusercontent.com/tcoulter/weather/master/images/example_for_readme.png)

There's still more work to be done to display all needed information on the graph, like volume, and more accurate highs and lows. 


### Work Requests

Any and all help would be much appreciated. Here's what I think needs to be done in the short term:

* ~~Break out deciders into both deciders and analyzers.~~
* Graph trade output against the market to see when positions were opened or closed.
* Feeders: ~~Poloniex~~, Kraken, Bitfinex, etc.
* Executors: Poloniex, Kraken, Bitfinex, etc. 
* More mathematical market analyzers like MACD and Bollinger Bands, moving averages, etc.
* More realistic backtesting.


### Donate

If you found this useful, please donate. 

Ether: 0x2a3a69c490dd4c3b15959d4df6531d37e4f3e0d6