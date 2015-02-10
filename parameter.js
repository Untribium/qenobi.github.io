/*Parameters*/

var Parameter = (function() {

	Parameter.prototype.element;

	Parameter.prototype.value;

	Parameter.prototype.parent;
	Parameter.prototype.title;
	Parameter.prototype.trace;

	Parameter.prototype.dependents;

	Parameter.prototype.input;
	Parameter.prototype.output;
	// Parameter.prototype.uitype;

	function Parameter(parent, title) {
		this.parent = parent;
		this.title = title;

		this.dependents = [];
		this.trace = [];

		this.value = null;

		this.addDependent(this.parent);
	}

	Parameter.prototype.buildUI = function() {
		/*this.element = new this.uitype(this, this.title);

		if(this.input) {
			this.element.setInput(this.input.buildUI());
		}
		if(this.output) {
			this.element.setOutput(this.output.buildUI());
		}

		// handle options

		this.notify();

		return this.element;*/
	}

	Parameter.prototype.getUI = function() {
		return this.element;
	}

	Parameter.prototype.getValue = function() {
		return this.value;
	}

	Parameter.prototype.notify = function() {
		console.log('notify@Parameter:');
		console.log(this);

		this.update();

		for(var i = 0; i < this.dependents.length; i++) {
			this.dependents[i].notify();
		}
	}

	Parameter.prototype.update = function() {
		if(this.input && this.input.isConnected()) {
			this.value = this.input.getValue();
		}
		else if(this.element) {
			this.value = this.element.getValue();
		}

		if(this.input && this.element) {
			this.element.setConnected(this.input.isConnected());
		}
	}

	Parameter.prototype.detachAll = function() {
		if(this.input) {
			this.input.detachAll();
		}
		if(this.output){
			this.output.detachAll()
		}
	}

	Parameter.prototype.addDependent = function(parameter) {
		this.dependents.push(parameter);
	}

	return Parameter;
	
})();


var Relation = (function() {

	Relation.prototype = Object.create(Parameter.prototype);
	Relation.prototype.constructor = Relation;

	//show input
	Relation.prototype.uitype;

	function Relation(parent, uitype) {
		Parameter.call(this, parent, 'Relation');

		this.uitype = uitype;
		this.attributes = [];

		this.input = new Target(this);
	}

	Relation.prototype.buildUI = function() {
		this.element = new this.uitype(this, this.title);

		this.element.setInput(this.input.buildUI());

		this.notify();

		return this.element;
	}

	return Relation;

})();


var Selection = (function() {

	Selection.prototype = Object.create(Parameter.prototype);
	Selection.prototype.constructor = Selection;

	Selection.prototype.options;

	function Selection(parent, title) {
		Parameter.call(this, parent, title);

		this.options = [];

		this.input = new Target(this);
	}

	Selection.prototype.buildUI = function() {
		this.element = new UISelection(this, this.title);
		this.element.setInput(this.input.buildUI());

		this.element.setOptions(this.options);

		this.notify();

		return this.element;
	}

	Selection.prototype.getOptions = function() {
		return this.options;
	}

	Selection.prototype.setOptions = function(options) {
		this.options = options;
		if(this.element) {
			this.element.setOptions(this.options);
		}
		this.value = this.options[0];
	}

	Selection.prototype.clearOptions = function() {
		this.setOptions([]);
	}

	return Selection;

})();


var Attribute = (function() {

	Attribute.prototype = Object.create(Selection.prototype);
	Attribute.prototype.constructor = Attribute;

	Attribute.prototype.relation;

	function Attribute(parent) {
		Selection.call(this, parent, 'Attribute');
	}

	Attribute.prototype.setRelation = function(relation) {
		this.relation = relation;
		this.relation.addDependent(this);
		this.notify();
	}

	Attribute.prototype.update = function() {
		console.log('update@Attribute');
		console.log(this.relation);
		if(this.relation && this.relation.getValue()) {
			this.setOptions(this.relation.getValue().attributes);
			if(this.element) {
				this.element.setVisible(true);
			}
		}
		else if(this.element) {
			this.clearOptions();
			this.element.setVisible(false);
		}

		Parameter.prototype.update.call(this);
	}

	return Attribute;

})();


var Aggregate = (function() {

	Aggregate.prototype = Object.create(Selection.prototype);
	Aggregate.prototype.constructor = Aggregate;

	Aggregate.prototype.attribute;

	function Aggregate(parent) {
		Selection.call(this, parent, 'Aggregate');
		this.setOptions(aggregates);
	}

	Aggregate.prototype.setAttribute = function(attribute) {
		this.attribute = attribute;
		this.attribute.addDependent(this);
		this.notify();
	}

	Aggregate.prototype.update = function() {
		if(this.element) {
			this.element.setVisible(this.attribute.getValue());
		}
	}

	return Aggregate;

})();


var Comparison = (function() {

	Comparison.prototype = Object.create(Selection.prototype);
	Comparison.prototype.constructor = Comparison;

	function Comparison(parent) {
		Selection.call(this, parent, 'Comparison');
		this.setOptions(operators);
	}

	return Comparison;

})();


var Label = (function() {

	Label.prototype = Object.create(Parameter.prototype);
	Label.prototype.constructor = Label;

	function Label(parent, title) {
		Parameter.call(this, parent, title);

		this.input = new Target();
	}

	Label.prototype.buildUI = function() {
		this.element = new UILabel(this);
		this.element.setInput(this.input.buildUI());

		this.notify();

		return this.element;
	}

	return Label;

})();