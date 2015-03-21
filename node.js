
/*Nodes*/

var Node = (function() {
	
	Node.prototype.id;
	Node.prototype.element;
	Node.prototype.title;
	Node.prototype.removable;

	Node.prototype.output;
	Node.prototype.parameters;

	Node.prototype.dependents;

	Node.prototype.trace;
	Node.prototype.query;
	Node.prototype.value;

	function Node(id, removable) {
		this.id = id;
		this.removable = removable == undefined ? true : removable;

		this.dependents = [];
		this.parameters = [];
	}

	Node.prototype.buildUI = function() {
		this.element = new UINode(this, this.title, this.removable);
		if(this.output) {
			this.element.setOutput(this.output.buildUI());
		}

		for(var i = 0; i < this.parameters.length; i++) {
			this.element.addParameter(this.parameters[i].buildUI());
		}

		this.notify();

		return this.element;
	}

	Node.prototype.getUI = function() {
		return this.element;
	}

	Node.prototype.getID = function() {
		return this.id;
	}

	Node.prototype.getValue = function() {
		return this.value;
	}

	Node.prototype.getQuery = function() {
		return this.query;
	}

	Node.prototype.notify = function() {
		console.log('notify@Node:\t\t', this);
		
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
		if(this.removable && confirm('Do you really want to remove this node?')){
			console.log('remove@Node:\t\t', this);

			for(var i = 0; i < this.parameters.length; i++) {
				this.parameters[i].detachAll();
			}

			if(this.output) {
				this.output.detachAll();
			}

			if(this.element) {
				this.element.remove();
			}
		}
	}

	//add Parameter at index (optional)
	Node.prototype.addParameter = function(parameter, index) {
		this.parameters.splice(index || this.parameters.length, 0, parameter);

		for(var i = 0; i < this.parameters.length; i++) {
			this.parameters[i].setID(i);
		}

		if(this.element) {
			this.element.addParameter(parameter.buildUI(), index);
		}
	}

	Node.prototype.removeParameter = function(parameter) {
		for(var i = this.parameters.length-1; i >= 0; i--) {
			if(this.parameters[i] == parameter) {

				this.parameters.splice(i, 1);
				parameter.detachAll();

				if(this.element) {
					this.element.removeParameter(parameter.element);
				}

				for(var j = 0; j < parameter.dependents.length; j++) {
					if(parameter.dependents[j] instanceof Parameter) {
						this.removeParameter(parameter.dependents[j]);
					}
				}
			}
		}
	}

	Node.prototype.addDependent = function(dependent) {
		this.dependents.push(dependent);
	}

	Node.prototype.removeDependent = function(dependent) {
		this.dependents.remove(dependent);
	}

	return Node;

})();


var Table = (function() {
	
	Table.prototype = Object.create(Node.prototype);
	Table.prototype.constructor = Table;

	Table.prototype.relation;

	function Table(id) {
		Node.call(this, id, true);

		this.title = 'Table (t'+this.id+')';

		this.output = new Source(this);

		this.query = new Query();

		this.relation = new PTable(this);
		this.addParameter(this.relation);
	}

	Table.prototype.update = function() {
		Node.prototype.update.call(this);

		var rel = this.relation.getValue().clone();
		rel.setAlias('t'+this.id);

		this.query = new Query(rel, null);
		this.query.setCardinality('t'+this.id);
	}

	return Table;

})();


