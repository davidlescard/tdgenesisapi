class Volatility { 

    /**
     * 
     * @param {*} optionChain 'body' of a tickers option chain
     * @param {*} daysIVcalc 
     * @returns {Object} tickerIVMap.calculatedIV
     */
    static impliedVol(optionChain, daysIVcalc = 30) {
    /**
     * V2
     * Determine IV per ticker:
     * - Decide threshold for number of days relevant (i.e. 30)
     * - aggregate all volatility for strikes, plus days remaining (CALL and PUT)
     * - calc AVG Call and Put IV per date
     * - determine weightedIV for each date: AVG * DTE * count 
     * - AVG the CALL and PUT sides
     */
    let tickerIVMap = {};
    tickerIVMap = {
        call: {
            dates: [],
            sumStrikeCount: 0,
            sumDte: 0,
            sumIVweight: 0,     //(sum all IVweight)
            avgWeightedIV: 0
        },
        put: {
            dates: [],
            sumStrikeCount: 0,
            sumDte: 0,
            sumIVweight: 0,
            avgWeightedIV: 0
        },
        calculatedIV: 0         //(avg of avgWeightedIV, put+call)
    };
    Object.entries(optionChain.callExpDateMap).map(optionDate => {
        let doCalc = false;
        let dateTmp = {strikeCount: 0, sumIV: 0, IVweight: 0, avgIV: 0};
        dateTmp.dateStr = optionDate[0];
        Object.entries(optionDate[1]).map(strike => {
            if (strike[1][0].inTheMoney && (strike[1][0].daysToExpiration <= daysIVcalc)) {
                dateTmp.dte = strike[1][0].daysToExpiration;
                let vol = strike[1][0].volatility;
                if (vol !== 'NaN' && vol !== 5) { //cases where volatility = -Inf the API reports with weird values...
                    dateTmp.strikeCount++;
                    dateTmp.sumIV += vol;
                    doCalc = true;
                } else {
                    dateTmp.strikeCount++;
                    dateTmp.sumIV += 0.001;
                    doCalc = true;
                }
            }
        });
        if (doCalc) {
            dateTmp.avgIV = dateTmp.sumIV / dateTmp.strikeCount;
            dateTmp.IVweight = dateTmp.avgIV * dateTmp.dte * dateTmp.strikeCount;
            tickerIVMap.call.dates.push(dateTmp);
            tickerIVMap.call.sumStrikeCount += dateTmp.strikeCount;
            tickerIVMap.call.sumDte += (dateTmp.dte * dateTmp.strikeCount);
            tickerIVMap.call.sumIVweight += dateTmp.IVweight;
        }
    });
    tickerIVMap.call.avgWeightedIV = tickerIVMap.call.sumIVweight / tickerIVMap.call.sumDte;

    Object.entries(optionChain.putExpDateMap).map(optionDate => {
        let doCalc = false;
        let dateTmp = {strikeCount: 0, sumIV: 0, IVweight: 0, avgIV: 0};
        dateTmp.dateStr = optionDate[0];
        Object.entries(optionDate[1]).map(strike => {
            if (strike[1][0].inTheMoney && (strike[1][0].daysToExpiration <= daysIVcalc)) {
                dateTmp.dte = strike[1][0].daysToExpiration;
                let vol = strike[1][0].volatility;
                if (vol !== 'NaN' && vol !== 5) { //cases where volatility = -Inf the API reports with weird values...
                    dateTmp.strikeCount++;
                    dateTmp.sumIV += vol;
                    doCalc = true;
                } else {
                    dateTmp.strikeCount++;
                    dateTmp.sumIV += 0.001;
                    doCalc = true;
                }
            }
        });
        if (doCalc) {
            dateTmp.avgIV = dateTmp.sumIV / dateTmp.strikeCount;
            dateTmp.IVweight = dateTmp.avgIV * dateTmp.dte * dateTmp.strikeCount;
            tickerIVMap.put.dates.push(dateTmp);
            tickerIVMap.put.sumStrikeCount += dateTmp.strikeCount;
            tickerIVMap.put.sumDte += (dateTmp.dte * dateTmp.strikeCount);
            tickerIVMap.put.sumIVweight += dateTmp.IVweight;
        }
    });
    tickerIVMap.put.avgWeightedIV = tickerIVMap.put.sumIVweight / tickerIVMap.put.sumDte;
    tickerIVMap.calculatedIV = (tickerIVMap.call.sumIVweight + tickerIVMap.put.sumIVweight) / 
        (tickerIVMap.call.sumDte + tickerIVMap.put.sumDte);

    return tickerIVMap.calculatedIV;
    // tickerIVMap
    // {
    //     T : {                                                
    //         call : {                                         ['put']
    //             dates: [                                     []
    //                 'date': {                                optionDate[0]
    //                     strikes : [                          optionDate[1]
    //                         '15.0' : {
    //                             volatility: value,
    //                             dte: value
    //                         }
    //                     ],
    //                     dte: value,
    //                     strikeCount: value,
    //                     sumIV: value,
    //                     avgIV: value,
    //                     IVweight: value //(avgIV * dte)
    //                 }                
    //             ],
    //             sumStrikeCount: value,
    //             sumIVweight: value, //(sum all IVweight)
    //             avgWeightedIV: value
    //         },
    //         put : {},
    //         calculatedIV: value //(avg of avgWeightedIV, put+call)
    //     }
    // }
    }
}

module.exports = Volatility;