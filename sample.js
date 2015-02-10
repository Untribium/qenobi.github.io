var relations = [
	{
		id: 'schema-0',
		title: 'Sailors',
		attributes: [
			{
				id: 0,
				rel: 0,
				title: 'sid',
				type: 'int',
				unique: true
			},
			{
				id: 1,
				rel: 0,
				title: 'sname',
				type: 'string',
				unique: false
			},
			{
				id: 2,
				rel: 0,
				title: 'rating',
				type: 'int',
				unique: false
			},
			{
				id: 3,
				rel: 0,
				title: 'age',
				type: 'int',
				unique: false
			}
		]
	},
	{
		id: 'schema-1',
		title: 'Boats',
		attributes: [
			{
				id: 0,
				rel: 1,
				title: 'bid',
				type: 'int',
				unique: true
			},
			{
				id: 1,
				rel: 1,
				title: 'bname',
				type: 'int',
				unique: false
			},
			{
				id: 2,
				rel: 1,
				title: 'color',
				type: 'string',
				unique: false
			}
		]
	},
	{
		id: 'schema-2',
		title: 'Reserves',
		attributes: [
			{
				id: 0,
				rel: 2,
				title: 'sid',
				type: 'int',
				unique: false
			},
			{
				id: 1,
				rel: 2,
				title: 'bid',
				type: 'int',
				unique: false
			},
			{
				id: 2,
				rel: 2,
				title: 'day',
				type: 'int',
				unique: false
			}
		]
	}
];

var operators = [
	{
		id: 0,
		title: '='
	},
	{
		id: 1,
		title: '>'
	},
	{
		id: 2,
		title: '<'
	}
];

var aggregates = [
	{
		id: 0,
		title: 'MAX',
		input: {rows: 1, cols: 1},
		output: -1
	},
	{
		id: 1,
		title: 'MIN',
		input: {rows: 1, cols: 1},
		output: -1
	},
	{
		id: 2,
		title: 'AVG',
		input: {rows: 1, cols: 1},
		output: 'integer'
	},
	{
		id: 3,
		title: 'COUNT',
		input: {rows: 1, cols: 1},
		output: 'integer'
	},
	{
		id: 4,
		title: 'SUM',
		input: {rows: 1, cols: 1},
		output: 'integer'
	}
];

var aggregates_default = [
	{
		id: 0,
		title: 'Group By'
	},
	{
		id: 1,
		title: 'Drop'
	}
]