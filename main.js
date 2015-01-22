var container;
var instance;

var node_counter = 0;

var node_types = [];

jsPlumb.ready(function() {

	console.log("---INIT---")

	container = document.getElementById("main_slate");

	console.log("create instance");
	
	instance = jsPlumb.getInstance();

	instance.setContainer(container);

	instance.doWhileSuspended(function() {		
		//binding
	});

	container.addEventListener("mousedown", function(e) {click(e);});


});

function click(e) {
	console.log(e);
	//alert(e.x);
}

function addNode(node) {

	instance.draggable(node.element);
	container.appendChild(node.element);

	node_counter++;
}