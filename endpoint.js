var Endpoint = (function() {

	Endpoint.prototype.element;

	Endpoint.prototype.value;
	Endpoint.prototype.parent;

	Endpoint.prototype.neighbors;
	Endpoint.prototype.connected;

	Endpoint.prototype.dependents;

	Endpoint.prototype.type;

	Endpoint.prototype.query;

	function Endpoint(parent) {
		this.parent = parent;

		this.dependents = [];
		this.neighbors = [];
		this.connected = false;
	}

	Endpoint.prototype.buildUI = function() {
		this.element = new UIEndpoint(this, this.type);
		return this.element;
	}

	Endpoint.prototype.getUI = function() {
		return this.element;
	}

	Endpoint.prototype.attach = function(endpoint) {
		console.log('attach@'+this.type+':\t\t', this);

		this.neighbors.push(endpoint);
	}

	Endpoint.prototype.detach = function(endpoint) {
		console.log('detach@'+this.type+':\t\t', this);

		this.neighbors.remove(endpoint);
	}

	Endpoint.prototype.notify = function() {
		console.log('notify@Endpoint:\t', this);

		this.update();

		for(var i = 0; i < this.dependents.length; i++) {
			this.dependents[i].notify();
		}
	}

	Endpoint.prototype.update = function() {
		this.connected = (this.neighbors.length > 0);
	}

	Endpoint.prototype.addDependent = function(dependent) {
		this.dependents.push(dependent);
	}

	Endpoint.prototype.removeDependent = function(dependent) {
		for(var i = 0; i < this.dependents.length; i++) {
			if(this.dependents[i] == dependent) {
				this.dependents.splice(i, 1);
			}
		}
	}

	Endpoint.prototype.getQuery = function() {
		return this.query;
	}

	Endpoint.prototype.setQuery = function(query) {
		this.query = query;
		this.notify();
	}

	Endpoint.prototype.getValue = function() {
		return this.value;
	}

	Endpoint.prototype.setValue = function(value) {
		this.value = value;
		this.notify();
	}

	Endpoint.prototype.isConnected = function() {
		return this.connected;
	}

	Endpoint.prototype.detachAll = function() {
		for(var i = 0; i < this.neighbors.length; i++) {
			this.neighbors[i].detach(this);
			this.detach(this.neighbors[i]);
		}

		if(this.element) {
			this.element.detachAll();
		}
	}

	return Endpoint;

})();


var Source = (function() {

	Source.prototype = Object.create(Endpoint.prototype);
	Source.prototype.constructor = Source;

	function Source(parent) {
		Endpoint.call(this, parent);
		this.parent.addDependent(this);
		this.type = 'source';
	}

	Source.prototype.update = function() {
		Endpoint.prototype.update.call(this);

		this.value = this.parent.getValue();
		if(this.parent.query) {
			this.query = this.parent.getQuery();
		}
		else {
			this.query = undefined;
		}
	}

	return Source;

})();


var Target = (function() {

	Target.prototype = Object.create(Endpoint.prototype);
	Target.prototype.constructor = Target;

	function Target(parent) {
		Endpoint.call(this, parent);
		this.addDependent(this.parent);
		this.type = 'target';
	}

	Target.prototype.attach = function(endpoint) {
		Endpoint.prototype.attach.call(this, endpoint);
		endpoint.addDependent(this);
		this.notify();
	}

	Target.prototype.detach = function(endpoint) {
		Endpoint.prototype.detach.call(this, endpoint);
		endpoint.removeDependent(this);
		this.notify();
	}

	Target.prototype.update = function() {
		Endpoint.prototype.update.call(this);
		this.value = this.connected ? this.neighbors[0].value : null;
		this.query = this.connected ? this.neighbors[0].query : null;
	}

	return Target;

})();