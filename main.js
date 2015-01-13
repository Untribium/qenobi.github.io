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

	console.log("---RESOURCES---");

	console.log("load core nodes");

	getJSON("resources/core.json", function(response) {/*node_types.concat(response)*/node_types = response});

});

function add_node(type) {
	var node = document.createElement("div");
	node.className += " node";
	node.id = "node_"+node_counter;


	populate_node(node, type);

	container.appendChild(node);
	instance.draggable(node);

	node_counter++;
}

function populate_node(node, type) {
	
	var header = document.createElement("div");
	header.className += " header";

	var title = document.createElement("p");
	title.innerHTML = "title";
	header.appendChild(title);

	var settings = document.createElement("i");
	settings.className = "fa fa-cog";
	settings.onclick = function(){alert("settings");};
	header.appendChild(settings);

	node.appendChild(header);

	title.innerHTML = node_types[type].title;


}

function createRow() {
	var row = document.createElement("div");
	row.className += " row";
}

function getJSON(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.setRequestHeader("Content-type", "application/json");

    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
        	var response = JSON.parse(request.responseText);
			callback(response);
		}
	}
	request.send();
}