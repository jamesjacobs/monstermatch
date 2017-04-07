'use strict';

var StarService = require('./StarService'),
    Utils = require('./Utils');

function ScoreService() {
    this.starService = new StarService();
    this.utils = new Utils();
    this.storage = localStorage;
    this.clicks = 0;
}

function isLocalStorageSupported() {
    var testKey = 'test', 
        storage = localStorage;

    try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    } catch (error) {
        // could expand this to use a global var to save scores if local stroage is not availible (v2)
        return false;
    }
}

ScoreService.prototype.init = function() {

    // check for local storage and display message if not available - browser not supported or no private mode!
    if (isLocalStorageSupported()) {
    
        // Check if scores exist first and then set them if not
        if (this.storage.getItem('beginner') === null) {
            this.storage.setItem('beginner', 0);
        }

        if (this.storage.getItem('easy') === null) {
            this.storage.setItem('easy', 0);
        }

        if (this.storage.getItem('medium') === null) {
            this.storage.setItem('medium', 0);
        }

        if (this.storage.getItem('hard') === null) {
            this.storage.setItem('hard', 0);
        }

        if (this.storage.getItem('monsterous') === null) {
            this.storage.setItem('monsterous', 0);
        }

    } else {
        
        alert('Either your browser does not support local storage or you are browsing in private mode so you won\'t be able to save scores');

    }
};

ScoreService.prototype.calculateTimeScore = function(level, seconds) {
    if (this.storage.getItem(level) === '0') {
        this.storage.setItem(level, seconds);
    } else if (seconds < this.storage.getItem(level)) {
        this.storage.setItem(level, seconds);
    }
};

ScoreService.prototype.getStars = function(level, seconds) {
    var stars = this.starService.getStars(level, seconds);

    return stars;
};

ScoreService.prototype.getSavedFormattedTime = function(level) {
    var savedSeconds = this.storage.getItem(level),
        formattedTime = this.utils.formatSecsToMinsAndSecs(savedSeconds);

    return formattedTime;
};

ScoreService.prototype.getSavedUnformattedTime = function(level) {
    var savedSeconds = this.storage.getItem(level);

    return savedSeconds;
};

module.exports = ScoreService;
