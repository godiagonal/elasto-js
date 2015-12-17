/*global initElastoCore initElastoEasing initElastoJquery */

var initElasto = function (context) {

	initElastoCore(context);
	initElastoEasing(context);
	initElastoJquery(context);

	return context.Elasto;

};

if (typeof define === 'function' && define.amd) {

	// Expose Elasto as an AMD module if it's loaded with RequireJS or
	// similar.
	define(function () {
		return initElasto({});
	});

} else {

	// Load Elasto normally (creating a Library global) if not using an AMD
	// loader.
	initElasto(this);

}