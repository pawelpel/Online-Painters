document.addEventListener('DOMContentLoaded', function(){

	function Factory() {
		this.createColor = function(type) {

			var color;
			
			if (type == 'white') {
				color = new White();
			} else if (type == 'black') {
				color = new Black();
			} else if (type == 'red') {
				color = new Red();
			} else if (type == 'purple') {
				color = new Purple();
			} else if (type == 'blue') {
				color = new Blue();
			} else if (type == 'green') {
				color = new Green();
			} else if (type == 'yellow') {
				color = new Yellow();
			} else if (type == 'orange') {
				color = new Orange();
			} else if (type == 'brown') {
				color = new Brown();
			} else if (type == 'grey') {
				color = new Grey();
			}

			return color;
		}
	}

	var White = function() {
		this.hex = "#ffffff";
	}

	var Black = function() {
		this.hex = "#212121";
	}

	var Red = function() {
		this.hex = "#F44336";
	}

	var Purple = function() {
		this.hex = "#673AB7";
	}

	var Blue = function() {
		this.hex = "#2196F3";
	}

	var Green = function() {
		this.hex = "#4CAF50";
	}

	var Yellow = function() {
		this.hex = "#FFEB3B";
	}

	var Orange = function() {
		this.hex = "#FF9800";
	}

	var Brown = function() {
		this.hex = "#795548";
	}

	var Grey = function() {
		this.hex = "#9E9E9E";
	}

	function addToDOM(color) {
		var colors = document.querySelector('#colors');
		var div = document.createElement("div");
		div.dataset.color = color.hex;
		div.classList.add("color");
		colors.appendChild(div);
	}

	var factory = new Factory();
	addToDOM(factory.createColor('white'));
	addToDOM(factory.createColor('red'));
	addToDOM(factory.createColor('orange'));
	addToDOM(factory.createColor('yellow'));
	addToDOM(factory.createColor('green'));
	addToDOM(factory.createColor('blue'));
	addToDOM(factory.createColor('purple'));
	addToDOM(factory.createColor('brown'));
	addToDOM(factory.createColor('grey'));
	addToDOM(factory.createColor('black'));


}, false);