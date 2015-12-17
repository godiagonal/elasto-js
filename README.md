# Elasto.js

A lightweight library for making responsive image grids that can be interacted with
through keyboard and mouse events.
You can try it in the [sandbox demo](https://godiagonal.github.io/elasto-js/demo).

Because it's easily refreshable and supports keyboard and click events
it works great for displaying search results where images are involved. For a
live example of this using the SoundCloud API visit my other project
[wauv.it](http://wauv.it).

### Features

  * Images are displayed in a square format and the proportions will be preserved when the grid is resized.
  * Data in any format can be used as long as it's an array containing objects. This works great for displaying results from an API request.
  * The format of the original data is preserved and the original objects are returned upon selection.
  * Supports common keyboard and mouse events to select objects in the grid.
  * Arrow keys can be used to move through the grid in all directions.
  * Easy to dynamically add, remove or replace objects in the grid. 
  * Lightweight and without dependencies.
  * Built in native JS with optional jQuery support.
  * Works in all major browsers and on mobile.
  
### Known issues

  * The sandbox demo isn't finished.
  * Doesn't have built in paging. For now this can be managed from outside the library depending on the needs of your application.

### Contents

  * [Installation](#installation)
  * [Usage](#usage)
  * [Options](#options)
  * [JavaScript API](#javascript-api)
  * [Styling](#styling)

# Installation

Download files from the [dist](dist) folder and include them in your project.
Include both the .js and .css files. jQuery is supported but not required.

````html
<link type="text/css" rel="stylesheet" href="/css/elasto.min.css" />

<script type="text/javascript" src="js/vendor/jquery.js"></script> <!-- jQuery is optional -->
<script type="text/javascript" src="js/vendor/elasto.min.js"></script>
````

# Usage

Presume we have an array of objects called `data` for which we wish to create a grid.

````javascript
var data = [
	{
		id: 656,
		name: 'Jane',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		profile_picture: 'http://someimagearchive.com/jane-picture.jpg',
		// ...
	},
	{
		id: 2657,
		name: 'John',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		profile_picture: 'http://someimagearchive.com/john-picture.jpg',
		// ...
	},
	// ...
];
````

To create a grid we have to create an instance of Elasto. This can be done either
with native JavaScript or jQuery. The parameters are the same either way.

The native JS way:

````javascript
// With options in a variable
var grid = new Elasto('id-of-grid-container', data, options);

// Or with anonymously typed options
var grid = new Elasto('id-of-grid-container', data, {
	displayProperties: {
		image: 'profile_picture', // Name of property that holds the url to the image
		title: 'name', // Name of property that holds the title text
		description: 'description' // Name of property that holds the description text
	},
	customAttributes: {
		'title': 'This is {{name}}' // Add a title attribute to every image
	},
	select: function (obj) {
		alert('I am ' + obj.name + ' and I have been chosen!'); // Alert when an image is clicked
	}
});

````

The jQuery way:

````javascript
var grid = $('#id-of-grid-container').elasto(data, options);
````

This goes to demonstrate that any kind of data can be used as long as it's an array
of objects.

Methods of an Elasto instance can be chained.

````javascript
// Move to the last image after creating the grid
var grid = $('#id-of-grid-container').elasto(data, options).moveTo(data.length);

// On click, remove the clicked image from the grid and add it again at the end
grid.options.click = function (obj) {
	// elastoId is added to every object upon creating the grid and adding new objects
	grid.remove(obj.elastoId).add(obj);
});
````

# Options

### displayProperties

*object | default: { image: 'image', title: 'title', description: 'description' }*

Specifies which properties of the data to display in the grid. The following
properties should be set: `image`, `title` and `description`.

````javascript
displayProperties: {
	image: 'profile_picture', // Name of property that holds the url to the image
	title: 'name', // Name of property that holds the title text
	description: 'description' // Name of property that holds the description text
}
````

**Note:** In the future you will be able to use nested properties with dot notation as
such: `image: 'user.profile_picture'`

### customAttributes

*object | default: {}*

Specifies custom html attributes and their values that should be assigned to every
square element. You can use handlebar notation to display object-specific properties.

````javascript
customAttributes: {
	'data-foo': 'Bar',
	'title': 'This is {{name}}'
}
````

**Note:** In the future you will be able to use nested properties with dot notation as
such: `'title': 'This is {{user.name}}'`

### minSize

*number | default: 150*

Minimum width and height for squares in pixels. When the grid is resized and 
the squares fall below this threshold the number of squares per row will decrease
by one and thus the size of each square is increased to fill the row width.

### hideIncompleteRow

*boolean | default: false*

Hide the last row in the grid if it's not complete. This should be used with caution
as it splices records from the original data.

### trackActive

*boolean | default: true*

Keep active element in the viewport at all times by automatically scrolling.

### trackAnimation

*boolean | default: true*

Animate scroll when tracking active element in viewport.

### keyEventsEnabled

*boolean | default: true*

Wether or not keyboard events (arrows and enter) are enabled. If you toggle between
multiple grids in your application this can be useful.

### move

*function | default: null*

Move event handler. This event is triggered when the active object is changed
by clicking or pressing arrow keys. It can also be triggered manually with
`grid.moveTo(id)` and `grid.select(id)`.
An argument containing the active object is passed to the function. 

````javascript
move: function (obj) {
	alert('You moved to ' + obj.name);
}
````

### enter

*function | default: null*

Enter key event handler. This is triggered when pressing enter on an active object.
An argument containing the active object is passed to the function.

````javascript
enter: function (obj) {
	alert('You pressed enter when ' + obj.name + ' was active');
}
````

### click

*function | default: null*

Click event handler. This is triggered when the user clicks on an object.
An argument containing the clicked object is passed to the function.

````javascript
click: function (obj) {
	alert('You clicked ' + obj.name);
}
````

### select

*function | default: null*

Select event handler. This is triggered when the object is selected by clicking
or pressing enter on an active object. It can also be triggered manually with
`grid.select(id)`.
An argument containing the selected object is passed to the function.

````javascript
select: function (obj) {
	alert('You selected ' + obj.name);
}
````

# JavaScript API

### elasto.options

*Get only.* Returns the options object. The object itself cannot be replaced but
its properties can be modified.

````javascript
// Get an option value
var keyEventsEnabled = elasto.options.keyEventsEnabled;

// Set an option value
elasto.options.minSize = 300;
elasto.resize();
````

**Important!**
When changing values for `hideIncompleteRow`, `customAttributes` and
`displayProperties` you have to reload the grid for the changes to take
effect. This is done with `elasto.reload()`. When changing the value for
`minSize` you have to trigger the resize event for the change to take effect.
This is done with `elasto.resize()`.

### elasto.data

*Get only.* Returns the underlying data array.

````javascript
var gridData = elasto.data;
````

### elasto.count

*Get only.* Returns the number of objects in the grid.

````javascript
var gridCount = elasto.count;
````

### elasto.active

*Get only.* Returns the currently selected or active object.

````javascript
var currentObj = elasto.active;
````

### elasto.resize()

Trigger the grid resize event manually. Sometimes this is necessary to
do since the resize event isn't automatically triggered if the 
grid container is hidden while the window is resized.

````javascript
elasto.resize();
````

### elasto.reload(newData)

Reload the grid with new data or reload the grid with current data.

Arguments:
  * *newData **(optional)*** - The new data to use in the grid.

````javascript
// Trigger a reload without changing the data
elasto.reload();

// Trigger a reload with a new set of data
elasto.reload(myNewData);
````

### elasto.empty()

Empty the grid.

````javascript
elasto.empty();
````

### elasto.add(obj)

Add an object to the grid.

Arguments:
  * *obj* - The object to add. It should have the same format as the other objects in the grid.

````javascript
elasto.add({
	id: 543,
	name: 'Samuel',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	profile_picture: 'http://someimagearchive.com/samuel-picture.jpg',
	// ...
});
````

### elasto.remove(elastoId)

Remove an object from the grid.

Arguments:
  * *elastoId* - The elastoId of the object to remove.

````javascript
// Remove clicked item
click: function (obj) {
	elasto.remove(obj.elastoId);
}
````

**Note:** The `elastoId` property is assigned to every object as it is added to the grid.

### elasto.select(elastoId)

Select an object on the grid. This triggers the move and select event.

Arguments:
  * *elastoId* - The elastoId of the object to select.

````javascript
// Select the last object in the grid
elasto.select(elasto.count);
````

### elasto.moveTo(elastoId)

Move active selection to an object on the grid. This triggers the move event
but not the select event.

Arguments:
  * *elastoId* - The elastoId of the object to move to.

````javascript
// Move to the first object in the grid
elasto.moveTo(1);
````

# Styling

Elasto.js comes with a css file containing some basic styling, see
[elasto.css](dist/css/elasto.css). Some of these styles are crucial for
the behaviour of the grid and some are just there to make it look pretty.

If you want to customize these styles it's a good idea to override them
in a separate css file to avoid loss of data when updating to a new
version of Elasto. See [elasto-custom.css](demo/css/elasto-custom.css)
for an example on how to do this.

These are some common css selectors used for styling the grid: 

### .elasto-container

This is the container element for the grid. If your container has a fixed `height`
you should use `overflow-y: scroll` to enable scrolling inside the container.

### .elasto-square

This is a square on the grid. You might want to add a `cursor: pointer` to
this if the images are interactive (clickable) in some way.

### .elasto-square-bg

This is the background image of a square. You might want to change the
default `background-image` which is used when no image url is found in the data.
You can also change the `margin`, `width` and `height` to adjust the coverage
area of the background to something that better suits your needs.

### .elasto-square-wrap

This is the text overlay area of a square. It's `background-color` is semi-transparent
white by default but this can be changed to your liking. The position of the overlay
can also be changed by using `top: 0`.

### .elasto-square-title

This is the title text in the text overlay area of a square. Feel free to change these
text styling and behaviour. You might want to add some `overflow` management since the
text area is limited.

### .elasto-square-description

This is the description text in the text overlay area of a square. This can be styled
in the same ways as the `.elasto-square-title`.

### .elasto-square.active

This is the elasto square when it's active (moved to with arrow keys) and is commonly
used together with `.elasto-square-bg` and `.elasto-square-wrap` to clarify which
image is active.

```css
.elasto-square.active .elasto-square-bg {
	/* Do stuff */
}

.elasto-square.active .elasto-square-wrap {
	/* Do other stuff */
}
```

### .elasto-square:hover

This is the elasto square when it's hovered and should not be confused with `.active`.
Since the user can select items both by keyboard and mouse events we want to keep the
styling behaviour of these separated. This is also commonly used together with
`.elasto-square-bg` and `.elasto-square-wrap`.

```css
.elasto-square:hover .elasto-square-bg {
	/* Do stuff */
}

.elasto-square:hover .elasto-square-wrap {
	/* Do other stuff */
}
```

# License

Copyright (c) 2015 Samuel Johansson. Licensed under the MIT license.