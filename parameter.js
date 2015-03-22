
/*Parameters*/

var Parameter = (function() {

	Parameter.prototype.id;
	Parameter.prototype.element;

	Parameter.prototype.scope;
	Parameter.prototype.value;
	Parameter.prototype.query;

	Parameter.prototype.uitype;
	Parameter.prototype.required;

	Parameter.prototype.parent;
	Parameter.prototype.title;

	Parameter.prototype.dependencies;
	Parameter.prototype.dependents;

	Parameter.prototype.satisfied;

	Parameter.prototype.input;
	Parameter.prototype.output;

	function Parameter(parent, title, uitype, required) {
		this.parent = parent;
		this.title = title;

		this.uitype = uitype;
		this.required = required;

		this.dependencies = [];
		this.dependents = [];
		this.trace = [];

		this.value = null;

		this.addDependent(this.parent);
	}

	Parameter.prototype.buildUI = function() {
		this.element = new this.uitype(this, this.title);

		if(this.input) {
			this.element.setInput(this.input.buildUI());
		}
		if(this.output) {
			this.element.setOutput(this.output.buildUI());
		}

		this.notify();

		return this.element;
	}

	Parameter.prototype.getUI = function() {
		return this.element;
	}

	Parameter.prototype.getValue = function() {
		return this.value;
	}

	Parameter.prototype.getQuery = function() {
		return this.query;
	}

	Parameter.prototype.setScope = function(scope) {
		this.scope = scope;
	}

	Parameter.prototype.setID = function(id) {
		this.id = id;
	}

	Parameter.prototype.isConnected = function() {
		if(this.input) {
			return this.input.isConnected();
		}
		else {
			return false;
		}
	}

	Parameter.prototype.setVisible = function(flag) {
		if(this.element) {
			this.element.setVisible(flag);
		}
	}

	Parameter.prototype.notify = function() {
		console.log('notify@Parameter:\t', this);

		this.update();

		for(var i = 0; i < this.dependents.length; i++) {
			this.dependents[i].notify();
		}
	}

	Parameter.prototype.update = function() {
		this.checkDependencies();

		if(this.isConnected()) {
			this.value = this.input.getValue();
			this.query = this.input.getQuery();
		}
		else if(this.element && this.element.getValue()) {
			this.value = this.element.getValue();
			this.query = this.element.getValue();
		}
		else {
			this.value = undefined;
			this.query = undefined;
		}

		if(this.input && this.element) {
			this.element.setConnected(this.isConnected());
		}
	}

	Parameter.prototype.checkDependencies = function() {
		var satisfied = true;

		for(var i = 0; i < this.dependencies.length; i++) {
			satisfied = this.satisfied && Boolean(this.dependencies[i].getValue());
		}

		/*if(this.element) {
			this.element.setVisible(satisfied);
		}*/

		return satisfied;
	}

	Parameter.prototype.detachAll = function() {
		if(this.input) {
			this.input.detachAll();
		}
		if(this.output){
			this.output.detachAll();
		}
	}

	//two way, only for parameters
	Parameter.prototype.addDependency = function(dependency) {
		this.dependencies.push(dependency);
		dependency.addDependent(this);
	}

	//two way, only for parameters
	Parameter.prototype.removeDependency = function(dependency) {
		for(var i = 0; i < this.dependencies.length; i++) {
			if(this.dependencies[i] == dependency) {
				this.dependencies.splice(i, 1);
				dependency.removeDependent(this);
			}
		}
	}

	//only one way!
	Parameter.prototype.addDependent = function(dependent) {
		this.dependents.push(dependent);
	}

	//only one way!
	Parameter.prototype.removeDependent = function(dependent) {
		for(var i = 0; i < this.dependents.length; i++) {
			if(this.dependents[i] == dependent) {
				this.dependents.splice(i, 1);
			}
		}
	}

	return Parameter;
	
})();


var PRelation = (function() {

	PRelation.prototype = Object.create(Parameter.prototype);
	PRelation.prototype.constructor = PRelation;

	function PRelation(parent, uitype) {
		Parameter.call(this, parent, 'Relation', uitype, true);

		this.uitype = uitype;

		this.input = new Target(this);
	}

	return PRelation;

})();


