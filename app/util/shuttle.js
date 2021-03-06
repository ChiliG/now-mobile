module.exports = {

	getMinutesETA(secondsToArrival) {
		if (secondsToArrival < 1) {
			return ('Arrived');
		} else if (secondsToArrival < 60) {
			return ('<1 min');
		} else {
			let secondsToArrivalDec = secondsToArrival;
			let minsToArrival = 1;

			while (secondsToArrivalDec > 60) {
				secondsToArrivalDec -= 60;
				minsToArrival++;
			}

			if (minsToArrival === 1) {
				return ('1 min');
			} else {
				return (minsToArrival + ' mins');
			}
		}
	},

};
