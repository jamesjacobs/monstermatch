'use strict';

function Utils() {
}

Utils.prototype.nextInArray = function (db, key) {
    for (var i = 0; i < db.length; i++) {
        if (db[i].name === key) {
            return db[i + 1];
        }
    }

    return false;
};

Utils.prototype.formatSecsToMinsAndSecs = function (seconds) {
	var minutes = ('00' + Math.floor((seconds % 3600) / 60)).slice(-2),
		formattedSeconds = ('00' + (seconds % 3600) % 60).slice(-2);
	
	return minutes + ':' + formattedSeconds;
};

module.exports = Utils;