var Constraint = (function() {
	
	Constraint.prototype = Object.create(Node.prototype);
	Constraint.prototype.constructor = Constraint;

	Constraint.prototype.relation1;
	Constraint.prototype.attribute1;
	Constraint.prototype.comparison;
	Constraint.prototype.relation2;
	Constraint.prototype.attribute2;
	Constraint.prototype.join;

	function Constraint(id) {
		Node.call(this, id, true);

		this.title = 'Constraint';

		this.output = new Source(this);

		//Parameter 1
		this.relation1 = new PRelation(this, UILabel);
		this.addParameter(this.relation1);

		this.attribute1 = new PAttribute(this, true);
		this.attribute1.setRelation(this.relation1);
		this.addParameter(this.attribute1);

		//Comparison
		this.comparison = new PComparison(this);
		this.addParameter(this.comparison);

		//Parameter 2
		this.relation2 = new PRelation(this, UIRelation);
		this.addParameter(this.relation2);

		this.attribute2 = new PAttribute(this, true);
		this.attribute2.setRelation(this.relation2);
		this.addParameter(this.attribute2);

		//Join
		this.join = new PJoin(this);
		this.addParameter(this.join);
	}

	Constraint.prototype.update = function() {
		Node.prototype.update.call(this);

		if(this.relation1.getQuery() && this.relation2.getQuery()) {

			this.query = new Query();

			var q1 = this.relation1.getQuery();
			var q2 = this.relation2.getQuery();

			var a1 = this.attribute1.getValue();
			var a2 = this.attribute2.getValue();

			var cop = this.comparison.getValue();
			var jop = this.join.getValue();

			if(a1 && a2) {
				var c = new Comparison(a1, a2, cop);

				var r, w;
				
				if(q1.getCardinality() != q2.getCardinality() && q2.getCardinality() != 1) {
					this.join.setVisible(true);

					r = new Join(q1.getRelation().clone(), q2.getRelation().clone(), jop, c);

					var q1_a = q1.getAttributes();
					var q2_a = q2.getAttributes();

					//resolve name clashes (proof of concept)
					for(var i = 0; i < q2_a.length; i++) {
						for(var j = 0; j < q1_a.length; j++) {
							if(q2_a[i].getName() == q1_a[j].getName()) {
								q2_a[i].setAlias(q2_a[i].getRelation().getAlias()+'_a'+i);
								q2_a[i].setDisplay(q2_a[i].getRelation().getAlias()+'.'+q2_a[i].getName());
								console.log(q1_a[j]);
								q1_a[j].setDisplay(q1_a[j].getRelation().getAlias()+'.'+q1_a[j].getName());
								this.attribute1.update();
								this.attribute2.update();
							}
						}
					}

					if(q1.getCondition() && q2.getCondition()) {
						w = new Connective(q1.getCondition(), q2.getCondition(), Config.connectiveTypes[0]);
					}
					else {
						w = q1.getCondition() || q2.getCondition();
					}
				}
				else {
					this.join.setVisible(false);

					r = q1.getRelation().clone();

					if(q1.getCondition()) {
						w = new Connective(q1.getCondition(), c, Config.connectiveTypes[0]);
					}
					else {
						w = c;
					}
				}

				this.query.setRelation(r);
				this.query.setCondition(w);

				this.query.setCardinality('t'+this.id);
			}
			else {
				this.query = null;
			}
		}
		else {
			this.join.setVisible(false);
			this.query = null;
		}
	}

	return Constraint;

})();


var Aggregation = (function() {

	Aggregation.prototype = Object.create(Node.prototype);
	Aggregation.prototype.constructor = Aggregation;

	Aggregation.prototype.relation;
	Aggregation.prototype.aggregates;

	function Aggregation(id) {
		Node.call(this, id, true);

		this.title = 'Select';

		this.output = new Source(this);

		this.aggregates = [];

		this.relation = new PRelation(this, UILabel);
		this.addParameter(this.relation);
	}

	Aggregation.prototype.addAttribute = function() {
		var attribute = new PAttribute(this, false);
		attribute.setRelation(this.relation);
		var aggregate = new PAggregate(this);
		aggregate.setAttribute(attribute);

		this.aggregates.push(aggregate);

		this.addParameter(attribute);
		this.addParameter(aggregate);
	}

	Aggregation.prototype.update = function() {
		Node.prototype.update.call(this);

		if(this.relation.getQuery()) {
			//remove empty parameters
			for(var i = this.aggregates.length-2; i >= 0; i--) {
				console.log(this.aggregates[i].getAttribute().getValue());
				if(!this.aggregates[i].getAttribute().getValue()) {
					this.removeParameter(this.aggregates.splice(i, 1)[0].getAttribute());
				}
				else {
					this.aggregates[i].setVisible(true);
				}
			}

			//if list empty or last element set, add new attribute
			if(!this.aggregates.length || this.aggregates.peek().getAttribute().getValue()) {
				this.addAttribute();
				this.aggregates.peek().setVisible(false);
			}

			var query = this.relation.getQuery().clone();

			var agg = false;
			var groupBy = [];

			for(var i = 0; i < this.aggregates.length; i++) {
				var attribute = this.aggregates[i].getAttribute().getValue();
				var type = this.aggregates[i].getValue();
				if(attribute) {
					if(type.getValue() != 'GROUP') {
						agg = true;
						query.projection.push(new Aggregate(attribute, type, 'a'+i));
					}
					else {
						query.projection.push(attribute);
						groupBy.push(attribute);
					}
				}
			}

			//only set GroupBy if there is an aggregation in the projection
			if(agg) {
				query.groupBy = groupBy;
			}

			this.query = new Query(new Subquery(query, 't'+this.id));
		}
		//remove all aggregates if no relation connected
		else {
			while(this.aggregates.length) {
				this.removeParameter(this.aggregates.pop().getAttribute());
			}

			this.query = undefined;
		}
	}

	return Aggregation;

})();


