const SavedOrders = require('./lib/td/accounts/SavedOrders');

async function doit () {
    const constants = require('./lib/td/constants.json');
    const LoadedAuth = require('./lib/td/auth/LoadedAuth');
    const Option = require('./lib/td/quote/Option');
    const Instrument = require('./lib/td/quote/Instrument');
    const Orders = require('./lib/td/accounts/Orders');
    const Accounts = require('./lib/td/accounts/Accounts');
    const Quote = require('./lib/td/quote/Quote');


    let ticker = 'T';

    let options = {};
    let result;

    /**
     * Option chain
     * 
     */
    // let result = Option.getOptionChain(ticker, options)
    //     .then(function(result) {
    //         console.log(result.body);
    //         console.log(result.body.putExpDateMap);
    //         console.log(result.body.putExpDateMap['2020-07-31:2']);
    //         console.log(result.body.putExpDateMap['2020-07-31:2']['20.0']);
    //         console.log(result.body.putExpDateMap['2020-07-31:2']['20.0'][0]);
    //         console.log(result.body.putExpDateMap['2020-07-31:2']['20.0'][0].delta);
    //     }
    // );

    

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
    // result = await Orders.getOrders();
    // console.log(result.body);
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
    
    result = await Orders.getOrders();
    console.log(result.body);

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
    // console.log(result.body);
    
    /**
     * create saved order
     * 
     */
    // result = await SavedOrders.createSavedOrder();
    // console.log(result.body);

    /**
     * get saved orders
     * 
     */
    result = await SavedOrders.getSavedOrders();
    console.log(result.body);
}

doit();