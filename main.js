var container;

var node_counter = 0;

jsPlumb.ready(function() {

	Util.extendDOM();

	console.log("---INIT---")

	container = document.getElementById('container');

	console.log("create instance");
	
	var instance = Util.getInstance();

	instance.setContainer(container);

	instance.doWhileSuspended(function() {		
		
		//binding
		instance.bind('connection', function(connection, event) {

			console.log(connection);

			var source = connection.source.reference;
			var target = connection.target.reference;
			
			// console.log('attaching source');
			source.attach(target);
			// console.log('attaching target');
			target.attach(source);
			// console.log('attaching done');
		});

		instance.bind('connectionDetached', function(connection, event) {
			
			//console.log(connection);

			var source = connection.source.reference;
			var target = connection.target.reference;
			
			// console.log('detaching source');
			source.detach(target);
			// console.log('detaching target');
			target.detach(source);
			// console.log('detaching done');
		});

		instance.bind('connectionMoved', function(connection, event) {

			console.log(connection);

			var source = connection.originalSourceEndpoint.element.reference;
			var old_target = connection.originalTargetEndpoint.element.reference;

			source.detach(old_target);
			old_target.detach(source);

		});		
	});

});

function addNode(node) {
	container.appendChild(node.buildUI().getElement());

	node_counter++;
}

var shift = false;

document.onkeydown = function(e) {
    if(e.shiftKey) {
    	console.log('shift down');
        shift = true;
    }
}

document.onkeyup = function(e) {
    if(!e.shiftKey && shift) {
    	console.log('shift up');
        shift = false;
    }
}