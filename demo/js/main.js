var testData = [],
	grid;

// Generate test data.
for (var i = 0; i < 10; i++) {
	testData.push({
		id: i + 1,
		title: 'Image ' + (i + 1),
		text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		image: ''
	});
}

$(function () {

	// Create the grid.
	grid = new Elasto('grid', testData, {
		
		// Bind move event.
		move: function (obj) {
			console.log('Moved to: ' + obj.id);
		},
		
		// Bind select event (click or enter key).
		select: function (obj) {
			console.log('Selected: ' + obj.id);
			alert('Selected ' + obj.title);
		},
		
		// Specify which properties of the data to display in the grid.
		displayProperties: {
			image: 'image', // Property that holds the url to the image.
			title: 'title', // Property that holds the title.
			description: 'text' // Property that holds the text.
		},
		
		// Minimum square size in px.
		minSize: 200,
		
		// Add a html title attribute to every image. Use handlebar
		// notation to select dynamic values of properties.
		customAttributes: {
			'title': 'This is {{title}}'
		}

	});

	// Add another image after 1 second and then move to it.
	setTimeout(function () {
		grid.add({
			id: 99,
			title: 'I\'m a new image',
			text: 'I was dynamically added to the grid.',
			image: ''
		}).moveTo(grid.count);
	}, 1000);

});