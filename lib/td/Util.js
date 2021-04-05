class Util {

    /**
     * Extract days from like '2020-08-21:6'
     * 
     * @param {*} dateStr 
     */
    static getDays (dateStr) {
        let days = dateStr.split(':')[1];
        return days;
    }

    /**
     * Returns the date in option chain which is nearest the target date
     * 
     * @param {*} datesArray 
     * @param {*} targetDay 
     */
    static getClosestDateToDTE(datesArray, targetDay) {
        let lowestDiffToDays = 999999;
        let nearestDate;
        datesArray.map(date => {
            let diffToDays = Math.abs(targetDay - parseInt(Util.getDays(date)));
            if (diffToDays < lowestDiffToDays) {
                lowestDiffToDays = diffToDays;
                nearestDate = date;
            }
        });
        return nearestDate;
    }

    /**
     * Returns the dates within an Option chain
     * 
     * @param {*} callExpDateMap 
     */
    static getDatesInChain(optionChain) {
        let dates = [];
        Object.keys(optionChain.callExpDateMap).map(callOpt => {
            dates.push(callOpt);
            // console.log(getDays(callOpt));
        });
        return dates;
    } 

    /**
     * Returns the strikes within an Option chain
     * 
     * @param {*} optionDateStrikes 
     * @param {*} preloadedArray 
     */
    static getATMStrike(optionChain) {
        let strikesArray = [];
        Object.entries(optionChain.callExpDateMap).map(optionDate => {
            let optionDateStrikes = optionDate[1];
            Object.keys(optionDateStrikes).map(strike => {
                if (!strikesArray.includes(strike)) {
                    strikesArray.push(strike);
                }
            });
        });
        // console.log(strikesArray);
        let closestSrike = Util.getClosestStrikeToATM(optionChain, strikesArray);
        return closestSrike;
    }

    /**
     * 
     * @param {*} chain 
     * @param {*} strikesArray 
     */
    static getClosestStrikeToATM(chain, strikesArray) {
        let price = chain.underlyingPrice;
        let closestStrike = Util.getClosestNumber(strikesArray, price);
        return closestStrike;
    }

    /** 
     * Produce map of strike-deltas for all Call and Puts from closestToTargetDTE
     * 
     * @param {*} dteStrikesFull 
     */
    static loadStrikeDeltaMap(dteStrikesFull) {
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
    
    /**
     * General purpose
     * 
     * @param {*} numbersArray 
     * @param {*} targetNum 
     */
    static getClosestNumber(numbersArray, targetNum) {
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
}

module.exports = Util;