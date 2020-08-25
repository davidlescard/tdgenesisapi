const TDOrderBuilder = require('../../td/logic/formbuilder/Order');

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

        return TDOrderBuilder.order(
            price, 
            orderLegCollection, 
            orderStrategyType, 
            orderType, 
            duration, 
            session,
            complexOrderStrategyType,
            childOrderStrategies, 
            stopPrice);
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

        return TDOrderBuilder.triggerOrder(
            price, 
            orderLegCollection, 
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

        return TDOrderBuilder.ocoOrder(
            price, 
            orderLegCollection, 
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

        return TDOrderBuilder.orderLeg(
            instruction, 
            quantity, 
            symbol, 
            assetType);
    }

    // "orderStrategyType": "SINGLE",
    // "orderType": "LIMIT",
    // "session": "NORMAL",
    // "price": "6.45",
    // "stopPrice": 3.27,
    // "duration": "DAY",
    // "complexOrderStrategyType": "NONE",
    // "orderLegCollection": [],
    // "childOrderStrategies": []

}

module.exports = Order;