/*jshint loopfunc: true */

if (typeof DEBUG === 'undefined') {
	DEBUG = true;
}

// GLOBAL CONSTANTS
//
// These constants are exposed to all Elasto modules.

var Fn = Function,
	GLOBAL = new Fn('return this')();


// GLOBAL METHODS
//
// The methods here are exposed to all Elasto modules. Because all of the
// source files are wrapped within a closure at build time, they are not
// exposed globally in the distributable binaries.

/**
 * Init wrapper for the Elasto core module.
 * @param {Object} The Object that Elasto gets attached to in elasto.init.js.
 * If Elasto was not loaded with an AMD loader such as require.js, this is
 * the global Object.
 */
function initElastoCore(context) {

	'use strict';

	// PRIVATE STATIC VARIABLES
	//
	// These constants are private and shared among all instances
	// of Elasto.

	// Default option values.
	var DEFAULT_OPTIONS = {
		hideIncompleteRow: false, // Hide the last row in the grid if it's not complete.
		trackActive: true, // Keep active element in the viewport at all times.
		trackAnimation: true, // Animate scroll when tracking active element.
		minSize: 150, // Minimum px size for squares.
		move: null, // Move event handler.
		select: null, // Select event handler.
		click: null, // Click event handler.
		enter: null, // Enter event handler.
		keyEventsEnabled: true, // Wether or not keyboard events (arrows and enter) are enabled.
		customAttributes: {}, // Custom html attributes and their values that should be assigned to every square element.
		displayProperties: { // Specifies which properties of the data to display in the grid.
			image: 'image', // Property to use for url to square background image.
			title: 'title', // Property to use for square title.
			description: 'description' // Property to use for square text.
		}
	};

	/**
	 * This is the constructor for the Elasto object.
	 * @param {number} containerId Id attribute of the desired container element.
	 * @param {array.<object>} data Initial array of objects to be rendered in the grid.
	 * @param {object} options Object of containing options for the grid.
	 * @constructor
	 */
	var Elasto = context.Elasto = function (containerId, data, options) {

		// PRIVATE INSTANCE VARIABLES
		//
		// These are not accessible from outside the Elasto instance.

		var _self = this,
			_initiated = false,
			_data,
			_container,
			_fullRowCount,
			_colCount,
			_lastRowColCount,
			_squareSize,
			_squareSizePx,
			_activeId,
			_resizeTimeout,
			_options;

		// PRIVATE INSTANCE METHODS
		//
		// These do not get attached to a prototype. They are private utility
		// functions.

		/**
		 * Initialize elasto instance.
		 */
		var _init = function () {

			_container = document.getElementById(containerId);
			_container.classList.add('elasto-container');

			_data = data ? data : [];

			_setOptions();
			_buildGrid();

			window.addEventListener('keydown', _keyDown);
			window.addEventListener('keyup', _keyUp);
			window.addEventListener('resize', _resize);

			// Prevents the use of hideIncompleteRow when adding objects.
			_initiated = true;

		};

		/**
		 * Set user specified options or default values.
		 */
		var _setOptions = function () {

			options = options || {};
			_options = _options || {};

			for (var key in DEFAULT_OPTIONS) {

				if (DEFAULT_OPTIONS.hasOwnProperty(key) && options.hasOwnProperty(key))
					_options[key] = options[key];

				else if (DEFAULT_OPTIONS.hasOwnProperty(key))
					_options[key] = DEFAULT_OPTIONS[key];

			}

		};

		/**
		 * Create the elasto grid DOM elements.
		 */
		var _buildGrid = function () {

			// Empty container.
			while (_container.firstChild)
				_container.removeChild(_container.firstChild);

			// Update size based values. Trigger re-calculation of colCount, size etc.
			_colCount = 0;
			_setDimensions();

			// Remove "overflowing" squares on last row if hideIncompleteRow is true.
			if (_options.hideIncompleteRow && !_initiated && _data.length > _lastRowColCount && _lastRowColCount > 0) {

				_data.splice(_data.length - _lastRowColCount, _lastRowColCount);

				// Trigger re-calculation.
				_colCount = 0;
				_setDimensions();

			}

			// Trigger re-calculation of height.
			_squareSizePx = null;

			for (var i = 0; i < _data.length; i++)
				_addElemFromData(i);

			if (_data.length)
				_setActive(1);

		};

		/**
		 * Create html element for given grid object.
		 * @param {number} index Index of grid element to add to DOM.
		 */
		var _addElemFromData = function (index) {

			var elem = _getTemplateElem();

			elem.style.width = _squareSize + '%';
			elem.setAttribute('data-id', index + 1);

			// Set custom attributes, makes use of handlebar notation.
			for (var key in _options.customAttributes) {

				// Workaround to prevent problems with the replace callback inside the loop.
				(function (key) {

					if (_options.customAttributes.hasOwnProperty(key)) {

						// Regex magic to replace handlebars with properties of the current object.
						var value = _options.customAttributes[key].replace(/\{\{([^{}]+)\}\}/g, function (str) {

							var objKey = str.replace(/\{/g, '').replace(/\}/g, '');

							if (_data[index].hasOwnProperty(objKey))
								return _data[index][objKey];
							else
								return str;

						});

						elem.setAttribute(key, value);

					}

				}(key));

			}

			if (_data[index].hasOwnProperty(_options.displayProperties.image) && _data[index][_options.displayProperties.image])
				elem.getElementsByClassName('elasto-square-bg')[0].style.backgroundImage = 'url(' + _data[index][_options.displayProperties.image] + ')';

			if (_data[index].hasOwnProperty(_options.displayProperties.title)) {
				elem.getElementsByClassName('elasto-square-title')[0].innerHTML = _data[index][_options.displayProperties.title];
				elem.getElementsByClassName('elasto-square-title')[0].title = _data[index][_options.displayProperties.title];
			}

			if (_data[index].hasOwnProperty(_options.displayProperties.description))
				elem.getElementsByClassName('elasto-square-description')[0].innerHTML = _data[index][_options.displayProperties.description];

			elem.addEventListener('click', _click);

			_data[index].elem = elem;
			_container.appendChild(elem);

			// Calc height in px to match width. this has to be done after the element is
			// placed in its container since the width is relative to the container width.
			if (!_squareSizePx)
				_squareSizePx = Math.floor(elem.clientWidth);

			elem.style.height = _squareSizePx + 'px';

		};

		/**
		 * Get a template element for grid square.
		 * @return {element} A copy of the grid square template element.
		 */
		var _getTemplateElem = function () {

			var elem = document.createElement('div');
			elem.classList.add('elasto-square');

			var bgElem = document.createElement('div');
			bgElem.classList.add('elasto-square-bg');

			var wrapElem = document.createElement('div');
			wrapElem.classList.add('elasto-square-wrap');

			var title = document.createElement('div');
			title.classList.add('elasto-square-title');

			var description = document.createElement('div');
			description.classList.add('elasto-square-description');

			elem.appendChild(bgElem);
			elem.appendChild(wrapElem);
			wrapElem.appendChild(title);
			wrapElem.appendChild(description);

			return elem.cloneNode(true);

		};

		/**
		 * Set column and row count and calculate size of squares according
		 * to the grid container width.
		 */
		var _setDimensions = function () {

			var totalWidth = Math.floor(_container.clientWidth);

			var newColCount = Math.floor(totalWidth / _options.minSize);
			newColCount = newColCount === 0 ? 1 : newColCount;

			if (newColCount !== _colCount) {

				_colCount = newColCount;
				_fullRowCount = Math.floor(_data.length / _colCount);
				_lastRowColCount = _data.length % _colCount;
				_squareSize = 100 / _colCount;

			}

		};

		/**
		 * Event handler for window.resize event.
		 */
		var _resize = function () {

			if (_resizeTimeout)
				clearTimeout(_resizeTimeout);

			// Timeout because we don't want this to fire a million times on resize.
			_resizeTimeout = setTimeout(_doResize, 50);

		};

		/**
		 * Recalculate dimensions of all grid squares to fit the new containerId
		 * size after window.resize has been triggered.
		 */
		var _doResize = function () {

			if (_data.length) {

				var prevSquareSize = _squareSize.valueOf();

				_setDimensions();

				// Only set new width percentage if it has actually changed.
				if (prevSquareSize !== _squareSize) {

					// Calc height in px to match new width.
					_data[0].elem.style.width = _squareSize + '%';
					_squareSizePx = Math.floor(_data[0].elem.clientWidth);

					// Update all elems.
					for (var i = 0; i < _data.length; i++) {

						_data[i].elem.style.width = _squareSize + '%';
						_data[i].elem.style.height = _squareSizePx + 'px';

					}

				}

				// Always update height to match width.
				else {

					// Calc height in px based on width.
					_squareSizePx = Math.floor(_data[0].elem.clientWidth);

					// Update all elems.
					for (var j = 0; j < _data.length; j++)
						_data[j].elem.style.height = _squareSizePx + 'px';

				}

			}

		};

		/**
		 * Set the active element of the grid.
		 * @param {number} id Id of the object to set as active.
		 */
		var _setActive = function (id) {

			var elems = _container.getElementsByClassName('active');

			for (var i = 0; i < elems.length; i++)
				elems[i].classList.remove('active');

			_activeId = id;
			_data[id - 1].elem.classList.add('active');

		};

		/**
		 * Get the active element of the grid.
		 * @return {object} Active object.
		 */
		var _getActive = function () {

			return _data[_activeId - 1];

		};

		/**
		 * Keep the active element of the grid inside the viewport by scrolling
		 * in the necessary directions.
		 */
		var _trackActive = function () {

			if (_data.length) {

				var overflow,
					scrollElem = _container;

				// Find out if there's a wrapper element that has overflow scrolling
				// bubbles up until a scroll element is found or end of document is reached.
				while (scrollElem) {

					overflow = window.getComputedStyle(scrollElem).getPropertyValue('overflow');

					// Overflow scrolling element found.
					if (overflow !== 'visible')
						break;

					scrollElem = scrollElem.parentElement;

				}

				var minMargin = 50,
					newScrollPosX, newScrollPosY,
					elemPosY, elemPosX,
					viewStartY, viewEndY,
					viewStartX, viewEndX;

				// No overflow scrolling, use window as reference.
				if (!scrollElem) {

					elemPosY = _getElemOffset(_getActive().elem).top;
					elemPosX = _getElemOffset(_getActive().elem).left;

					viewStartY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
					viewEndY = viewStartY + window.innerHeight;

					viewStartX = (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0);
					viewEndX = viewStartX + window.innerWidth;

					newScrollPosY = viewStartY;
					newScrollPosX = viewStartX;

					// Below viewport.
					if (elemPosY + _squareSizePx + minMargin > viewEndY)
						newScrollPosY = elemPosY + _squareSizePx + minMargin - window.innerHeight;

					// Above viewport.
					else if (elemPosY - minMargin < viewStartY)
						newScrollPosY = elemPosY - minMargin;

					// Right of viewport.
					if (elemPosX + _squareSizePx + minMargin > viewEndX)
						newScrollPosX = elemPosX + _squareSizePx + minMargin - window.innerWidth;

					// Left of viewport.
					else if (elemPosX - minMargin < viewStartX)
						newScrollPosX = elemPosX - minMargin;

					// Scroll to new position if necessary.
					if (_options.trackAnimation)
						_scrollTo(document.body, {
							top: newScrollPosY,
							left: newScrollPosX
						}, 200);

					else
						window.scrollTo(newScrollPosX, newScrollPosY);

				}

				// Overflow scrolling ("overflow hidden" is not handled at all since we can't focus on
				// something that's not visible).
				else if (overflow !== 'hidden') {

					elemPosY = _getElemRelativeOffset(_getActive().elem).top;
					elemPosX = _getElemRelativeOffset(_getActive().elem).left;

					viewStartY = scrollElem.scrollTop;
					viewEndY = viewStartY + scrollElem.clientHeight;

					viewStartX = scrollElem.scrollLeft;
					viewEndX = viewStartX + scrollElem.clientWidth;

					newScrollPosY = viewStartY;
					newScrollPosX = viewStartX;

					// Below viewport.
					if (elemPosY + _squareSizePx + minMargin > viewEndY)
						newScrollPosY = elemPosY + _squareSizePx + minMargin - scrollElem.clientHeight;

					// Above viewport.
					else if (elemPosY - minMargin < viewStartY)
						newScrollPosY = elemPosY - minMargin;

					// Right of viewport.
					if (elemPosX + _squareSizePx + minMargin > viewEndX)
						newScrollPosX = elemPosX + _squareSizePx + minMargin - scrollElem.clientWidth;

					// Left of viewport.
					else if (elemPosX - minMargin < viewStartX)
						newScrollPosX = elemPosX - minMargin;

					if (_options.trackAnimation)
						_scrollTo(scrollElem, {
							top: newScrollPosY,
							left: newScrollPosX
						}, 200);

					else {
						scrollElem.scrollTop = newScrollPosY;
						scrollElem.scrollLeft = newScrollPosX;
					}

				}

			}

		};

		/**
		 * Get offset values for an element.
		 * @param {element} elem The DOM element to get offset for.
		 * @return {object.<number>} Object containing top and left offset in px.
		 */
		var _getElemOffset = function (elem) {

			var top = 0,
				left = 0;

			while (elem) {

				top = top + parseInt(elem.offsetTop, 10);
				left = left + parseInt(elem.offsetLeft, 10);

				elem = elem.offsetParent;

			}

			return {
				top: top,
				left: left
			};

		};

		/**
		 * Get relative offset values for an element.
		 * @param {element} elem The DOM element to get offset for.
		 * @return {object.<number>} Object containing top and left offset in px.
		 */
		var _getElemRelativeOffset = function (elem) {

			var childPos = {
				top: parseInt(elem.offsetTop, 10),
				left: parseInt(elem.offsetLeft, 10)
			};
			var parentPos = {
				top: parseInt(elem.parentElement.offsetTop, 10),
				left: parseInt(elem.parentElement.offsetLeft, 10)
			};

			var positioning = window.getComputedStyle(elem.parentElement).getPropertyValue('position'),
				childOffset;

			// Relative and absolute positioning starts offset count from parent element.
			if (positioning === 'relative' || positioning === 'absolute') {

				childOffset = childPos;

			}

			// Other positioning start offset from top of document.
			else {

				childOffset = {
					top: childPos.top - parentPos.top,
					left: childPos.left - parentPos.left
				};

			}

			return childOffset;

		};

		/**
		 * Scroll viewport to a given grid square element with easing.
		 * @param {element} elem The DOM element that is scrolled. Usually document.body.
		 * @param {object} to Object containing top and left offset value to scroll to.
		 * @param {number} duration Duration of the scroll animation.
		 */
		var _scrollTo = function (elem, to, duration) {

			var startY = elem.scrollTop,
				startX = elem.scrollLeft,
				changeY = to.top - startY,
				changeX = to.left - startX,
				currentTime = 0,
				increment = 20;

			var animateScroll = function () {

				currentTime += increment;

				var valY = Elasto.Easing.InOutQuad(currentTime, startY, changeY, duration);
				var valX = Elasto.Easing.InOutQuad(currentTime, startX, changeX, duration);

				elem.scrollTop = valY;
				elem.scrollLeft = valX;

				if (currentTime < duration)
					setTimeout(animateScroll, increment);

			};

			animateScroll();

		};

		/**
		 * Grid square click event handler.
		 */
		var _click = function (e) {

			var id = parseInt(e.target.getAttribute('data-id'), 10);

			if (!id)
				id = parseInt(e.target.parentElement.getAttribute('data-id'), 10);

			if (id) {

				var prevId = _activeId;

				_setActive(id);

				e.preventDefault();

				// Make sure the new active element is inside the users viewport.
				if (_options.trackActive)
					_trackActive();

				// Trigger "click" event.
				if (_options.click)
					_options.click(_getActive());

				// Trigger "move" event.
				if (_options.move && prevId !== id)
					_options.move(_getActive());

				// Trigger "select" event.
				if (_options.select)
					_options.select(_getActive());

			}

		};

		/**
		 * Window key up event handler.
		 */
		var _keyUp = function (e) {

			if (_data.length && _options.keyEventsEnabled) {

				var keyCode = e.which || e.keycode;

				if (keyCode === 13) {

					e.preventDefault();

					// Trigger "enter" event.
					if (_options.enter)
						_options.enter(_getActive());

					// Trigger "select" event.
					if (_options.select)
						_options.select(_getActive());

				}

			}

		};

		/**
		 * Window key down event handler.
		 */
		var _keyDown = function (e) {

			if (_data.length && _options.keyEventsEnabled) {

				var keyCode = e.which || e.keycode,
					moved = true;

				switch (keyCode) {

				case 38: // Up
					_moveUp();
					break;

				case 40: // Down
					_moveDown();
					break;

				case 37: // Left
					_moveLeft();
					break;

				case 39: // Right
					_moveRight();
					break;

				default:
					moved = false;
					break;

				}

				if (moved) {

					e.preventDefault();

					// Make sure the new active element is inside the users viewport.
					if (_options.trackActive)
						_trackActive();

					// Trigger "move" event if specified.
					if (_options.move)
						_options.move(_getActive());

				}

			}

		};

		/**
		 * Move active selection one step to the right.
		 */
		var _moveRight = function () {

			var id;

			// No previously active elem, default to 1.
			if (!_activeId)
				id = 1;

			// Reached right end of full row.
			else if (_activeId % _colCount === 0)
				id = _activeId - _colCount + 1;

			// Reached right end of last (shorter) row.
			else if (_activeId === _data.length)
				id = _activeId - _lastRowColCount + 1;

			else
				id = _activeId + 1;

			_setActive(id);

		};

		/**
		 * Move active selection one step to the left.
		 */
		var _moveLeft = function () {

			var id;

			// No previously active elem, default to 1.
			if (!_activeId)
				id = 1;

			// Reached left end of full row.
			else if ((_activeId - 1) % _colCount === 0) {

				id = _activeId + _colCount - 1;

				// Rightmost square (on last row) doesn't exist.
				if (id > _data.length)
					id = _data.length;

			} else
				id = _activeId - 1;

			_setActive(id);

		};

		/**
		 * Move active selection one step down.
		 */
		var _moveDown = function () {

			var id;

			// No previously active elem, default to 1.
			if (!_activeId)
				id = 1;

			// Reached last (short) row.
			else if (_activeId > _data.length - _lastRowColCount)
				id = _activeId - _fullRowCount * _colCount;

			// Reached last full row.
			else if (_activeId + _colCount > _data.length)
				id = _activeId - ((_fullRowCount - 1) * _colCount);

			else
				id = _activeId + _colCount;

			_setActive(id);

		};

		/**
		 * Move active selection one step up.
		 */
		var _moveUp = function () {

			var id;

			// No previously active elem, default to 1.
			if (!_activeId)
				id = 1;

			// Reached first row.
			else if (_activeId <= _colCount) {

				id = _activeId + _fullRowCount * _colCount;

				// Square on last row doesn't exist.
				if (id > _data.length)
					id = id - _colCount;

			} else
				id = _activeId - _colCount;

			_setActive(id);

		};

		// PUBLIC INSTANCE METHODS
		//
		// These methods define the public API and are chainable.

		/**
		 * Trigger the grid resize event manually. Sometimes this is necessary to
		 * do since the resize event handlar isn't automatically triggered if the 
		 * container is hidden while the window is resized.
		 */
		this.resize = function () {

			_doResize();

			return _self;

		};

		/**
		 * Reload the grid with new data.
		 * @param {array.<object>} newData Array of objects to add to the grid.
		 */
		this.reload = function (newData) {

			if (newData)
				_data = newData;

			// Trigger the use of hideIncompleteRow again.
			_initiated = false;

			_buildGrid();

			return _self;

		};

		/**
		 * Empty the grid.
		 */
		this.empty = function () {

			this.reload([]);

			return _self;

		};

		/**
		 * Add an object to the grid.
		 * @param {object} obj Object to add.
		 */
		this.add = function (obj) {

			_data.push(obj);

			// Trigger re-calculation of grid.
			_colCount = 0;
			_setDimensions();

			_addElemFromData(_data.length - 1);

			// Mark as active if it's the first one.
			if (_data.length === 1)
				_setActive(1);

			return _self;

		};

		/**
		 * Remove an object from the grid.
		 * @param {number} id Id of object to remove.
		 */
		this.remove = function (id) {

			id = parseInt(id, 10);

			// Remove the object in question.
			for (var i = 0; i < _data.length; i++) {

				if (i === id - 1)
					_data.splice(i, 1);

			}

			// We have to rebuild the whole grid since the index numbering is now offset.
			_buildGrid();

			return _self;

		};

		/**
		 * Select an object on the grid. This triggers the select event.
		 * @param {number} id Id of object to select.
		 */
		this.select = function (id) {

			id = parseInt(id, 10);

			if (id <= _data.length) {

				_setActive(id);

				if (_options.trackActive)
					_trackActive();

				// Trigger "move".
				if (_options.move)
					_options.move(_getActive());

				// Trigger "select".
				if (_options.select)
					_options.select(_getActive());

			}

			return _self;

		};

		/**
		 * Move active selection to an object on the grid. This triggers the move event
		 * but not the select event.
		 * @param {number} id Id of object to move to.
		 */
		this.moveTo = function (id) {

			id = parseInt(id, 10);

			if (id <= _data.length) {

				_setActive(id);

				if (_options.trackActive)
					_trackActive();

				// Trigger "move".
				if (_options.move)
					_options.move(_getActive());

			}

			return _self;

		};

		// PUBLIC GET/SET PROPERTIES
		//
		// These properties define the public API.

		/**
		 * The currently selected or active object.
		 * @type {object}
		 */
		this.__defineGetter__('active', function () {

			return _getActive();

		});

		/**
		 * The underlying array of data.
		 * @type {array.<object>}
		 */
		this.__defineGetter__('data', function () {

			return _data;

		});

		/**
		 * The number of objects on the grid.
		 * @type {number}
		 */
		this.__defineGetter__('count', function () {

			return _data.length;

		});

		/**
		 * Expose options to the public API.
		 * @type {object}
		 */
		this.__defineGetter__('options', function () {

			return _options;

		});

		// Let's go!
		_init();

		return this;

	};

}