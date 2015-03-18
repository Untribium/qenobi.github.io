function Config() {}

Config.joinTypes;
Config.mergeTypes;
Config.aggregateTypes;
Config.comparisonTypes;
Config.connectiveTypes;

Config.readTypes = function() {
	Config.readJoinTypes();
	Config.readAggregateTypes();
	Config.readComparisonTypes();
	Config.readConnectiveTypes();
	Config.readMergeTypes();
}

Config.readJoinTypes = function() {
	Config.joinTypes = [];

	var types = Resources.joinTypes;

	for(var i = 0; i < types.length; i++) {
		Config.joinTypes.push(new JoinType(types[i].display, types[i].value));
	}
}

Config.readComparisonTypes = function() {
	Config.comparisonTypes = [];
	
	var types = Resources.comparisonTypes;

	for(var i = 0; i < types.length; i++) {
		Config.comparisonTypes.push(new ComparisonType(types[i].display, types[i].value));
	}

}

Config.readAggregateTypes = function() {
	Config.aggregateTypes = [];
	
	var types = Resources.aggregateTypes;

	for(var i = 0; i < types.length; i++) {
		Config.aggregateTypes.push(new AggregateType(types[i].display, types[i].value, types[i].output));
	}

}

Config.readConnectiveTypes = function() {
	Config.connectiveTypes = [];
	
	var types = Resources.connectiveTypes;

	for(var i = 0; i < types.length; i++) {
		Config.connectiveTypes.push(new ConnectiveType(types[i].display, types[i].value));
	}

}

Config.readMergeTypes = function() {
	Config.mergeTypes = [];
	
	var types = Resources.mergeTypes;

	for(var i = 0; i < types.length; i++) {
		Config.mergeTypes.push(new MergeType(types[i].display, types[i].value));
	}

}

Config.schema;

Config.readSchema = function(schema) {
	Config.schema = [];

	for(var i = 0; i < schema.length; i++) {
		var relation = new Relation(schema[i].name, 's'+i);

		for(var j = 0; j < schema[i].attributes.length; j++) {
			var def = schema[i].attributes[j];
			var attribute = new Attribute(def.name, def.name, def.type, relation);
			relation.addAttribute(attribute);
		}

		Config.schema.push(relation);
	}
}

var AbstractType = (function() {

	AbstractType.prototype.value;
	AbstractType.prototype.display;

	function AbstractType(display, value) {
		this.value = value;
		this.display = display;
	}

	AbstractType.prototype.getDisplay = function() { return this.display; }

	AbstractType.prototype.getValue = function() { return this.value; }

	return AbstractType;

})();

var JoinType = (function() {

	JoinType.prototype = Object.create(AbstractType.prototype);
	JoinType.prototype.constructor = JoinType;

	function JoinType(display, value) {
		AbstractType.call(this, display, value);
	}

	return JoinType;

})();

var MergeType = (function() {

	MergeType.prototype = Object.create(AbstractType.prototype);
	MergeType.prototype.constructor = MergeType;

	function MergeType(display, value) {
		AbstractType.call(this, display, value);

	}

	return MergeType;

})();

var AggregateType = (function() {

	AggregateType.prototype = Object.create(AbstractType.prototype);
	AggregateType.prototype.constructor = AggregateType;

	AggregateType.prototype.output;

	function AggregateType(display, value, output) {
		AbstractType.call(this, display, value);
		this.output = output;
	}

	AggregateType.prototype.getOutputType = function(input) {
		if(this.output) {
			return this.output;
		}
		else {
			return input;
		}
	}

	return AggregateType;

})();

var ComparisonType = (function() {

	ComparisonType.prototype = Object.create(AbstractType.prototype);
	ComparisonType.prototype.constructor = ComparisonType;

	function ComparisonType(display, value) {
		AbstractType.call(this, display, value);
	}

	return ComparisonType;

})();

var ConnectiveType = (function() {

	ConnectiveType.prototype = Object.create(AbstractType.prototype);
	ConnectiveType.prototype.constructor = ConnectiveType;

	function ConnectiveType(display, value) {
		AbstractType.call(this, display, value);
	}

	return ConnectiveType;

})();

function Resources() {}

Resources.comparisonTypes = [
	{
		display: '=',
		value: '='
	},
	{
		display: '!=',
		value: '<>'
	},
	{
		display: '>',
		value: '>'
	},
	{
		display: '<',
		value: '<'
	},
	{
		display: '>=',
		value: '>='
	},
	{
		display: '<=',
		value: '<='
	}
];

Resources.joinTypes = [
	{
		display: 'inner',
		value: 'INNER',
		join: true
	},
	{
		display: 'left',
		value: 'LEFT OUTER',
		join: true
	},
	{
		display: 'right',
		value: 'RIGHT OUTER',
		join: true
	},
	{
		display: 'full',
		value: 'FULL OUTER',
		join: true
	},
	{
		display: 'semi',
		value: 'EXISTS',
		join: false
	},
	{
		display: 'anti',
		value: 'NOT EXISTS',
		join: false
	}
];

Resources.mergeTypes = [
	{
		display: 'union',
		value: 'UNION'
	},
	{
		display: 'intersect',
		value: 'INTERSECT'
	},
	{
		display: 'difference',
		value: 'MINUS'
	}
];

Resources.aggregateTypes = [
	{
		display: 'group',
		value: 'GROUP' //not used
	},
	{
		display: 'max',
		value: 'MAX'
	},
	{
		display: 'min',
		value: 'MIN'
	},
	{
		display: 'avg',
		value: 'AVG',
		output: 'int'
	},
	{
		display: 'count',
		value: 'COUNT',
		output: 'int'
	},
	{
		display: 'sum',
		value: 'SUM',
		output: 'int'
	}
];

Resources.connectiveTypes = [
	{
		display: 'and',
		value: 'AND'
	},
	{
		display: 'or',
		value: 'OR'
	}
];