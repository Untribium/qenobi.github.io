function Sample() {}

Sample.schema = [
	{
		name: 'Sailors',
		attributes: [
			{
				name: 'sid',
				type: 'int',
				unique: true
			},
			{
				name: 'sname',
				type: 'string',
				unique: false
			},
			{
				name: 'rating',
				type: 'int',
				unique: false
			},
			{
				name: 'age',
				type: 'int',
				unique: false
			}
		]
	},
	{
		name: 'Boats',
		attributes: [
			{
				name: 'bid',
				type: 'int',
				unique: true
			},
			{
				name: 'bname',
				type: 'int',
				unique: false
			},
			{
				name: 'color',
				type: 'string',
				unique: false
			}
		]
	},
	{
		name: 'Reserves',
		attributes: [
			{
				name: 'sid',
				type: 'int',
				unique: false
			},
			{
				name: 'bid',
				type: 'int',
				unique: false
			},
			{
				name: 'day',
				type: 'int',
				unique: false
			}
		]
	}
];