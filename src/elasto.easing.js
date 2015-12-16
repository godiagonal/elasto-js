/**
 * Init wrapper for the Elasto easing module.
 * @param {Object} The Object that Elasto gets attached to in elasto.init.js.
 * If Elasto was not loaded with an AMD loader such as require.js, this is
 * the global Object.
 */
function initElastoEasing(context) {

	'use strict';

	var Elasto = context.Elasto;

	/**
	 * Constructor for the Elasto easing module.
	 * @constructor
	 */
	var Easing = Elasto.Easing = function () {
		
		return this;
		
	};

	/**
	 * Static method used for easing with a quadratic function.
	 * @param {number} t Current time
	 * @param {number} b Start value
	 * @param {number} c Change in value
	 * @param {number} d Duration
	 */
	Easing.InOutQuad = function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t + b;
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	};

}