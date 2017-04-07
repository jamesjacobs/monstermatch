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
