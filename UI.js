
/*UI Elements*/

var UINode = (function() {

	UINode.prototype.element;
	UINode.prototype.header;
	UINode.prototype.content;

	UINode.prototype.title;
	UINode.prototype.parameters;

	UINode.prototype.removable;

	UINode.prototype.parent;

	function UINode(parent, title, removable) {
		this.title = title;
		this.parent = parent;
		this.removable = removable == undefined ? true : removable;
		this.parameters = [];

		this.buildElement();
	}

	UINode.prototype.buildElement = function() {
		this.element = Util.getDiv('node');

		this.element.reference = this.parent;

		this.buildHeader();
		this.buildContent();

		Util.getInstance().draggable(this.element);
	}

	UINode.prototype.buildHeader = function() {
		this.header = Util.getDiv('header');

		this.paragraph = Util.getParagraph(this.title);
		this.header.appendChild(this.paragraph);

		if(this.removable) {
			this.trash = Util.getIcon('trash');
			this.trash.addEventListener('click', Node.prototype.remove.bind(this.parent));
			this.header.appendChild(this.trash);
		}

		this.element.appendChild(this.header);
	}

	UINode.prototype.buildContent = function() {
		this.content = Util.getDiv('content');
		this.element.appendChild(this.content);
	}

	UINode.prototype.addParameter = function(uiparameter, index) {
		index = index < 0 ? this.parameters.length+index : index;
		if(!index || index == this.parameters.length) {
			this.content.appendChild(uiparameter.getElement());
			this.parameters.push(uiparameter);
		}
		else {
			this.content.insertBefore(uiparameter.getElement(), this.parameters[index].getElement());
			this.parameters.splice(index, 0, uiparameter);
		}
	}

	UINode.prototype.removeParameter = function(uiparameter) {
		this.parameters.remove(uiparameter);

		this.content.removeChild(uiparameter.getElement());
	}

	UINode.prototype.setOutput = function(uiendpoint) {
		this.header.insertBefore(uiendpoint.getElement(), this.trash);
	}

	UINode.prototype.getElement = function() {
		return this.element;
	}

	UINode.prototype.update = function() {
		Util.getInstance().revalidate(this.element);
		Util.getInstance().recalculateOffsets(this.element);
		Util.getInstance().repaint(this.element);
	}

	UINode.prototype.remove = function() {
		Util.getContainer().removeChild(this.element);
	}

	return UINode;

})();


var UIEndpoint = (function() {

	UIEndpoint.prototype.element;
	
	UIEndpoint.prototype.type;
	UIEndpoint.prototype.parent;

	function UIEndpoint(parent, type) {
		this.parent = parent;
		this.type = type;

		this.buildElement();
	}

	UIEndpoint.prototype.buildElement = function() {
		this.element = Util.getDiv(this.type);

		Util.makeEndpoint(this.element, this.type);

		this.element.reference = this.parent;

		return this.element;
	}

	UIEndpoint.prototype.getElement = function() {
		return this.element;
	}

	UIEndpoint.prototype.detachAll = function() {
		Util.getInstance().detachAllConnections(this.element, {fireEvent: false});
	}

	return UIEndpoint;

})();


var UIParameter = (function() {

	UIParameter.prototype.element;
	UIParameter.prototype.span;
	UIParameter.prototype.uielement;
	UIParameter.prototype.visible;

	UIParameter.prototype.title;
	UIParameter.prototype.connected;

	UIParameter.prototype.required;

	UIParameter.prototype.target;
	UIParameter.prototype.source;

	UIParameter.prototype.input;
	UIParameter.prototype.output;

	UIParameter.prototype.parent;

	function UIParameter(parent, title, required) {
		this.parent = parent;
		this.title = title;

		this.required = required;

		this.buildElement();

		this.setVisible(true);
	}

	UIParameter.prototype.buildElement = function() {
		this.element = Util.getDiv('parameter');

		this.span = Util.getSpan();

		this.paragraph = Util.getParagraph(this.title);
		this.paragraph.addClass('title');
		this.span.appendChild(this.paragraph);

		this.element.appendChild(this.span);

		this.element.reference = this.parent;
	}

	UIParameter.prototype.getElement = function() { return this.element; }

	UIParameter.prototype.getContent = function() {	return null; }

	UIParameter.prototype.setInput = function(uiendpoint) {
		this.input = uiendpoint;
		this.element.addClass('input');
		this.element.insertBefore(this.input.getElement(), this.span);
	}

	UIParameter.prototype.setOutput = function(uiendpoint) {
		this.output = uiendpoint;
		this.element.addClass('output');
		this.element.appendChild(this.output.getElement());
	}

	UIParameter.prototype.setEnabled = function(flag) {
		this.uielement.disabled = !flag;
	}

	UIParameter.prototype.getValue = function() { return null; }

	UIParameter.prototype.setConnected = function(flag) {
		this.connected = flag;
		if(this.connected) {
			this.element.addClass('connected');
		}
		else {
			this.element.removeClass('connected');
		}
	}

	UIParameter.prototype.setVisible = function(flag) {
		this.visible = flag;
		if(this.visible) {
			this.element.removeClass('hidden');
		}
		else {
			this.element.addClass('hidden');
		}
	}

	return UIParameter;

})();


