'use strict';

function StarService() {
    // Stars vs seconds
    this.starDataMap = {
        'beginner': {
            stars3: 10,
            stars2: 15,
            stars1: 20
        },
        'easy': {
            stars3: 20,
            stars2: 25,
            stars1: 30
        },
        'medium': {
            stars3: 30,
            stars2: 35,
            stars1: 40
        },
        'hard': {
            stars3: 40,
            stars2: 45,
            stars1: 50
        },
        'monsterous': {
            stars3: 50,
            stars2: 55,
            stars1: 60
        }
    };
}

// Calculate the number of stars earned and return earned stars
StarService.prototype.getStars = function(level, seconds) {
    var levelDataMap = this.starDataMap[level],
        numberOfStars,
        starMarkUp = '';

    for (var key in levelDataMap) {
        if (seconds <= levelDataMap[key]) {
            numberOfStars = parseInt(key.replace('stars', ''));
            break;
        } else {
            numberOfStars = 0;
        }
    }

    starMarkUp = this.generateStarMarkUp(numberOfStars);
    
    return starMarkUp;
};

StarService.prototype.generateStarMarkUp = function(stars) {
    var starMarkUp;

    if (stars === 1) {
        starMarkUp = '<i class="fa fa-star animated zoom-in"></i><i class="fa fa-star-o animated zoom-in"></i><i class="fa fa-star-o animated zoom-in"></i>';
    } else if (stars === 2) {
        starMarkUp = '<i class="fa fa-star animated zoom-in"></i><i class="fa fa-star animated zoom-in"></i><i class="fa fa-star-o animated zoom-in"></i>';
    } else if (stars === 3) {
        starMarkUp = '<i class="fa fa-star animated zoom-in"></i><i class="fa fa-star animated zoom-in"></i><i class="fa fa-star animated zoom-in"></i>';
    } else {
        starMarkUp = '<i class="fa fa-star-o animated zoom-in"></i><i class="fa fa-star-o animated zoom-in"></i><i class="fa fa-star-o animated zoom-in"></i>';
    }

    return starMarkUp;
};

module.exports = StarService;
