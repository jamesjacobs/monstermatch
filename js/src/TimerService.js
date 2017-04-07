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