var UILabel = (function() {

	UILabel.prototype = Object.create(UIParameter.prototype);
	UILabel.prototype.constructor = UILabel;

	function UILabel(parent, title) {
		UIParameter.call(this, parent, title, true);
	}

	UILabel.prototype.buildElement = function() {
		UIParameter.prototype.buildElement.call(this);

		this.uielement = Util.getParagraph(this.title);
		this.uielement.addClass('uiel');
		this.span.appendChild(this.uielement);
	}

	return UILabel;

})();


var UISelection = (function() {

	UISelection.prototype = Object.create(UIParameter.prototype);
	UISelection.prototype.constructor = UISelection;

	UISelection.prototype.options;

	function UISelection(parent, title, required) {
		UIParameter.call(this, parent, title, required);
		this.options = [];
		this.map = [];
	}

	UISelection.prototype.buildElement = function() {
		UIParameter.prototype.buildElement.call(this);

		this.uielement = Util.getSelect();
		this.uielement.addClass('uiel');
		this.span.appendChild(this.uielement);

		this.uielement.addEventListener('change', Parameter.prototype.notify.bind(this.parent));
	}

	UISelection.prototype.setOptions = function(options) {
		//save old value
		var old = this.getValue();

		this.options = options;

		//remove all options
		for(var i = this.uielement.options.length-1; i >=0; i--){
			this.uielement.remove(this.uielement.options[i]);
		}

		//add empty option
		if(!this.required) {
			var empty = new Option('', null, false, false);
			this.uielement.add(empty);
		}

		//add new options, select old value if in new options
		for(var i = 0; i < options.length; i++) {
			this.uielement.add(new Option(options[i].getDisplay(), i, false, options[i] == old));
		}
	}

	UISelection.prototype.addOption = function(option) {

		this.options.push(option);

		this.uielement.add(new Option(option.getDisplay(), this.options.length, false, false));
	}

	UISelection.prototype.getValue = function() {
		return this.options[this.uielement.value];
	}

	return UISelection;

})();


var UIRelation = (function() {

	UIRelation.prototype = Object.create(UIParameter.prototype);
	UIRelation.prototype.constructor = UIRelation;

	function UIRelation(parent, title) {
		UIParameter.call(this, parent, title, false);
	}

	UIRelation.prototype.buildElement = function() {
		UIParameter.prototype.buildElement.call(this);

		this.uielement = Util.getInput();
		this.uielement.addClass('uiel');
		this.span.appendChild(this.uielement);

		this.uielement.addEventListener('keyup', Parameter.prototype.notify.bind(this.parent));
	}

	UIRelation.prototype.getValue = function() {
		var relation = new Relation('Constant', 'c');
		var constant = new Constant(this.uielement.value, 'string', relation);
		relation.addAttribute(constant);

		var query = new Query(relation);
		query.setCardinality(1);

		return query;
	}

	return UIRelation;

})();


var UIConstant = (function() {

	UIConstant.prototype = Object.create(UIParameter.prototype);
	UIConstant.prototype.constructor = UIConstant;

	function UIConstant(parent, title) {
		UIParameter.call(this, parent, title, false);
	}

	UIConstant.prototype.buildElement = function() {
		UIParameter.prototype.buildElement.call(this);

		this.uielement = Util.getInput();
		this.uielement.addClass('uiel');
		this.span.appendChild(this.uielement);

		this.uielement.addEventListener('keyup', Parameter.prototype.notify.bind(this.parent));
	}

	UIConstant.prototype.getValue = function() {
		return this.uielement.value;
	}

	return UIConstant;

})();