var PSelection = (function() {

	PSelection.prototype = Object.create(Parameter.prototype);
	PSelection.prototype.constructor = PSelection;

	PSelection.prototype.options;

	function PSelection(parent, title, required) {
		Parameter.call(this, parent, title, UISelection, required);

		this.options = [];
	}

	PSelection.prototype.buildUI = function() {
		this.element = new UISelection(this, this.title, this.required);

		this.element.setOptions(this.options);

		this.notify();

		return this.element;
	}

	PSelection.prototype.getOptions = function() {
		return this.options;
	}

	PSelection.prototype.setOptions = function(options) {
		this.options = options;
		if(this.element) {
			this.element.setOptions(this.options);
			if(this.options.length <= 1) {
				this.element.setVisible(false);
			}
			else {
				this.element.setVisible(true);
			}
		}
	}

	PSelection.prototype.addOption = function(option) {
		this.options.push(option);
		if(this.element) {
			this.element.addOption(option);
		}
	}

	PSelection.prototype.clearOptions = function() {
		this.setOptions([]);
	}

	PSelection.prototype.update = function() {
		if(this.element) {
			this.element.setOptions(this.options);
		}

		Parameter.prototype.update.call(this);
	}

	return PSelection;

})();


var PAttribute = (function() {

	PAttribute.prototype = Object.create(PSelection.prototype);
	PAttribute.prototype.constructor = PAttribute;

	PAttribute.prototype.relation;

	function PAttribute(parent, required) {
		PSelection.call(this, parent, 'Attribute', required);
	}

	PAttribute.prototype.setRelation = function(relation) {
		this.relation = relation;
		this.addDependency(this.relation);
	}

	PAttribute.prototype.getRelation = function() {
		return this.relation;
	}

	PAttribute.prototype.update = function() {
		if(this.relation && this.relation.getQuery()) {
			this.setOptions(this.relation.getQuery().getAttributes());
		}
		else {
			this.clearOptions();
		}

		//Parameter.prototype.update.call(this);

		if(this.element && this.element.getValue()) {
			this.value = this.element.getValue();
		}
	}

	return PAttribute;

})();


var PAggregate = (function() {

	PAggregate.prototype = Object.create(PSelection.prototype);
	PAggregate.prototype.constructor = PAggregate;

	PAggregate.prototype.attribute;

	function PAggregate(parent) {
		PSelection.call(this, parent, 'Aggregate', true);
		this.setOptions(Config.aggregateTypes);
	}

	PAggregate.prototype.setAttribute = function(attribute) {
		this.attribute = attribute;
		this.addDependency(this.attribute);
	}

	PAggregate.prototype.getAttribute = function() {
		return this.attribute;
	}

	return PAggregate;

})();


var PComparison = (function() {

	PComparison.prototype = Object.create(PSelection.prototype);
	PComparison.prototype.constructor = PComparison;

	function PComparison(parent) {
		PSelection.call(this, parent, 'Comparison', true);
		this.setOptions(Config.comparisonTypes);
	}

	return PComparison;

})();


var PTable = (function() {

	PTable.prototype = Object.create(PSelection.prototype);
	PTable.prototype.constructor = PTable;

	function PTable(parent) {
		PSelection.call(this, parent, 'Relation', true);

		this.setOptions(Config.schema);
	}

	return PTable;

})();


var PJoin = (function() {

	PJoin.prototype = Object.create(PSelection.prototype);
	PJoin.prototype.constructor = PJoin;

	function PJoin(parent) {
		PSelection.call(this, parent, 'Type', true);
		this.setOptions(Config.joinTypes);
	}

	return PJoin;

})();


var PMerge = (function() {

	PMerge.prototype = Object.create(PSelection.prototype);
	PMerge.prototype.constructor = PMerge;

	function PMerge(parent) {
		PSelection.call(this, parent, 'Type', true);
		this.setOptions(Config.mergeTypes);
	}

	return PMerge;

})();


var PConstant = (function() {

	PConstant.prototype = Object.create(Parameter.prototype);
	PConstant.prototype.constructor = PConstant;

	function PConstant(parent) {
		Parameter.call(this, parent, 'Constant', UIConstant, true);

		//this.input = new Target(this);
	}

	return PConstant;

})();