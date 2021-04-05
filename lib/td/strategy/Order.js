const Orders = require('../accounts/Orders');
const OrderBuilder = require('../../logic/formbuilder/Order');
const Option = require('../quote/Option');
const Util = require('../Util');
const c = require('../accounts/_const.orders.json');

class Order {

    static async createCondor(ticker, quantity,
        targetDTE, targetShortDelta, targetLongDelta, 
        targetProfitRatio = 0, stopLossRatio = 0, stopTriggerHeadoffMultiplier = 0
        ) {
        
        let isTrigger = false;    
        let isOCO = false;    
        if (targetProfitRatio !== 0) {
            isTrigger = true;
        }
        if (stopLossRatio !== 0) {
            isOCO = true;
        }
        
        // let targetProfit = 0.50;
        // let stopLoss = 2.0;
        // let stopLimit = stopLoss * 1.03;

        /**
         * Fetch the chain
         */
        let optionChain = (await Option.getOptionChain(ticker, {})).body;
        // console.log(optionChain); 

        /**
         * Get target date in chain
         * 
         */
        let datesInChain = [];
        datesInChain = Util.getDatesInChain(optionChain);
        let closestToTargetDTE = Util.getClosestDateToDTE(datesInChain, targetDTE);
        console.log(closestToTargetDTE);

        /**
         * Collect map of strike-deltas for all Call and Puts from closestToTargetDTE
         */
        let dteStrikesFull = {
                call: optionChain.callExpDateMap[closestToTargetDTE],
                put: optionChain.putExpDateMap[closestToTargetDTE],
        }
        let strikeDeltaMap = Util.loadStrikeDeltaMap(dteStrikesFull);
        console.log(strikeDeltaMap);
        // { call:
        //     { '23.0': 0.935,
        //       '23.5': 0.936,
        //       '24.0': 0.936,

        /**
         * Load map of short and long strikes
         */
        let condorStrikeMap = {
            short: {
                call: undefined,
                put: undefined
            },
            long: {
                call: undefined,
                put: undefined
            }
        }
        let closestShortCallDelta = Util.getClosestNumber(Object.values(strikeDeltaMap.call), targetShortDelta);
        let closestShortPutDelta = Util.getClosestNumber(Object.values(strikeDeltaMap.put), targetShortDelta);
        let closestLongCallDelta = Util.getClosestNumber(Object.values(strikeDeltaMap.call), targetLongDelta);
        let closestLongPutDelta = Util.getClosestNumber(Object.values(strikeDeltaMap.put), targetLongDelta);
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
        let netDebitOrCredit = condorStrikeMap.short.call.full.bid 
        + condorStrikeMap.short.put.full.bid
        - condorStrikeMap.long.call.full.ask
        - condorStrikeMap.long.put.full.ask;
        console.log('netDebitOrCredit', netDebitOrCredit);

        /**
         * Calculate the exit price(s)
         */
        let entryAndExitPrices = {
            entryPrice: Math.round(netDebitOrCredit * 100) / 100,
            limitPrice: Math.round(netDebitOrCredit * targetProfitRatio * 100) / 100, 
            stopLimitPrice: Math.round(netDebitOrCredit * stopLossRatio * 100) / 100,
            stopPrice: undefined
        }
        //this is the one which activates the stop, not the exit price
        entryAndExitPrices.stopPrice = Math.round(entryAndExitPrices.stopLimitPrice * stopTriggerHeadoffMultiplier * 100) / 100;
        
        console.log(JSON.stringify(entryAndExitPrices, undefined, 2));

        /*************************
         * 
         * Create Order 
         * 
         */

        /**
         * Assemble Trigger
         */
        let orderLeg_shortCall = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.SELL_TO_OPEN,
            quantity, //quan
            condorStrikeMap.short.call.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let orderLeg_shortPut = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.SELL_TO_OPEN,
            quantity, //quan
            condorStrikeMap.short.put.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let orderLeg_longCall = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.BUY_TO_OPEN,
            quantity, //quan
            condorStrikeMap.long.call.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let orderLeg_longPut = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.BUY_TO_OPEN,
            quantity, //quan
            condorStrikeMap.long.put.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let payload = OrderBuilder.order(
            entryAndExitPrices.entryPrice, //price (string?)
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
        
        if (isTrigger) {
            payload.orderStrategyType = c.orderStrategyType.TRIGGER;
        }
            
        // result = await SavedOrders.createSavedOrder(payload);
        // result = await Orders.createOrder(payload);
        
        /**
         * Append payload with trade exit(s)
         */

        /////////////// CHILD LIMIT ////////////////////
        let childOrderLegLIMIT_shortCall = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.BUY_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.short.call.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childOrderLegLIMIT_shortPut = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.BUY_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.short.put.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childOrderLegLIMIT_longCall = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.SELL_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.long.call.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childOrderLegLIMIT_longPut = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.SELL_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.long.put.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childPayloadLIMIT = OrderBuilder.order(
            entryAndExitPrices.limitPrice, //price (string?)
            [childOrderLegLIMIT_shortCall,
                childOrderLegLIMIT_shortPut,
                childOrderLegLIMIT_longCall,
                childOrderLegLIMIT_longPut
            ],
            c.orderStrategyType.SINGLE,
            c.orderType.NET_DEBIT,
            c.duration.GOOD_TILL_CANCEL,
            c.session.NORMAL,
            c.complexOrderStrategyType.CUSTOM);
        
        /////////////// CHILD STOP ////////////////////
        let childOrderLegSTOP_shortCall = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.BUY_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.short.call.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childOrderLegSTOP_shortPut = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.BUY_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.short.put.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childOrderLegSTOP_longCall = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.SELL_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.long.call.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childOrderLegSTOP_longPut = OrderBuilder.orderLeg(
            c.orderLegCollection.instruction.SELL_TO_CLOSE,
            quantity, //quan
            condorStrikeMap.long.put.full.symbol, //symbol
            c.orderLegCollection.instrument.assetType.OPTION
        );
        let childPayloadSTOP = OrderBuilder.order(
            entryAndExitPrices.stopLimitPrice, //price (string?)
            [childOrderLegSTOP_shortCall,
                childOrderLegSTOP_shortPut,
                childOrderLegSTOP_longCall,
                childOrderLegSTOP_longPut
            ],
            c.orderStrategyType.SINGLE,
            c.orderType.NET_DEBIT,
            c.duration.GOOD_TILL_CANCEL,
            c.session.NORMAL,
            c.complexOrderStrategyType.CUSTOM, 
            undefined,
            entryAndExitPrices.stopPrice);
        
        /////////////// OCO CHILD ////////////////////
        let childPayloadOCO = {};
        childPayloadOCO['orderStrategyType'] = c.orderStrategyType.OCO;
        childPayloadOCO['childOrderStrategies'] = [
            childPayloadLIMIT,
            childPayloadSTOP
        ];
        
        /* parent order child strats */
        if (isOCO) {
            payload.childOrderStrategies = [childPayloadOCO];
        } else if (isTrigger) {
            payload.childOrderStrategies = [childPayloadLIMIT];
        }
        
        let result = await Orders.createOrder(payload);
        return result;
    }
//marginType must be Margins Service for complex orders with more than 2 legs
}

module.exports = Order;