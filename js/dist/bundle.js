(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var LevelService = require('./src/LevelService'),
    ScoreService = require('./src/ScoreService'),
    SoundService = require('./src/SoundService'),
    TileService = require('./src/TileService'),
    TimerService = require('./src/TimerService');

document.addEventListener('DOMContentLoaded', function() {
    var timerElement = document.querySelectorAll('[data-timer]')[0],
        timerElementId = timerElement.id,
        body = document.querySelector('body'),
        scoreService = new ScoreService(),
        soundService = new SoundService(),
        timerService = new TimerService(timerElementId),
        tileService = new TileService(body, scoreService, soundService, timerService),
        levelService = new LevelService(soundService, scoreService, tileService, timerService, body);

    soundService.init();
    scoreService.init();
    levelService.init();
});

},{"./src/LevelService":2,"./src/ScoreService":4,"./src/SoundService":5,"./src/TileService":7,"./src/TimerService":8}],2:[function(require,module,exports){
'use strict';

var Utils = require('./Utils'),
    ModalService = require('./ModalService');

function LevelService(soundService, scoreService, tileService, timerService, body) {
    this.utils = new Utils();
    this.soundService = soundService;
    this.scoreService = scoreService;
    this.tileService = tileService;
    this.timerService = timerService;
    this.body = body;
}

LevelService.prototype.levels = [
    {
        name: 'beginner',
        uniqueTiles: 2,
        img: ''
    },
    {
        name: 'easy',
        uniqueTiles: 3,
        img: ''
    },
    {
        name: 'medium',
        uniqueTiles: 6,
        img: 'img/monsters/medium-monsters.png'
    },
    {
        name: 'hard',
        uniqueTiles: 8,
        img: 'img/monsters/hard-monsters.png'
    },
    {
        name: 'monsterous',
        uniqueTiles: 10,
        img: 'img/monsters/monsterous-monsters.png'
    }
];

function levelComplete (e) {
    var modalMarkup,
        modalService;
    
    modalMarkup = 
        '<div class="modal__header">' +
            '<h1>Hooray!<br/> Level Complete</h1>' +
            '<div class="modal__award">' +
                e.detail.stars +
            '</div>' +
         '</div>' +
         '<div class="modal__body">' +
            '<h3 class="u-text-subtle">Your time <br/> ' + e.detail.currentTime + '</h3>' +
            '<hr/>' +
            '<h3 class="u-text-success">Best time <br/> ' + e.detail.bestTime + '</h3>' +
         '</div>' +
         '<div class="modal__footer">' +
            '<a class="btn btn--standard btn--block modal--close" id="repeat-level-link">Replay</a>' +
            '<a class="btn btn--positive btn--block u-margin-top modal--close" id="next-level-link">Next Level</a>' +
         '</div>';

    modalService = new ModalService({
        closeButton: true,
        closeTriggerClass: 'modal--close',
        content: modalMarkup,
        maxWidth: 600
    });

    modalService.open();
}

function levelMarkupbuilder (service, levelArray) {
    var docFrag,
        levelPage = service.body.querySelector('#levels-page'),
        levelsUl,
        listItems = '',
        totalLevelTiles,
        levelSavedTime,
        levelSavedTimeFormatted,
        starMarkup;

    // Remove previously built levels
    levelPage.innerHTML = '';

    // Create a DocumentFragment to build with
    docFrag = document.createDocumentFragment();

    // Create the levels ul
    levelsUl = document.createElement('ul');
    levelsUl.className = 'levels';

    // Create the level li's based on the levelArray and previous scores
    for (var i = 0; i < levelArray.length; i++) {
        totalLevelTiles = levelArray[i].uniqueTiles * 2;
        levelSavedTimeFormatted = service.scoreService.getSavedFormattedTime(levelArray[i].name);
        levelSavedTime = service.scoreService.getSavedUnformattedTime(levelArray[i].name);
        starMarkup = service.scoreService.getStars(levelArray[i].name, levelSavedTime);

        // this is nasty...
        if (levelSavedTimeFormatted === '00:00') {
            listItems +=   
                '<li class="level__item">' +
                    '<a href="#" class="level__link level__link--'+ levelArray[i].name +'" data-tiles="'+ levelArray[i].uniqueTiles +'" data-level-title="'+ levelArray[i].name +'">' +
                        '<h3 class="level__title">'+ levelArray[i].name +'</h3>' +
                        '<h4 class="level__sub-title">'+ totalLevelTiles +' tiles</h4>' +
                        '<img class="level__img" src="'+ levelArray[i].img +'"/>' +
                    '</a>' +
                '</li>';   
        } else {
            listItems +=   
                '<li class="level__item">' +
                    '<a href="#" class="level__link level__link--'+ levelArray[i].name +'" data-tiles="'+ levelArray[i].uniqueTiles +'" data-level-title="'+ levelArray[i].name +'">' +
                        '<h3 class="level__title">'+ levelArray[i].name +'</h3>' +
                        '<h4 class="level__sub-title">'+ totalLevelTiles +' tiles</h4>' +
                        '<img class="level__img" src="'+ levelArray[i].img +'"/>' +
                        '<div class="level__scores">' +
                            '<span class="level__time">'+ levelSavedTimeFormatted +'</span>' +
                            '<span class="level__stars">'+ starMarkup +'</span>' +
                        '</div>' +
                    '</a>' +
                '</li>'; 
        }
    }

    levelsUl.innerHTML = listItems;
    docFrag.appendChild(levelsUl);
    levelPage.appendChild(docFrag);
}

function backButtonHandler (e, service) {
    e.preventDefault();

    var backButton = service.body.querySelector('#back-button'),
        tilesPage = service.body.querySelector('#tiles-page'),
        levelPage = service.body.querySelector('#levels-page'),
        headerTitle = service.body.querySelector('#header-title');

    // Hide tiles
    tilesPage.classList.add('u-hide');

    // Hide back button
    backButton.classList.add('u-hide');

    // Revert header title
    headerTitle.textContent = 'Monster match';
    headerTitle.classList.remove('bar__title--has-header');

    // Rebuild levels with new times and stars
    levelMarkupbuilder(service, service.levels);

    // Show levels
    levelPage.classList.remove('u-hide');

    // Stop, hide and reset timer
    service.timerService.reset();

    // Play click sound
    service.soundService.play('click');
}

function loadLevel (service, levelDataset) {
    var levelPage = service.body.querySelector('#levels-page'),
        tilesPage = service.body.querySelector('#tiles-page'),
        backButton = service.body.querySelector('#back-button'),
        headerTitle = service.body.querySelector('#header-title'),
        numberOfTiles;

    // Hide levels
    levelPage.classList.add('u-hide');

    // Create tiles
    numberOfTiles = levelDataset.tiles;
    service.tileService.generateTiles(numberOfTiles, tilesPage);

    // Add tile number to body
    service.body.dataset.tileNumber = numberOfTiles;

    // Add level title to body
    service.body.dataset.levelTitle = levelDataset.levelTitle;

    // Show and populate header
    headerTitle.classList.add('bar__title--has-header');
    headerTitle.textContent = levelDataset.levelTitle;

    // Unhide back button
    backButton.classList.remove('u-hide');

    // Play click sound
    service.soundService.play('click');
}

function playRepeatLevel (service) {
    var numberOfTiles = service.body.dataset.tileNumber,
        tilesPage = service.body.querySelector('#tiles-page');

    // Regenerate tiles    
    service.tileService.generateTiles(numberOfTiles, tilesPage);

    // Play click sound
    service.soundService.play('click');

    // Reset and restart the timer
    service.timerService.reset();
    service.timerService.start();
}

function playNextLevel (service) {
    var nextLevelObj = service.utils.nextInArray(service.levels, service.body.dataset.levelTitle),
        numberOfTiles,
        headerTitle = service.body.querySelector('#header-title'),
        tilesPage = service.body.querySelector('#tiles-page');

    if (typeof nextLevelObj === 'undefined') { return; }

    // Generate next levels tiles
    numberOfTiles = nextLevelObj.uniqueTiles;
    service.tileService.generateTiles(numberOfTiles, tilesPage);

    // Next levels title
    headerTitle.textContent = nextLevelObj.name;
    service.body.dataset.levelTitle = nextLevelObj.name;
    service.body.dataset.tileNumber = nextLevelObj.uniqueTiles;

    // Play click sound
    service.soundService.play('click');

    // Reset and restart the timer
    service.timerService.reset();
    service.timerService.start();
}

LevelService.prototype.init = function () {
    var service = this,
        backButton = service.body.querySelector('#back-button');

    // Build level links
    levelMarkupbuilder(service, this.levels);

    // Event listeners
    backButton.addEventListener('click', function (e) {
        backButtonHandler(e, service);
    });

    document.addEventListener('allTilesMatch', function (e) {
        levelComplete(e);
    });

    document.addEventListener('click', function (e) {
        e.preventDefault();

        if (e.target.tagName.toLowerCase() === 'html') { return; }

        if (e.target.dataset.tiles) {
            loadLevel(service, e.target.dataset);
        } else if (e.target.parentElement.dataset.tiles) {
            loadLevel(service, e.target.parentElement.dataset);
        } else if (e.target.id === 'repeat-level-link') {
            playRepeatLevel(service);
        } else if (e.target.id === 'next-level-link') {
            playNextLevel(service);
        }
    });
};

module.exports = LevelService;

},{"./ModalService":3,"./Utils":9}],3:[function(require,module,exports){
'use strict';

function ModalService() {

    this.closeButton = null;
    this.modal = null;
    this.overlay = null;

    // Determine proper prefix
    this.transitionEnd = this.transitionSelect();

    // Define option defaults
    var defaults = {
        className: 'zoom',
        closeButton: true,
        closeTriggers: '',
        content: '',
        maxWidth: 600,
        minWidth: 280,
        overlay: true
    };

    // Create options by extending defaults with the passed in arguments
    if (arguments[0] && typeof arguments[0] === 'object') {
        this.options = this.extendDefaults(defaults, arguments[0]);
    }
}

ModalService.prototype.close = function() {
    var that = this;

    // Remove the open class name
    this.modal.className = this.modal.className.replace(' modal--open', '');
    this.overlay.className = this.overlay.className.replace(' modal--open', '');

    /*
     * Listen for CSS transitionend event and then
     * Remove the nodes from the DOM
     */
    this.modal.addEventListener(this.transitionEnd, function() {
        that.modal.parentNode.removeChild(that.modal);
    });

    this.overlay.addEventListener(this.transitionEnd, function() {
        if(that.overlay.parentNode) {
            that.overlay.parentNode.removeChild(that.overlay);
        }
    });
};

ModalService.prototype.open = function () {
    // Build out Modal
    this.buildModal();

    // Initialize event listeners
    this.initializeEvents();

    /*
     * After adding elements to the DOM, use getComputedStyle
     * to force the browser to recalc and recognize the elements
     * that we just added. This is so that CSS animation has a start point
     */
    /* jshint expr: true */
    window.getComputedStyle(this.modal).height;

    /*
     * Add our open class and check if the modal is taller than the window
     * If so, our anchored class is also applied
     */
    this.modal.className = this.modal.className + (this.modal.offsetHeight > window.innerHeight ? ' modal--open modal--anchored' : ' modal--open');
    this.overlay.className = this.overlay.className + ' modal--open';
};

// Utility method to extend defaults with user options
ModalService.prototype.extendDefaults = function (source, properties) {
    var property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
};

ModalService.prototype.buildModal = function () {
    var content,
        contentHolder,
        docFrag;

    // If content is an HTML string, append the HTML string. If content is a domNode, append its content.
    if (typeof this.options.content === 'string') {
        content = this.options.content;
    } else {
        content = this.options.content.innerHTML;
    }

    // Create a DocumentFragment to build with
    docFrag = document.createDocumentFragment();

    // Create modal element
    this.modal = document.createElement('div');
    this.modal.className = 'modal ' + this.options.className;
    this.modal.style.minWidth = this.options.minWidth + 'px';
    this.modal.style.maxWidth = this.options.maxWidth + 'px';

    // If closeButton option is true, add a close button
    if (this.options.closeButton === true) {
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'modal__close modal__close-button';
        this.closeButton.innerHTML = '×';
        this.modal.appendChild(this.closeButton);
    }

    // If overlay is true, add one
    if (this.options.overlay === true) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay ' + this.options.className;
        docFrag.appendChild(this.overlay);
    }

    // Create content area and append to modal
    contentHolder = document.createElement('div');
    contentHolder.className = 'modal__content';
    contentHolder.innerHTML = content;
    this.modal.appendChild(contentHolder);

    // Append modal to DocumentFragment
    docFrag.appendChild(this.modal);

    // Append DocumentFragment to body
    document.body.appendChild(docFrag);
};

ModalService.prototype.initializeEvents = function () {
    var that = this,
        closeTriggers;

    if (this.closeButton) {
        this.closeButton.addEventListener('click', this.close.bind(this));
    }

    if (this.overlay) {
        this.overlay.addEventListener('click', this.close.bind(this));
    }

    // If closeButton option is custom and a close trigger class is provided
    if (this.optionscloseTriggerClass !== null) {
        // find elements with the class
        closeTriggers = document.querySelectorAll('.'+ this.options.closeTriggerClass);

        // bind event to elements
        closeTriggers.forEach(function(trigger) {
            trigger.addEventListener('click', that.close.bind(that));
        });
    }
};

ModalService.prototype.transitionSelect = function () {
    var el = document.createElement('div');

    if (el.style.WebkitTransition) {
        return 'webkitTransitionEnd';
    }

    if (el.style.OTransition) {
        return 'oTransitionEnd';
    }

    return 'transitionend';
};

module.exports = ModalService;

},{}],4:[function(require,module,exports){
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

},{"./StarService":6,"./Utils":9}],5:[function(require,module,exports){
'use strict';

function SoundService() {
    this.src = './sounds/sprite.mp3';
    this.audioSprite = new Audio(this.src);
    this.audioSprite.autobuffer = true;
    this.audioSprite.load();
    this.currentSprite = {};
}

function onTimeUpdate (service) {
    if (service.audioSprite.currentTime >= service.currentSprite.start + service.currentSprite.length) {
        service.audioSprite.pause();
    }
}

SoundService.prototype.spriteData = {
    click: {
        start: 0,
        length: 0.4460090702947846,
    },
    flip: {
        start: 2,
        length: 0.59734693877551
    },
    match: {
        start: 4,
        length: 0.6249886621315195
    },
    noMatch: {
        start: 6,
        length: 0.544353741496598
    },
    tada: {
        start: 8,
        length: 0.902925170068027
    }
};

SoundService.prototype.init = function () {
    var service = this;

    service.audioSprite.addEventListener('timeupdate', function () {
        onTimeUpdate(service);
    }, false);
};

SoundService.prototype.play = function (id) {
    var service = this;

    if (!id) {
        return;
    }

    if (service.spriteData[id] && service.spriteData[id].length) {
        service.currentSprite = service.spriteData[id];
        service.audioSprite.currentTime = service.currentSprite.start;
        service.audioSprite.play();
    }
};

module.exports = SoundService;

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./Utils":9}],8:[function(require,module,exports){
'use strict';

function TimerService(timerElementId) {
    this.sec = 0;
    this.timerElement = document.getElementById(timerElementId);
}

TimerService.prototype.start = function() {
    var service = this,
        hours,
        minutes,
        seconds,
        time;

    this.timerElement.innerHTML = '0:00';
    this.timerElement.classList.remove('u-hide');

    service.timer = setInterval(function() {
        service.sec++;
        hours = parseInt(service.sec / 3600) % 24;
        minutes = parseInt(service.sec / 60) % 60;
        seconds = service.sec % 60;

        if (hours === 0) {
            hours = '';
        } else if (hours < 10) {
            hours = '0' + hours + ':';
        } else {
            hours = hours + ':';
        }

        time = hours + minutes + ':' + (seconds  < 10 ? '0' + seconds : seconds);
        service.timerElement.innerHTML = time;
    }, 1000);
};

TimerService.prototype.stop = function() {
    clearInterval(this.timer);
};

TimerService.prototype.reset = function() {
    clearInterval(this.timer);
    this.sec = 0.00;
    this.timerElement.innerHTML = 0.00;
    this.timerElement.classList.add('u-hide');
};

TimerService.prototype.getTime = function() {
    return this.sec;
};

module.exports = TimerService;

},{}],9:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=app.js.map
