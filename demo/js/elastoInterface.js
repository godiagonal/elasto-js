// Interface class for elasto instance to enable live updating of the grid in sandbox.
function elastoInterface(grid) {
	this._grid = grid;
	this._move = 1;
	this._enter = 0;
	this._click = 0;
	this._select = 2;
	this.empty = function () {
		this._grid.empty();
	}
	this.add = function () {
		this._grid.add({
			id: this._grid.count + 1,
			title: 'Image ' + (this._grid.count + 1),
			text: 'I\'m a new image, I was dynamically added to the grid.',
			image: 'https://unsplash.it/600/600?image=' + (this._grid.count + 1) * 10
		});
	}
	this.remove = function () {
		if (this._grid.count > 0)
			this._grid.remove(this._grid.data[this._grid.count-1].id);
	}
}

elastoInterface.prototype = {
	get minSize() {
		return this._grid.options.minSize;
	},
	set minSize(value) {
		this._grid.options.minSize = value;
		this._grid.resize();
	},
	get hideIncompleteRow() {
		return this._grid.options.hideIncompleteRow;
	},
	set hideIncompleteRow(value) {
		this._grid.options.hideIncompleteRow = value;
	},
	get trackActive() {
		return this._grid.options.trackActive;
	},
	set trackActive(value) {
		this._grid.options.trackActive = value;
	},
	get trackAnimation() {
		return this._grid.options.trackAnimation;
	},
	set trackAnimation(value) {
		this._grid.options.trackAnimation = value;
	},
	get keyEventsEnabled() {
		return this._grid.options.keyEventsEnabled;
	},
	set keyEventsEnabled(value) {
		this._grid.options.keyEventsEnabled = value;
	},
	get move() {
		return this._move;
	},
	set move(value) {
		this._move = value;
		if (value == 0)
			this._grid.options.move = null;
		else if (value == 1)
			this._grid.options.move = function (obj) { console.log('Moved to: ' + obj.id); }
		else if (value == 2)
			this._grid.options.move = function (obj) { alert('Moved to: ' + obj.id); }
	},
	get enter() {
		return this._enter;
	},
	set enter(value) {
		this._enter = value;
		if (value == 0)
			this._grid.options.enter = null;
		else if (value == 1)
			this._grid.options.enter = function (obj) { console.log('Pressed enter on: ' + obj.id); }
		else if (value == 2)
			this._grid.options.enter = function (obj) { alert('Pressed enter on: ' + obj.id); }
	},
	get click() {
		return this._click;
	},
	set click(value) {
		this._click = value;
		if (value == 0)
			this._grid.options.click = null;
		else if (value == 1)
			this._grid.options.click = function (obj) { console.log('Clicked on: ' + obj.id); }
		else if (value == 2)
			this._grid.options.click = function (obj) { alert('Clicked on: ' + obj.id); }
	},
	get select() {
		return this._select;
	},
	set select(value) {
		this._select = value;
		if (value == 0)
			this._grid.options.select = null;
		else if (value == 1)
			this._grid.options.select = function (obj) { console.log('Selected: ' + obj.id); }
		else if (value == 2)
			this._grid.options.select = function (obj) { alert('Selected: ' + obj.id); }
		else if (value == 3)
			this._grid.options.select = function (obj) { grid.remove(obj.id); }
	},
}
