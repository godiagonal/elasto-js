/*global $ */

/**
 * Init wrapper for the Elasto jQuery module.
 * @param {Object} The Object that Elasto gets attached to in elasto.init.js.
 */
function initElastoJquery(context) {

	'use strict';

	if (!context.jQuery)
		return;

	/**
	 * Wrap new Elasto instance in jQuery method for convenience.
	 * @param {array.<object>} data Initial array of objects to be rendered in the grid.
	 * @param {object} options Object of containing options for the grid.
	 */
	$.fn.elasto = function (data, options) {
		if (this.length === 1)
			return new context.Elasto($(this).attr('id'), data, options);
		else
			return this;
	};

}