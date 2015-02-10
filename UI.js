/*UI Elements*/

var UINode = (function() {

	UINode.prototype.element;
	UINode.prototype.header;
	UINode.prototype.content;

	UINode.prototype.title;
	UINode.prototype.parameters;

	UINode.prototype.parent;

	function UINode(parent, title) {
		this.title = title;
		this.parent = parent;
		this.parameters = [];

		this.buildElement();
	}

	UINode.prototype.buildElement = function() {
		this.element = Util.getDiv('node');

		this.element.reference = this.parent;

		this.buildHeader();
		this.buildContent();

		Util.draggable(this.element);
	}

	UINode.prototype.buildHeader = function() {
		this.header = Util.getDiv('header');

		this.paragraph = Util.getParagraph(this.title);
		this.header.appendChild(this.paragraph);

		this.trash = Util.getIcon('trash');
		this.trash.addEventListener('click', Node.prototype.remove.bind(this.parent));
		this.header.appendChild(this.trash);

		this.element.appendChild(this.header);
	}

	UINode.prototype.buildContent = function() {
		this.content = Util.getDiv('content');
		this.element.appendChild(this.content);
	}

	UINode.prototype.append = function(uiparameter) {
		this.parameters.push(uiparameter);
		this.content.appendChild(uiparameter.getElement());
	}

	UINode.prototype.setOutput = function(uiendpoint) {
		this.header.insertBefore(uiendpoint.getElement(), this.trash);
	}

	UINode.prototype.getElement = function() {
		return this.element;
	}

	UINode.prototype.update = function() {
		Util.getInstance().recalculateOffsets(this.element);
		Util.getInstance().repaint(this.element);
	}

	UINode.prototype.remove = function() {
		Util.getInstance().getContainer().removeChild(this.element);
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
		Util.getInstance().detachAllConnections(this.element);
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

	UIParameter.prototype.target;
	UIParameter.prototype.source;

	UIParameter.prototype.input;
	UIParameter.prototype.output;

	UIParameter.prototype.parent;

	function UIParameter(parent, title) {
		this.parent = parent;
		this.title = title;

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

	UIParameter.prototype.getElement = function() {
		return this.element;
	}

	UIParameter.prototype.getContent = function() {
		return null;
	}

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

	UIParameter.prototype.getValue = function() {}

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
		UIParameter.call(this, parent, title);
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
	UISelection.prototype.map;

	function UISelection(parent, title) {
		UIParameter.call(this, parent, title);
		this.options = [];
	}

	UISelection.prototype.buildElement = function() {
		UIParameter.prototype.buildElement.call(this);

		this.uielement = Util.getSelect();
		this.uielement.addClass('uiel');
		this.span.appendChild(this.uielement);

		this.uielement.addEventListener('change', Parameter.prototype.notify.bind(this.parent));
	}

	UISelection.prototype.setOptions = function(options) {
		if(this.options != options) {
			this.options = options;
			this.map = [];

			for(var i = this.uielement.options.length-1; i >=0; i--){
				this.uielement.remove(this.uielement.options[i]);
			}

			for(var i = 0; i < options.length; i++) {
				this.uielement.add(new Option(options[i].title, options[i].id, false, false));
				this.map[options[i].id] = options[i];
			}
		}
	}

	UISelection.prototype.getValue = function() {
		return this.map[this.uielement.value];
	}

	return UISelection;

})();


var UIConstant = (function() {

	UIConstant.prototype = Object.create(UIParameter.prototype);
	UIConstant.prototype.constructor = UIConstant;

	function UIConstant(parent, title) {
		UIParameter.call(this, parent, title);
	}

	UIConstant.prototype.buildElement = function() {
		UIParameter.prototype.buildElement.call(this);

		this.uielement = Util.getInput();
		this.uielement.addClass('uiel');
		this.span.appendChild(this.uielement);

		this.uielement.addEventListener('keyup', Parameter.prototype.notify.bind(this.parent));
	}

	UIConstant.prototype.getValue = function() {
		var rel = {
			id: 'constant',
			rows: 1,
			title: 'world',
			attributes: [
				{
					id: 0,
					rel: 'hello',
					title: 'constant',
					type: 'string',
					unique: false
				}
			]
		};
		return rel;
		//return this.uielement.value;
	}

	return UIConstant;

})();