var Merge = (function() {

	Merge.prototype = Object.create(Node.prototype);
	Merge.prototype.constructor = Merge;

	Merge.prototype.relations;

	Merge.prototype.schema;

	function Merge(id) {
		Node.call(this, id, true)

		this.title = 'Merge';

		this.output = new Source(this);

		this.relations = [];

		this.type = new PMerge(this);
		this.addParameter(this.type);

		this.addRelation();
	}

	Merge.prototype.addRelation = function() {
		var relation = new PRelation(this, UILabel);

		this.relations.push(relation);

		this.addParameter(relation);
	}

	Merge.prototype.update = function() {
		Node.prototype.update.call(this);

		for(var i = this.relations.length-2; i >= 0; i--) {

			if(!this.relations[i].isConnected()) {
				console.log('remove ', this.relations[i]);
				var relation = this.relations[i];

				//this.removeParameter(relation); //doesn't work, presumably bug in jsPlumb
				relation.setVisible(false);

				this.relations.splice(i, 1);

				if(this.element) {
					this.element.update();
				}
			}
		}

		if(this.relations.peek().getQuery()) {
			this.addRelation();
		}

		this.query = null;

		for(var i = 0; i < this.relations.length; i++) {
			if(this.relations[i].getQuery()) {
				if(this.query) {
					var set = new Set(this.query, this.relations[i].getQuery(), this.type.getValue());
					this.query = new Query(new Subquery(set, 't'+this.id));
				}
				else {
					this.query = this.relations[i].getQuery();
				}
			}
		}
	}

	return Merge;

})();


var Rename = (function() {

	Rename.prototype = Object.create(Node.prototype);
	Rename.prototype.constructor = Rename;

	Rename.prototype.relation;
	Rename.prototype.attribute;
	Rename.prototype.name;

	function Rename(id) {
		Node.call(this, id, true);

		this.title = 'Rename';

		this.output = new Source(this);

		this.relation = new PRelation(this, UILabel);
		this.addParameter(this.relation);

		this.attribute = new PAttribute(this, true);
		this.attribute.setRelation(this.relation);
		this.addParameter(this.attribute);

		this.name = new PConstant(this);
		this.addParameter(this.name);
	}

	Rename.prototype.update = function() {
		var attr = this.attribute.getValue();
		if(this.relation.getQuery() && attr) {
			this.query = this.relation.getQuery().clone();

			var attrs = this.query.getRelation().getAttributes();

			for(var i = 0; i < attrs.length; i++) {
				if(attrs[i].getDisplay() == attr.getDisplay()) {
					attrs[i].setAlias(this.name.getValue());
					attrs[i].setDisplay(this.name.getValue());
				}
			}
		}
	}

	return Rename;

})();


var Output = (function() {

	Output.prototype = Object.create(Node.prototype);
	Output.prototype.constructor = Output;

	Output.prototype.relation;

	function Output(id) {
		Node.call(this, id, false);

		this.title = 'Output';

		this.relation = new PRelation(this, UILabel);
		this.addParameter(this.relation);
	}

	Output.prototype.update = function() {
		if(this.relation.getQuery()) {
			Util.setOutput(this.relation.getQuery().getQuery(0)+';');
		}
		else {
			Util.setOutput('');
		}
	}

	return Output;

})();

