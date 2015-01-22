var Node = (function() {
	
	function Node(id) {
		this.id = id;
		this.element;
		this.title;

		//set of all nodes on paths from input to this node (used to avoid circular dependencies)
		this.trace;
		//set of all attributes in the output relation
		this.attributes;
		//number of rows (any, single or specific (for conditions on same relation))
		this.cardinality;

		this.init();

		this.createElement();
	}

	/*override in subclass*/
	Node.prototype.init = function() {
		concole.log("'init' not overwritten");
	}

	Node.prototype.createElement = function() {
		this.createNode();
		this.createHeader();
		this.createSettings();
		this.createContent();
	}

	Node.prototype.createNode = function() {
		this.element = document.createElement("div");
		addClass(this.element, "node");
		this.element.id = "node_"+this.id;
	}

	Node.prototype.createHeader = function() {
		var el_header = document.createElement("div");
		addClass(el_header, "node-header");

		var el_title = document.createElement("p");
		el_title.innerHTML = this.title;
		addClass(el_title, "no-select");
		el_header.appendChild(el_title);

		var el_source = document.createElement("div");
		addClass(el_source, "endpoint");
		el_header.appendChild(el_source);

		instance.makeSource(el_source, {
			anchor:"Right",
			endpoint:"Blank",
			maxConnections:3
		});

		var el_settings = getIcon("cog");
		el_settings.addEventListener("click", this.toggleSettings.bind(this));
		el_header.appendChild(el_settings);

		this.element.appendChild(el_header);
	}

	Node.prototype.createSettings = function() {
		var el_settings = document.createElement("div");
		addClass(el_settings, "node-settings");
		this.element.appendChild(el_settings);
	}

	/*override in subclass*/
	Node.prototype.createContent = function() {
		console.log("'createContent' not overwritten");
	}

	Node.prototype.toggleSettings = function() {
		toggleClass(this.element.querySelector(".node-settings"), "hidden");
	}

	return Node;

})();

var Relation = (function() {
	
	Relation.prototype = Object.create(Node.prototype);
	Relation.prototype.constructor = Relation;

	function Relation(id) {
		//super
		Node.call(this, id);
	}

	Relation.prototype.init = function() {
		this.title = "Relation";
	}

	Relation.prototype.createContent = function() {
		var el_content = document.createElement("div");
		addClass(el_content, "node-content");

		var input = new Input();
		el_content.appendChild(input.element);

		var input2 = new Input();
		el_content.appendChild(input2.element);		

		this.element.appendChild(el_content);

	}

	return Relation;

})();

var Condition = (function() {
	
	Condition.prototype = Object.create(Node.prototype);
	Condition.prototype.constructor = Condition;

	function Condition(id) {
		//super
		Node.call(this, id);
	}

	Condition.prototype.init = function() {
		this.title = "Condition";
	}

	return Condition;

})();


/*---TYPES--*/

var Input = (function() {
	
	function Input() {
		this.element;
		this.target;
		this.type;

		this.createElement();
	}

	Input.prototype.createElement = function() {
		this.element = document.createElement("div");
		addClass(this.element, "input");

		var el_target = document.createElement("div");
		addClass(el_target, "endpoint");
		this.element.appendChild(el_target);

		instance.makeTarget(el_target, {
			anchor: "Left",
			endpoint:"Blank", 
			paintStyle:{ fillStyle:"gray" },
			maxConnections: 1,
			beforeDrop: function(p) {console.log(p.sourceId); return true;}
		});

		var el_select = document.createElement("select");
		el_select.add(new Option("test1", "value1", false, false));
		el_select.add(new Option("test2", "value2", true, true));
		el_select.add(new Option("test3", "value3", false, undefined));

		var el_constant = document.createElement("input");

		this.element.appendChild(el_select);
		this.element.appendChild(el_constant);
	}

	return Input;

})();