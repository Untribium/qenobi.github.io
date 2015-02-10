var Query = (function() {

	function Query() {

	}

	return Query;

})();


var Schema = (function() {

	Schema.prototype.rows;
	Schema.prototype.attributes;

	function Schema() {

	}

	function Schema(rows, attributes) {
		this.rows = rows;
		this.attributes = attributes || [];
	}

	Schema.prototype.getRows = function() {
		return this.rows;
	}

	Schema.prototype.getColumns = function() {
		return this.attributes.length;
	}

	Schema.prototype.clone = function() {
		return new Schema(this.rows, this.cols.slice(0));
	}

	return Schema;

})();