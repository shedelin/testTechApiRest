'use strict';
module.exports = function(app) {
	var api = require('../controllers/apiController');

	app.route('/search')
		.post(api.search_from_json);
};