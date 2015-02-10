/*Nodes*/

var Node = (function() {
	
	Node.prototype.id;
	Node.prototype.element;
	Node.prototype.title;

	Node.prototype.output;
	Node.prototype.parameters;

	Node.prototype.dependents;

	Node.prototype.trace;
	Node.prototype.schema;
	Node.prototype.query;

	function Node(id) {
		this.id = id;

		this.dependents = [];
		this.parameters = [];

		this.output = new Source(this);
	}

	Node.prototype.buildUI = function() {
		this.element = new UINode(this, this.title);
		this.element.setOutput(this.output.buildUI());

		for(var i = 0; i < this.parameters.length; i++) {
			this.element.append(this.parameters[i].buildUI());
		}

		this.notify();

		return this.element;
	}

	Node.prototype.getUI = function() {
		return this.element;
	}

	Node.prototype.getQuery = function() {
		return this.query;
	}

	Node.prototype.getSchema = function() {
		return this.schema;
	}

	Node.prototype.notify = function() {
		console.log('notify@Node:');
		console.log(this);
		
		this.update();

		for(var i = 0; i < this.dependents.length; i++) {
			this.dependents[i].notify();
		}
	}

	Node.prototype.update = function() {
		if(this.element) {
			this.element.update();
		}
	};

	Node.prototype.remove = function() {
		if(confirm('Do you really want to remove this node?')){
			console.log('remove@node_'+this.id)
			for(var i = 0; i < this.parameters.length; i++) {
				this.parameters[i].detachAll();
			}
			this.output.detachAll();
			if(this.getUI()) {
				this.getUI().remove();
			}
		}
	}

	Node.prototype.addDependent = function(dependent) {
		this.dependents.push(dependent);
	}

	Node.prototype.removeDependent = function(dependent) {
		for(var i = 0; i < this.dependents.length; i++) {
			if(this.dependents[i] == dependent) {
				this.dependents.splice(i, 1);
			}
		}
	}

	return Node;

})();


var Constraint = (function() {
	
	Constraint.prototype = Object.create(Node.prototype);
	Constraint.prototype.constructor = Constraint;

	Constraint.prototype.relation1;
	Constraint.prototype.attribute1;
	Constraint.prototype.comparison;
	Constraint.prototype.relation2;
	Constraint.prototype.attribute2;

	function Constraint(id) {
		Node.call(this, id);

		this.title = 'Constraint';

		//Parameter 1
		this.relation1 = new Relation(this, UILabel);
		this.parameters.push(this.relation1);
		this.attribute1 = new Attribute(this);
		this.attribute1.setRelation(this.relation1);
		this.parameters.push(this.attribute1);

		//Comparison
		this.comparison = new Comparison(this);
		this.parameters.push(this.comparison);

		//Parameter 2
		this.relation2 = new Relation(this, UIConstant);
		this.parameters.push(this.relation2);
		this.attribute2 = new Attribute(this);
		this.attribute2.setRelation(this.relation2);
		this.parameters.push(this.attribute2);
	}

	Constraint.prototype.update = function() {
		Node.prototype.update.call(this);

		if(this.relation1.getValue() && this.relation2.getValue()) {
			var rel = {
				id: 'node-'+this.id,
				title: this.relation1.getValue().title+'*'+this.relation2.getValue().title,
				attributes: this.relation1.getValue().attributes.concat(this.relation2.getValue().attributes)
			}

			this.output.setValue(rel);
		}
	}

	return Constraint;

})();


var Table = (function() {
	
	Table.prototype = Object.create(Node.prototype);
	Table.prototype.constructor = Table;

	Table.prototype.relation;

	function Table(id) {
		Node.call(this, id);

		this.title = 'Table';

		this.relation = new Selection(this, 'Relation');
		this.relation.setOptions(relations);
		this.parameters.push(this.relation);
	}

	Table.prototype.update = function() {
		Node.prototype.update.call(this);
		
		/*if(this.relation.getValue()){
			var rel = this.relation.getValue();
			rel.id = this.id;
			for(var i = 0; i < rel.attributes.length; i++) {
				rel.attributes[i].rel = this.id;
			}

			this.output.setValue(rel);
		}*/

		this.output.setValue(this.relation.getValue());
	}

	return Table;

})();


var Aggregation = (function() {

	Aggregation.prototype = Object.create(Node.prototype);
	Aggregation.prototype.constructor = Aggregation;

	Aggregation.prototype.relation;
	Aggregation.prototype.attribute;
	Aggregation.prototype.aggregate;

	function Aggregation(id) {
		Node.call(this, id);

		this.title = 'Aggregation';

		this.relation = new Relation(this, UILabel);
		this.parameters.push(this.relation);

		this.attribute = new Attribute(this);
		this.attribute.setRelation(this.relation);
		this.parameters.push(this.attribute);

		this.aggregate = new Aggregate(this);
		this.aggregate.setAttribute(this.attribute);
		this.parameters.push(this.aggregate);

		this.agg_default = new Selection(this, 'Default');
		this.agg_default.setOptions(aggregates_default);
		this.parameters.push(this.agg_default);
	}

	return Aggregation;

})();


var Output = (function() {

	Output.prototype = Object.create(Node.prototype);
	Output.prototype.constructor = Output;

	Output.prototype.relation;

	function Output(id) {
		Node.call(this, id);

		this.title = 'Output';

		this.relation = new Relation(this, UILabel);
		this.parameters.push(this.relation);
	}

	return Output;

})();