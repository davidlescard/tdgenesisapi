const Orders = require('../accounts/Orders');
const OrderBuilder = require('../../logic/formbuilder/Order');
const Option = require('../quote/Option');
const Util = require('../Util');
const c = require('../accounts/_const.orders.json');

class Order {

    static async createCondor(ticker, 
        targetDTE, targetShortDelta, targetLongDelta, 
        targetProfit, stopLoss, stopLimitMultiplier
        ) {

        let stopLimit = stopLoss * stopLimitMultiplier;
        // let targetProfit = 0.50;
        // let stopLoss = 2.0;
        // let stopLimit = stopLoss * 1.03;

        /**
         * Fetch the chain
         */
        let optionChain = (await Option.getOptionChain(ticker, {})).body;
        console.log(optionChain);

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
            entry: Math.round(netDebitOrCredit * 100) / 100,
            limit: Math.round(netDebitOrCredit * targetProfit * 100) / 100, 
            stop: Math.round(netDebitOrCredit * stopLoss * 100) / 100,
            stop_limit: Math.round(netDebitOrCredit * stopLimit * 100) / 100
        }
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
        
        let result;

        result = await Orders.createOrder(payload);

        return result;
    }

}

module.exports = Order;