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

    let optionChain;
    let closestToTargetDTE;
    let netDebitOrCredit;
    let dteStrikesFull = {};
    let condorStrikeMap = {};
    let entryAndExitPrices = {};
    let targetProfit = 0.50;
    let stopLoss = 2.0;
    let stopLimit = stopLoss * 1.03;

    let tickerIV = []

    

    /**
     * get option chain
     */ 
    optionChain = (await Option.getOptionChain(ticker, {})).body;
    // console.log(optionChain);

    /**
     * calc implied volatility per ticker
     */

    console.log(Volatility.impliedVol(optionChain));
    process.exit(0)

    quote = (await Quote.getQuotes(ticker)).body;
    console.log(quote);

    tickerIVMap = {};

    /**
     * Get target date in chain
     * 
     */
    let datesInChain = [];
    datesInChain = getDatesInChain(optionChain.callExpDateMap);
    closestToTargetDTE = getClosestDateToDTE(datesInChain, targetDTE);
    console.log(closestToTargetDTE);
    // console.log(optionChain.response.toJSON().body);
    // console.log(optionChain.body);
    // console.log(optionChain.body.callExpDateMap);
    // console.log(result.body.callExpDateMap);
    // console.log(result.body.callExpDateMap['2020-08-21:10']);
    // console.log(result.body.callExpDateMap['2020-08-21:10']['3.0']);
    // console.log(result.body.putExpDateMap['2020-07-31:2']['20.0']);
    // console.log(result.body.putExpDateMap['2020-07-31:2']['20.0'][0]);
    // console.log(result.body.callExpDateMap['2020-08-21:10']['3.0'][0].delta);
    // console.log(result.body.callExpDateMap['2020-08-21:10']['3.0'][0].symbol);

    /**
     * Collect map of strike-deltas for all Call and Puts from closestToTargetDTE
     */
    dteStrikesFull = {
        call: optionChain.callExpDateMap[closestToTargetDTE],
        put: optionChain.putExpDateMap[closestToTargetDTE],
    }
    let strikeDeltaMap = loadStrikeDeltaMap(dteStrikesFull);
    console.log(strikeDeltaMap);
    // { call:
    //     { '23.0': 0.935,
    //       '23.5': 0.936,
    //       '24.0': 0.936,

    /**
     * Load map of short and long strikes
     */
    condorStrikeMap = {
        short: {
            call: undefined,
            put: undefined
        },
        long: {
            call: undefined,
            put: undefined
        }
    }
    let closestShortCallDelta = getClosestNumber(Object.values(strikeDeltaMap.call), targetShortDelta);
    let closestShortPutDelta = getClosestNumber(Object.values(strikeDeltaMap.put), targetShortDelta);
    let closestLongCallDelta = getClosestNumber(Object.values(strikeDeltaMap.call), targetLongDelta);
    let closestLongPutDelta = getClosestNumber(Object.values(strikeDeltaMap.put), targetLongDelta);
    console.log(closestShortCallDelta);
    console.log(closestShortPutDelta);
    console.log(closestLongCallDelta);
    console.log(closestLongPutDelta);
    
    Object.entries(strikeDeltaMap.call).map(callStrikeDelta => {
        if (callStrikeDelta[1] === closestShortCallDelta) { 
            condorStrikeMap.short.call = {
                strike: callStrikeDelta[0],
                full: dteStrikesFull.call[callStrikeDelta[0]][0]
            };
            // condorStrikeMap.short.call = {[callStrikeDelta[0]]: DTEStrikesFull.call[callStrikeDelta[0]][0]};
            // condorStrikeMap.short.call = {[callStrikeDelta[0]]: callStrikeDelta[1]};
            // condorStrikeMap.short.call = callStrikeDelta; //[0.32, 0.183]
        }
        if (callStrikeDelta[1] === closestLongCallDelta) { 
            condorStrikeMap.long.call = {
                strike: callStrikeDelta[0],
                full: dteStrikesFull.call[callStrikeDelta[0]][0]
            };
            // condorStrikeMap.long.call = {[callStrikeDelta[0]]: DTEStrikesFull.call[callStrikeDelta[0]][0]};
            // condorStrikeMap.long.call = {[callStrikeDelta[0]]: callStrikeDelta[1]};
            // condorStrikeMap.long.call = callStrikeDelta;
        }
    });
    Object.entries(strikeDeltaMap.put).map(putStrikeDelta => {
        if (putStrikeDelta[1] === closestShortPutDelta) { 
            condorStrikeMap.short.put = {
                strike: putStrikeDelta[0], 
                full: dteStrikesFull.put[putStrikeDelta[0]][0]
            };
            // condorStrikeMap.short.put = {[putStrikeDelta[0]]: DTEStrikesFull.put[putStrikeDelta[0]][0]};
            // condorStrikeMap.short.put = {[putStrikeDelta[0]]: putStrikeDelta[1]};
            // condorStrikeMap.short.put = putStrikeDelta;
        }
        if (putStrikeDelta[1] === closestLongPutDelta) { 
            condorStrikeMap.long.put = {
                strike: putStrikeDelta[0],
                full: dteStrikesFull.put[putStrikeDelta[0]][0]
            };
            // condorStrikeMap.long.put = {[putStrikeDelta[0]]: DTEStrikesFull.put[putStrikeDelta[0]][0]};
            // condorStrikeMap.long.put = {[putStrikeDelta[0]]: putStrikeDelta[1]};
            // condorStrikeMap.long.put = putStrikeDelta;
        }
    });

    // console.log(JSON.stringify(DTEStrikesFull, undefined, 2));
    console.log(JSON.stringify(condorStrikeMap, undefined, 2));
    
    /** 
     * Get the net credit amount
     */
    // -add the shorts
    // -subtract the long
    netDebitOrCredit = condorStrikeMap.short.call.full.bid 
    + condorStrikeMap.short.put.full.bid
    - condorStrikeMap.long.call.full.ask
    - condorStrikeMap.long.put.full.ask;
    console.log('netDebitOrCredit', netDebitOrCredit);

    /**
     * Calculate the exit price(s)
     */
    entryAndExitPrices = {
        entry: Math.round(netDebitOrCredit * 100) / 100,
        limit: Math.round(netDebitOrCredit * targetProfit * 100) / 100, 
        stop: Math.round(netDebitOrCredit * stopLoss * 100) / 100,
        stop_limit: Math.round(netDebitOrCredit * stopLimit * 100) / 100
    }
    console.log(JSON.stringify(entryAndExitPrices, undefined, 2));

    /*************************
     * 
     * Save Order 
     * 
     */

    /**
     * Assemble Trigger
     */
    let orderLeg_shortCall = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.SELL_TO_OPEN,
        1, //quan
        condorStrikeMap.short.call.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let orderLeg_shortPut = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.SELL_TO_OPEN,
        1, //quan
        condorStrikeMap.short.put.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let orderLeg_longCall = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.BUY_TO_OPEN,
        1, //quan
        condorStrikeMap.long.call.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let orderLeg_longPut = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.BUY_TO_OPEN,
        1, //quan
        condorStrikeMap.long.put.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let payload = OrderBuilder.order(
        entryAndExitPrices.entry, //price (string?)
        [orderLeg_shortCall,
            orderLeg_shortPut,
            orderLeg_longCall,
            orderLeg_longPut
        ],
        c.orderStrategyType.SINGLE,
        c.orderType.NET_CREDIT,
        c.duration.DAY,
        c.session.NORMAL,
        c.complexOrderStrategyType.CUSTOM);
        
    // result = await SavedOrders.createSavedOrder(payload);
    // result = await Orders.createOrder(payload);
    
    /**
     * Append payload with trade exit
     */
    let childOrderLeg_shortCall = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.BUY_TO_CLOSE,
        1, //quan
        condorStrikeMap.short.call.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let childOrderLeg_shortPut = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.BUY_TO_CLOSE,
        1, //quan
        condorStrikeMap.short.put.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let childOrderLeg_longCall = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.SELL_TO_CLOSE,
        1, //quan
        condorStrikeMap.long.call.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let childOrderLeg_longPut = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.SELL_TO_CLOSE,
        1, //quan
        condorStrikeMap.long.put.full.symbol, //symbol
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let childPayload = OrderBuilder.order(
        entryAndExitPrices.limit, //price (string?)
        [childOrderLeg_shortCall,
            childOrderLeg_shortPut,
            childOrderLeg_longCall,
            childOrderLeg_longPut
        ],
        c.orderStrategyType.SINGLE,
        c.orderType.NET_CREDIT,
        c.duration.DAY,
        c.session.NORMAL,
        c.complexOrderStrategyType.CUSTOM);

    payload.childOrderStrategies = [childPayload];
    payload.orderStrategyType = c.orderStrategyType.TRIGGER;
    result = await Orders.createOrder(payload);

}

