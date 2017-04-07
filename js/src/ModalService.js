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
