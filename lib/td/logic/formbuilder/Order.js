const c = require('../../accounts/_const.orders.json');

class Order {

    static order(
        price, 
        orderLegCollection, 
        orderStrategyType, 
        orderType, 
        duration, 
        session,
        complexOrderStrategyType,
        childOrderStrategies, 
        stopPrice) {

        let obj = {};
        obj['price'] = price ? price : null;
        obj['orderLegCollection'] = orderLegCollection ? orderLegCollection : null;
        obj['orderStrategyType'] = orderStrategyType ? orderStrategyType : c.orderStrategyType.SINGLE;
        obj['orderType'] = orderType ? orderType : c.orderType.LIMIT;
        obj['duration'] = duration ? duration : c.duration.DAY;
        obj['session'] = session ? session : c.session.NORMAL;
        obj['complexOrderStrategyType'] = complexOrderStrategyType ? complexOrderStrategyType : c.complexOrderStrategyType.NONE;
        obj['childOrderStrategies'] = childOrderStrategies ? childOrderStrategies : undefined;
        obj['stopPrice'] = stopPrice ? stopPrice : undefined;
            console.log(obj)
        return obj;
    }
    
    static triggerOrder(
        price, 
        orderLegCollection, 
        orderType, 
        duration, 
        session,
        complexOrderStrategyType,
        childOrderStrategies, 
        stopPrice) {

        return Order.order(
            price, 
            orderLegCollection, 
            c.orderStrategyType.TRIGGER,
            orderType, 
            duration, 
            session,
            complexOrderStrategyType,
            childOrderStrategies, 
            stopPrice);
    }

    static ocoOrder( 
        price, 
        orderLegCollection, 
        orderType, 
        duration, 
        session,
        complexOrderStrategyType,
        childOrderStrategies, 
        stopPrice) {

        return Order.order(
            price, 
            orderLegCollection, 
            c.orderStrategyType.OCO,
            orderType, 
            duration, 
            session,
            complexOrderStrategyType,
            childOrderStrategies, 
            stopPrice);
    }

    static orderLeg(
        instruction, 
        quantity, 
        symbol, 
        assetType) {

        let obj = {};
        obj['instruction'] = instruction ? instruction : c.orderLegCollection.instruction.SELL_TO_OPEN; 
        obj['quantity'] = quantity ? quantity : null; 
        let instObj = {};
        instObj['symbol'] = symbol ? symbol : null; 
        instObj['assetType'] = assetType ? assetType : c.orderLegCollection.instrument.assetType.OPTION; 
        obj['instrument'] = instObj; 
        
        return obj;
    }

}

module.exports = Order;