const SavedOrders = require('./lib/td/accounts/SavedOrders');
const OrderBuilder = require('./lib/logic/formbuilder/Order');
const c = require('./lib/td/accounts/_const.orders.json');
const constants = require('./lib/td/constants.json');
const LoadedAuth = require('./lib/td/auth/LoadedAuth');
const Option = require('./lib/td/quote/Option');
const Instrument = require('./lib/td/quote/Instrument');
const Price = require('./lib/td/quote/Price');
const Orders = require('./lib/td/accounts/Orders');
const Accounts = require('./lib/td/accounts/Accounts');
const Quote = require('./lib/td/quote/Quote');
const Volatility = require('./lib/td/logic/calc/Volatility');
const StrategyOrder = require('./lib/td/strategy/Order');

async function doit () {

    let tickers = ['XLC', 'XLY', 'XLE', 'XLF', 'XLV', 'XLI', 'XLP', 'XLB', 'XLRE', 'XLK', 'XLU', 'SPY', ] ;
    // let tickers = ['GOOG', 'NFLX', 'TSLA', 'SPY', 'QQQ', 'FB', 'MSFT'] ;
    // let tickers = ['SPX', 'GOOG', 'RUT', 'NFLX', 'TSLA', 'SPY', 'QQQ', 'FB', 'MSFT'] 
    // let tickers = ['T', 'DAL', 'JETS', 'CCL', 'AAL', 'SAVE', 'UBER', 'BAC', 
    //     'SLV', 'KODK', 'TSLA', 'GLD', 'SLV', 'NFLX', 'QQQ', 'AAPL', 'GOOG'];
    let ticker = 'T';
    // let ticker = 'SPX';
    // let ticker = 'SLV';
    // let ticker = 'NFLX';
    // let ticker = 'TSLA';
    // let ticker = 'KODK';
    let quotes = {};
    let quote;
    let targetDTE = 45;
    let targetShortDelta = 0.16;
    let targetLongDelta = 0.05;

    let targetProfitRatio = 0.50;
    let stopLossRatio = 2.0;
    let stopTriggerHeadoffMultiplier = 0.99; //We're BUY_TO_CLOSE on a short option so we want to set a trigger just before our stop 
    // let stopLimit = stopLossRatio * stopTriggerHeadoffMultiplier;

    let tickerIV = []
    let tickerIVMap = {};


    /**
     * create condor: trigger => OCO
     */
    // let result = await StrategyOrder.createCondor(ticker, 1,
    //     targetDTE, targetShortDelta, targetLongDelta,
    //     targetProfitRatio, stopLossRatio, stopTriggerHeadoffMultiplier);
        
    // process.exit(0)
    

    /**
     * create condor: trigger => limit
     */
    // let result = await StrategyOrder.createCondor(ticker, 1,
    //     targetDTE, targetShortDelta, targetLongDelta,
    //     targetProfitRatio);
        
    // process.exit(0)
    
    
    /**
     * form tickerIVMap
     */
    // for (ticker of tickers) {
    //     let chain = (await Option.getOptionChain(ticker, {})).body;
    //     let implV = Volatility.impliedVol(chain);
    //     tickerIVMap[ticker] = {iv: undefined};
    //     tickerIVMap[ticker].iv = implV; 
    // }
    // console.log(tickerIVMap);
    
    // process.exit(0)
    
    /**
     * get one IV
     */
    // let chain = (await Option.getOptionChain(ticker, {})).body;
    // let implV = Volatility.impliedVol(chain, 90);
    // console.log(implV);
    
    // process.exit(0)
    
    /**
     * get Intrument
     */
    // let inst = (await Instrument.getInstrument(ticker)).body;
    // console.log(inst);
    
    // process.exit(0)
    
    /**
     * get Intrument
     */
    //Example: For a 2 day / 1 min chart, the values would be:
    //period: 2
    //periodType: day
    //frequency: 1
    //frequencyType: min
    let periodType = 'day';
    let period = '2';
    let frequencyType = 'min';
    let frequency = '1';
    let hist = (await Price.priceHistory(ticker, periodType, period, frequencyType, frequency)).body;
    console.log(hist);
    
    process.exit(0)
    

    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////


}

doit();

