
function Util() {
}

//JSON

Util.loadJSON = function(url, callback) {
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

//JSPlumb

Util.style_target = {
    anchor: [0, 0.5, -1.25, 0],
    endpoint:"Rectangle",
    paintStyle: {height: 14, width: 10},
    cssClass: 'square',
    connector:["Bezier", {curviness: 80}],
    maxConnections: 1,
    dropOptions:{hoverClass:"hover", activeClass:"active"},
    isTarget: true,
    scope: 'a',
    uniqueEndpoint: true
}

Util.style_source = {
    anchor: [1, 0.5, 1.25, 0],
    endpoint: "Blank",
    connector:["Bezier", {curviness: 80}],
    isSource: true,
    scope: 'a'
}

Util.instance = undefined;

Util.getInstance = function() {
    if(!Util.instance) {
        Util.instance = jsPlumb.getInstance({
            DragOptions : { cursor: 'pointer', zIndex:1000, grid: [10, 10]},
        });
    }
    return Util.instance;
}

Util.draggable = function(element) {
    Util.getInstance().draggable(element);
}

//DOM

Util.extendDOM = function() {
    HTMLElement.prototype.hasClass = function(clazz) { Util.hasClass(this, clazz); };
    HTMLElement.prototype.addClass = function(clazz) { Util.addClass(this, clazz); };
    HTMLElement.prototype.removeClass = function(clazz) { Util.removeClass(this, clazz); };
    HTMLElement.prototype.toggleClass = function(clazz) { Util.toggleClass(this, clazz); };
}

Util.getElement = function(type) {
    return document.createElement(type);
}

Util.getDiv = function(classname) {
    var el_div = Util.getElement("div");
    if(classname) {
        el_div.addClass(classname);
    }
    return el_div;
}

Util.getParagraph = function(text) {
    var el_p = Util.getElement("p");
    el_p.addClass("no-select");
    el_p.innerHTML = text;
    return el_p;
}

Util.getSpan = function() {
    return Util.getElement('span');
}

Util.getInput = function() {
    return Util.getElement('input');
}

Util.getSelect = function() {
    return Util.getElement('select');
}

Util.getIcon = function(name) {
    var icon = Util.getElement("i");
    icon.className = "fa fa-"+name;
    return icon;
}

Util.getSource = function(parent) {
    var source = Util.getDiv('source');
    source.reference = parent;

    Util.getInstance().makeSource(source, Util.style_source);

    return source;
}

Util.getTarget = function(parent) {
    var target = Util.getDiv('target');
    target.reference = parent;

    Util.getInstance().makeTarget(target, Util.style_target);

    return target;
}

Util.makeSource = function(element) {
    Util.getInstance().makeSource(element, Util.style_source);
}

Util.makeTarget = function(element) {
    Util.getInstance().makeTarget(element, Util.style_target);
}

Util.makeEndpoint = function(element, type) {
    if(type == 'source') {
        Util.makeSource(element);
    }
    else if(type == 'target') {
        Util.makeTarget(element);
    }
}

//CSS

Util.hasClass = function(element, classname) {
    if(element.classList) {
        return element.classList.contains(classname);
    }
    else {
        return element.className.match(new RegExp("(?:^|\\s)"+classname+"(?!\\S)", "g"));
    }
}

Util.addClass = function(element, classname) {
    if(Util.hasClass(element, classname)) {
        return false;
    }

    if(element.classList) {
        element.classList.add(classname);
    }
    else {
        element.className += " "+classname;
    }

    return true;
}

Util.removeClass = function(element, classname) {
    if(!Util.hasClass(element, classname)) {
        return false;
    }

    if(element.classList) {
        element.classList.remove(classname);
    }
    else {
        element.className = element.className.replace(new RegExp("(?:^|\\s)"+classname+"(?!\\S)", "g"), "");
    }

    return true;
}

Util.toggleClass = function(element, classname) {
    if(Util.hasClass(element, classname)) {
        Util.removeClass(element, classname);
    }
    else {
        element.addClass(classname);
    }
}