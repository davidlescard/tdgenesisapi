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

async function doit () {


    let ticker = 'JBLU';

    let options = {};
    let result;

    /**
     * Option chain
     * 
     */
    // result = await Option.getOptionChain(ticker, options);
    // console.log(result.body);
    // console.log(result.body.callExpDateMap);
    // console.log(result.body.callExpDateMap['2020-08-21:10']);
    // console.log(result.body.callExpDateMap['2020-08-21:10']['3.0']);
    // console.log(result.body.putExpDateMap['2020-07-31:2']['20.0']);
    // console.log(result.body.putExpDateMap['2020-07-31:2']['20.0'][0]);
    // console.log(result.body.callExpDateMap['2020-08-21:10']['3.0'][0].delta);
    // console.log(result.body.callExpDateMap['2020-08-21:10']['3.0'][0].symbol);

    

    /**
     * sync --not working
     * 
     */
    // try {
    //     let result = Quote.getQuotes(ticker)
    //     console.log('result');
    //     console.log(result.getBody('utf8'));
    // } catch(e) {
    //     console.log(e)
    // }
    // let result = Quote.getPriceHistory(ticker)
    //     .then(function(result) {
    //         console.log(result.body);
    //     }
    // );
    // let result = Orders.getOrders()
    //     .then(function(result) {
    //         console.log(result.body);
    //     }
    // );



    /**
     * async
     * 
     */
    // result = await Quote.getQuotes(ticker);
    // console.log(result);
    // result = await Instrument.getInstrument(ticker);
    // console.log(result.body);
    // result = await Quote.getPriceHistory(ticker);
    // console.log(result.body);

    /**
     * get and cancel order
     *  
     */ 
    result = await Orders.getOrders(); //1382763806
    console.log(result.body);
    // // console.log(result.body[0].orderLegCollection[0].instrument.symbol);
    // let orderid; 
    // result.body.map((order) => {
    //     if (order.orderLegCollection[0].instrument.symbol === 'CCL'
    //         && order.status === 'QUEUED') {
    //         console.log('horray');
    //         orderid = order.orderId.toString();
    //     }
    // });
    // console.log(orderid);
    // result = await Orders.cancelOrder(orderid);
    // console.log(result.body);
    
    // result = await Orders.getOrders();
    // console.log(result.body);

    /**
     * get account deets
     * 
     */
    // result = await Accounts.getAccount();
    // console.log(result.body);
    // console.log(result.body.securitiesAccount.positions[1]);

    /**
     * enter order
     * 
     */
    // result = await Orders.createOrder();
    // console.log(result.response.toJSON().headers.location); //returns orderId at the end of this string
    //Location: https://api.tdameritrade.com/v1/accounts/424852631/orders/1382763800
    
    /**
     * create saved order
     * 
     */
        // {
        //     "complexOrderStrategyType": "NONE",
        //     "orderType": "LIMIT",
        //     "session": "NORMAL",
        //     "price": "0.45",
        //     "duration": "DAY",
        //     "orderStrategyType": "SINGLE",
        //     "orderLegCollection": [
        //       {
        //         "instruction": "BUY_TO_OPEN",
        //         "quantity": 1,
        //         "instrument": {
        //           "symbol": "JBLU_082120C12",
        //           "assetType": "OPTION"
        //           }
        //       }
        //     ]
        //   }
    let orderLegJson = OrderBuilder.orderLeg(
        c.orderLegCollection.instruction.BUY_TO_OPEN,
        1,
        'JBLU_082120C12',
        c.orderLegCollection.instrument.assetType.OPTION
    );
    let savedOrderJson = OrderBuilder.order(
        '0.45',
        [orderLegJson],
        c.orderStrategyType.SINGLE,
        c.orderType.LIMIT,
        c.duration.DAY,
        c.session.NORMAL,
        c.complexOrderStrategyType.NONE);
        
    result = await SavedOrders.createSavedOrder(savedOrderJson);
    // console.log(result.response); //have to query to find the saved order id

    /**
     * get saved orders
     * 
     */
    // result = await SavedOrders.getSavedOrders();
    // console.log(result.body);
}

doit();