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
