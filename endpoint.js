var Endpoint = (function() {

	Endpoint.prototype.element;

	Endpoint.prototype.value;
	Endpoint.prototype.parent;

	Endpoint.prototype.neighbors;
	Endpoint.prototype.connected;

	Endpoint.prototype.dependents;

	Endpoint.prototype.type;

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
		console.log('attach@'+this.type+':');
		console.log(this);
		this.neighbors.push(endpoint);
		//subclass should call notify
	}

	Endpoint.prototype.detach = function(endpoint) {
		console.log('detach@'+this.type+':');
		console.log(this);
		for(var i = 0; i < this.neighbors.length; i++) {
			if(this.neighbors[i] == endpoint) {
				this.neighbors.splice(i, 1);
			}
		}
		//subclass should call notify
	}

	Endpoint.prototype.notify = function() {
		console.log('notify@Endpoint:');
		console.log(this);

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
		//this is ugly
		if(this.element) {
			this.element.detachAll();
		}
		else {
			for(var i = 0; i < this.neighbors.length; i++) {
				this.neighbors[i].detach(this);
				this.detach(this.neighbors[i]);
			}
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

	Source.prototype.attach = function(endpoint) {
		Endpoint.prototype.attach.call(this, endpoint);
		this.notify();
	}

	Source.prototype.detach = function(endpoint) {
		Endpoint.prototype.detach.call(this, endpoint);
		this.notify();
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
		this.value = null;
		this.notify();
	}

	Target.prototype.update = function() {
		Endpoint.prototype.update.call(this);
		this.value = this.connected ? this.neighbors[0].value : null;
	}

	return Target;

})();