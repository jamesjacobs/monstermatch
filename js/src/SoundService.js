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