doit();


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// callExpDateMap:
//    { '2020-08-21:6':
//       { '3.0': [Array],

function getDays (dateStr) {
    let days = dateStr.split(':')[1];
    return days;
}

function getClosestDateToDTE(datesArray, targetDay) {
    let lowestDiffToDays = 999999;
    let nearestDate;
    datesArray.map(date => {
        let diffToDays = Math.abs(targetDay - parseInt(getDays(date)));
        if (diffToDays < lowestDiffToDays) {
            lowestDiffToDays = diffToDays;
            nearestDate = date;
        }
    });
    return nearestDate;
}

function getDatesInChain(callExpDateMap) {
    let dates = [];
    Object.keys(callExpDateMap).map(callOpt => {
        dates.push(callOpt);
        // console.log(getDays(callOpt));
    });
    return dates;
} 

function loadStrikeDeltaMap(dteStrikesFull) {
    let strikeDeltaMap = {
        call: {},
        put: {}
    }
    Object.keys(dteStrikesFull.call).map(strike => {
        let strikeObj = dteStrikesFull.call[strike];
        strikeDeltaMap.call[strike] = strikeObj[0].delta
    });
    Object.keys(dteStrikesFull.put).map(strike => {
        let strikeObj = dteStrikesFull.put[strike];
        strikeDeltaMap.put[strike] = strikeObj[0].delta
    });
    return strikeDeltaMap;
}

function getClosestNumber(numbersArray, targetNum) {
    let lowestDiffToNum = 999999;
    let nearestNum;
    numbersArray.map(num => {
        let diffToTargetNum = Math.abs(Math.abs(targetNum) - Math.abs(num));
        if (diffToTargetNum < lowestDiffToNum) {
            lowestDiffToNum = diffToTargetNum;
            nearestNum = num;
        }
    });
    return nearestNum;
}