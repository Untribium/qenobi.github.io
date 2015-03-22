var node_counter = 0;

jsPlumb.ready(function() {

	Util.extendDOM();
	Util.extendArray();


	console.log("---INIT---")

	Config.readTypes();
	Config.readSchema(Sample.schema);

	var container = Util.getDiv();
	container.addClass('container');
	container.id = 'container';

	document.body.appendChild(container);

	var output = Util.getElement('pre');
	output.id = 'output';

	container.appendChild(output);

	console.log("create instance");
	
	var instance = Util.getInstance();

	instance.setContainer(container);	

	instance.doWhileSuspended(function() {

		console.log('binding events');
		
		//binding
		instance.bind('connection', function(connection, event) {

			//console.log(connection);

			var source = connection.source.reference;
			var target = connection.target.reference;
			
			source.attach(target);
			target.attach(source);
		});

		instance.bind('connectionDetached', function(connection, event) {
			
			//console.log(connection);

			var source = connection.source.reference;
			var target = connection.target.reference;

			if(source && target) {			
				source.detach(target);
				target.detach(source);
			}
		});

		instance.bind('connectionMoved', function(connection, event) {

			//console.log(connection);

			var source = connection.originalSourceEndpoint.element.reference;
			var old_target = connection.originalTargetEndpoint.element.reference;

			source.detach(old_target);
			old_target.detach(source);

			//no need to call attach, jsPlumb throws an additional 'connection' event

		});
	});

	addNode(Output, 0.8, 0.5);

});

//type of node (class) and position (float, 0 to 1)
function addNode(type, x, y) {
	var node = new type(node_counter);

	var ui = node.buildUI().getElement();
	Util.getContainer().appendChild(ui);

	ui.style.left = (x || 0.15)*window.innerWidth+'px';
	ui.style.top = (y || 0.5)*window.innerHeight-(50+ui.offsetHeight/2)+'px';

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