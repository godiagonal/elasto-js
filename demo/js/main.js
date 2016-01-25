var testData = [],
	gridInterface,
	grid;

// Generate test data.
for (var i = 0; i < 12; i++) {
	testData.push({
		id: i + 1,
		title: 'Image ' + (i + 1),
		text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		image: 'https://unsplash.it/600/600?image=' + i * 10
	});
}

$(function () {

	// Create the grid. This could also be done in native JS with the following syntax:
	// grid = new Elasto('id-of-grid-container', data, options);
	grid = $('#grid').elasto(testData, {
		
		// Specify which properties of the data to display in the grid.
		displayProperties: {
			image: 'image', // Property that holds the url to the image.
			title: 'title', // Property that holds the title.
			description: 'text' // Property that holds the text.
		},
		
		// Minimum square size in px.
		minSize: 300,
		
		// Add a html title attribute to every image. Use handlebar
		// notation to select dynamic values of properties.
		customAttributes: {
			'title': 'This is {{title}}'
		}

	});
	
	// Bind sandbox interface controls.
	initSandbox(grid);
	
});

function initSandbox(grid) {
	
	var gi = new elastoInterface(grid);
	var gui = new dat.GUI();
	var f1 = gui.addFolder('Options');
	var f3 = gui.addFolder('Events');
	var f2 = gui.addFolder('Methods');
	
	f1.open();
	f2.open();
	f3.open();
	
	f1.add(gi, 'minSize', 100, 800);
	f1.add(gi, 'hideIncompleteRow', true, false);
	f1.add(gi, 'trackActive', true, false);
	f1.add(gi, 'trackAnimation', true, false);
	f1.add(gi, 'keyEventsEnabled', true, false);
	f2.add(gi, 'empty');
	f2.add(gi, 'add');
	f2.add(gi, 'remove');
	f3.add(gi, 'move', { None: 0, ConsoleLog: 1, Alert: 2 });
	f3.add(gi, 'enter', { None: 0, ConsoleLog: 1, Alert: 2 });
	f3.add(gi, 'click', { None: 0, ConsoleLog: 1, Alert: 2 });
	f3.add(gi, 'select', { None: 0, ConsoleLog: 1, Alert: 2, Remove: 3 });
	
	gi.move = 1;
	gi.select = 2;

}