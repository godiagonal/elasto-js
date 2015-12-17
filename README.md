# Elasto.js

Description goes here. Link to [demo](https://godiagonal.github.com/elasto-js/demo)
and Wauv.it.

### Features

  * Good stuff
  * More good stuff
  * Lightweight and without dependencies.
  * Built in native JS with optional jQuery support.
  * Works in all major browsers and on mobile.
  
### Known issues

  * No jQuery support not working. This will be resolved soon.
  * Shitty live demo.
  
# Installation

Download files and include in project. Both JS and css.

````html
<yay></yay>
````

# Usage

Create an Elasto instance.

````javascript
blabla
````

Describe what kind of data can be used.

# Options

### keyEventsEnabled

*boolean | default: true*

This is an option.

````javascript
keyEventsEnabled = false;
````

### click

*function | default: null*

This is another option.

````javascript
click: function (obj) {
	alert('You clicked ' + obj.title);
}
````

# JavaScript API

### elasto.options

This is a property.

````javascript
elasto.options.trackActive = true;
````

### elasto.reload

This is a method.

Arguments:
  * *arg1 (optional)* - Some data.

````javascript
elasto.reload(data);
````

# Styling

Elasto.js comes with a css file containing some basic styling, see
[elasto.css](dist/css/elasto.css).

It's a good idea to override these
styles in a custom css file to avoid loss of data when updating to a new
version of the library. See [elasto-custom.css](demo/css/elasto-custom.css)
for an example on how to do this.

### .elasto

This is the grid container.

### .elasto-square

This is a square in the grid.

### .elasto-square-bg

This is the background image of a square.

# License

Copyright (c) 2015 Samuel Johansson. Licensed under the MIT license.