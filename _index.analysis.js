const SavedOrders = require('./lib/td/accounts/SavedOrders');
const OrderBuilder = require('./lib/logic/formbuilder/Order');
const c = require('./lib/td/accounts/_const.orders.json');
const constants = require('./lib/td/constants.json');
const LoadedAuth = require('./lib/td/auth/LoadedAuth');
const Option = require('./lib/td/quote/Option');
const Instrument = require('./lib/td/quote/Instrument');
const Orders = require('./lib/td/accounts/Orders');
const Accounts = require('./lib/td/accounts/Accounts');
const Quote = require('./lib/td/quote/Quote');
const Volatility = require('./lib/td/logic/calc/Volatility');
const StrategyOrder = require('./lib/td/strategy/Order');

async function doit () {

    let tickers = ['T', 'DAL', 'JETS', 'CCL', 'AAL', 'SAVE', 'UBER', 'BAC'];
    let ticker = 'T';
    // let ticker = 'TSLA';
    // let ticker = 'KODK';
    let quotes = {};
    let quote;
    let targetDTE = 45;
    let targetShortDelta = 0.16;
    let targetLongDelta = 0.05;

    let targetProfit = 0.50;
    let stopLoss = 2.0;
    let stopLimitMultiplier = 1.03;
    let stopLimit = stopLoss * stopLimitMultiplier;

    let tickerIV = []
    let tickerIVMap = {};


    let result = await StrategyOrder.createCondor(ticker, 
        targetDTE, targetShortDelta, targetLongDelta,
        targetProfit, stopLoss, stopLimitMultiplier);
        
    process.exit(0)
    
    
    /**
     * form tickerIVMap
     */
    for (ticker of tickers) {
        let chain = (await Option.getOptionChain(ticker, {})).body;
        let implV = Volatility.impliedVol(chain);
        tickerIVMap[ticker] = {iv: undefined};
        tickerIVMap[ticker].iv = implV; 
    }
    console.log(tickerIVMap);
    
    

    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////


}

doit();

