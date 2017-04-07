'use strict';

var Utils = require('./Utils');

function TileService(body, scoreService, soundService, timerService) {
    this.utils = new Utils();
    this.scoreService = scoreService;
    this.soundService = soundService;
    this.timerService = timerService;
    this.body = body;
}

TileService.prototype.tiles = [
    {
        bg: 'img/tile-bgs/yellow-stripes.png',
        id: 1,
        img: 'img/monsters/green-monster.png'
    },
    {
        bg: 'img/tile-bgs/blue-square-stripes.png',
        id: 2,
        img: 'img/monsters/grey-horns-monster.png'
    },
    {
        bg: 'img/tile-bgs/purple-squares.png',
        id: 3,
        img: 'img/monsters/grey-monster.png'
    },
    {
        bg: 'img/tile-bgs/blue-squares.png',
        id: 4,
        img: 'img/monsters/orange-monster.png'
    },
    {
        bg: 'img/tile-bgs/light-green-rainbows.png',
        id: 5,
        img: 'img/monsters/purple-horns-monster.png'
    },
    {
        bg: 'img/tile-bgs/green-rainbows.png',
        id: 6,
        img: 'img/monsters/purple-monster.png'
    },
    {
        bg: 'img/tile-bgs/blue-stripes.png',
        id: 7,
        img: 'img/monsters/yellow-eyes-monster.png'
    },
    {
        bg: 'img/tile-bgs/grey-squares.png',
        id: 8,
        img: 'img/monsters/yellow-monster.png'
    },
    {
        bg: 'img/tile-bgs/yellow-squares.png',
        id: 9,
        img: 'img/monsters/orange-horns-monster.png',
    },
    {
        bg: 'img/tile-bgs/yellow-rainbows.png',
        id: 10,
        img: 'img/monsters/orange-eyes-monster.png',
    },
];

// Fisher--Yates Algorithm
function shuffle (array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function shuffleTiles (tileArray) {
    return shuffle(tileArray);
}

function tileMarkupBuilder (tileArray) {
    var markup = '';

    for (var i = 0; i < tileArray.length; i++) {
        markup += '<div class="tile" data-tile-id="' + tileArray[i].id + '"><div class="tile__front"></div><div class="tile__back" style="background-image: url('+tileArray[i].img+'), url('+tileArray[i].bg+'); background-repeat: no-repeat, repeat; background-position: center center; background-size: 70%;"></div></div>';
    }

    return markup;
}

function resetFlippedTiles (service) {
    var tiles = service.body.querySelectorAll('.tile--flipped:not(.tile--matched)');

    for (var i = 0; i < tiles.length; i++) {
        tiles[i].classList.remove('tile--flipped');
    }
}

function tilesMatch (flippedTiles) {
    if (flippedTiles.length === 2) {
        if (flippedTiles[0].getAttribute('data-tile-id') === flippedTiles[1].getAttribute('data-tile-id')) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function allTilesMatch (service) {
    var allTiles = service.body.querySelectorAll('.tile'),
        matchedTiles = service.body.querySelectorAll('.tile--matched'),
        level = service.body.dataset.levelTitle,
        allTilesMatchEvent,
        starsMarkup,
        seconds,
        bestTime,
        currentTime;

    if (allTiles.length === matchedTiles.length) {
        // Stop timer and get seconds
        service.timerService.stop();
        seconds = service.timerService.getTime();

        // Check and save time for level
        service.scoreService.calculateTimeScore(level, seconds);

        // Get stars and times then broadcast custom event with data
        starsMarkup = service.scoreService.getStars(level, seconds);
        bestTime = service.scoreService.getSavedFormattedTime(level);
        currentTime = service.utils.formatSecsToMinsAndSecs(seconds);

        allTilesMatchEvent = new CustomEvent('allTilesMatch', {'detail': {'stars': starsMarkup, 'bestTime': bestTime, 'currentTime': currentTime} }); // ie support needs looking at http://caniuse.com/#feat=customevent

        // Trigger modal, but delay for half a sec to ensure flip animation finished, could use transition end here...
        setTimeout(function() {
            service.soundService.play('tada');

            // Broadcast event that all tiles match and deal with it in level service
            document.dispatchEvent(allTilesMatchEvent);
        }, 500);
    }
}

function tileClickListener(e, tile, service) {
    var flippedTiles;
    e.preventDefault();

    // PLay flip sound
    service.soundService.play('flip');

    // Flip tile
    tile.classList.add('tile--flipped');

    // Get unmatched flipped tiles
    flippedTiles = service.body.querySelectorAll('.tile--flipped:not(.tile--matched)');

    if (flippedTiles.length === 2) {

        // Check if tiles match
        if (tilesMatch(flippedTiles)) {
            // Add matched class and disabled click event on matched - could use transition end here
            setTimeout(function() {
                flippedTiles.forEach(function(tile) {
                    tile.classList.add('tile--matched');
                    tile.removeEventListener('click', tileClickListener);
                    allTilesMatch(service);
                    service.soundService.play('match');
                });
            }, 1000);
        } else {
            setTimeout(function() {
                resetFlippedTiles(service);
                service.soundService.play('noMatch');
            }, 1000);
        }
    }
}

function addTileClickListener(tile, service) {
    tile.addEventListener('click', function (e) {
        tileClickListener(e, tile, service);
    });
}

TileService.prototype.generateTiles = function (numberOfTiles, location) {
    // Get the tiles and shuffle
    var service = this,
        tiles = shuffleTiles(this.tiles),
        appendedTiles,
        duplcatedTiles,
        markUpToAppend,
        tilesCopy;

    // Grab the required number of tiles from the array
    tiles = tiles.slice(0, numberOfTiles);

    // Duplicate the tiles in the array
    tilesCopy = tiles;
    duplcatedTiles = tiles.concat(tilesCopy);

    // Re-shuffle tiles with duplicates
    duplcatedTiles = shuffleTiles(duplcatedTiles);

    // Remove any previously level classes
    location.classList.remove('tile-page-beginner', 'tile-page-easy', 'tile-page-medium', 'tile-page-hard', 'tile-page-monsterous');

    if (duplcatedTiles.length === 4) {
        location.classList.add('tile-page-beginner');
    } else if (duplcatedTiles.length === 6) {
        location.classList.add('tile-page-easy');
    } else if (duplcatedTiles.length === 12) {
        location.classList.add('tile-page-medium');
    } else if (duplcatedTiles.length === 16) {
        location.classList.add('tile-page-hard');
    } else if (duplcatedTiles.length === 20) {
        location.classList.add('tile-page-monsterous');
    }

    // Build the tile markup
    markUpToAppend = tileMarkupBuilder(duplcatedTiles);

    // Append markup
    location.innerHTML = markUpToAppend;

    // Attached click handlers to the tiles to flip
    appendedTiles = service.body.querySelectorAll('.tile');

    for (var i = 0; i < appendedTiles.length; i++) {
        addTileClickListener(appendedTiles[i], service);
    }

    // Show tiles
    location.classList.remove('u-hide');

    // Start the timer
    service.timerService.start();
};

module.exports = TileService;
