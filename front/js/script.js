var sketchpad;
var response;

document.addEventListener('DOMContentLoaded', function(){

    var changeToArray = function(notArray){
        return [].slice.call(notArray);
    }

    function Sketchpad(){
        if(!(this instanceof Sketchpad)){
            return new Sketchpad();
        }

        this.colorsArray = changeToArray(document.querySelectorAll('.color'));
        this.mouseDown = false;
        this.currentColor = '#000';
        this.currentValue = 10.0;

        this.winResize();
        this.setUpCanvas();
        this.setUpColors();
        this.setUpRange();

        this.lines = [];
        this.line = {
            path_id: 0,
            path: []
        };

        this.joined = false;
        this.id = 'img_'+Math.round(Math.random()*1000000) + '';
        this.username = 'user_'+Math.round(Math.random()*1000000) + '';

        this.init();
    }

    Sketchpad.prototype.getX = function(e){
        var b = this.canvas.getBoundingClientRect();
        if(e.offsetX){
            return e.offsetX;
        } else if(e.clientX){
            return e.clientX - b.left;
        }
    }

    Sketchpad.prototype.getY = function(e){
        var b = this.canvas.getBoundingClientRect();
        if(e.offsetY){
            return e.offsetY;
        } else if(e.clientY){
            return e.clientY - b.top;
        }
    }

    Sketchpad.prototype.winResize = function(){
        document.querySelector('body').onresize = function(e){
            this.canvas.width = this.canvas.parentElement.offsetWidth;
            this.canvas.height = 400;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.fillStyle = "#fff";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }.bind(this);
    }

    Sketchpad.prototype.setUpCanvas = function(){
        this.canvas = document.querySelector('canvas');
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = 400;

        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        this.canvas.onmousedown = function(e){
            this.mouseDown = true;
            this.canvas.style.cursor = 'crosshair';
            this.ctx.beginPath();
            this.ctx.moveTo(this.getX(e), this.getY(e));

            var empty = [];
            this.line = {
                path_id: Math.round(Math.random()*1000000) + '',
                path: empty
            };

        }.bind(this);

        this.canvas.onmouseup = function(){
            this.mouseDown = false;

            
            this.lines.push(this.line);
            this.ws.send(JSON.stringify(this.line));
        }.bind(this);

        this.canvas.onmousemove = function(e){
            if(!this.mouseDown) return;
            this.ctx.lineWidth = this.currentValue;
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineTo(this.getX(e), this.getY(e));
            this.ctx.stroke();


            var tmp = {
                lineWidth: this.currentValue,
                color: this.currentColor,
                x: this.getX(e),
                y: this.getY(e),
            };
            this.line.path.push(tmp);

        }.bind(this);
    }

    Sketchpad.prototype.setUpRange = function(){
        this.rangeInput = document.querySelector('input[type=range]');
        this.outputValue = document.querySelector('#range-value');
        this.rangeInput.onmousemove = function(e){
            this.outputValue.innerHTML = e.target.value;
            this.currentValue = e.target.value;
        }.bind(this);
    }

    Sketchpad.prototype.setChosenColor = function(e){
        this.currentColor = e.target.dataset.color;

        for(var i = 0; i < this.colorsArray.length; i++){
            if(e.target === this.colorsArray[i]){
                this.colorsArray[i].classList.add("current");
            } else {
                this.colorsArray[i].classList.remove("current");
            }
        }
    }

    Sketchpad.prototype.setUpColors = function(){
        for(var i = 0; i < this.colorsArray.length; i++){
            var color = this.colorsArray[i].dataset.color;
            this.colorsArray[i].style.backgroundColor = color;
            this.colorsArray[i].style.width = 1/this.colorsArray.length * 100 + '%';
            this.colorsArray[i].addEventListener('click', function(e){
                this.setChosenColor(e);
            }.bind(this));
        }
    }

    Sketchpad.prototype.init = function(){

        
        this.ws = new WebSocket("ws://localhost:8000/ws");

        this.ws.onopen = function() {
            console.log('Connection opened');
            var data = {
                type: 'status',
                message: 'joined',
                username: this.username
            };
            this.ws.send(JSON.stringify(data));
        }.bind(this);

        this.ws.onmessage = function(e){
            var answer = JSON.parse(e.data);
            if (Array.isArray(answer) && answer.length > 0){
                console.log('Jest lista');
                console.log(answer);
                for (var i = 0; i < answer.length; i++){
                    if (answer[i].hasOwnProperty('path_id')) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(answer[i].path[0].x, answer[i].path[0].y);
                        this.ctx.lineWidth = answer[i].path[0].lineWidth;
                        this.ctx.strokeStyle = answer[i].path[0].color;
                        for (var j = 1; j < answer[i].path.length; j++){
                            this.ctx.lineTo(answer[i].path[j].x, answer[i].path[j].y);
                            this.ctx.stroke();
                        }
                    }
                }
                //console.log(answer.toString())
                /*if (Array.isArray(answer[0])){
                    for (var i = 0; i < answer.length; i++){

                        this.ctx.beginPath();
                        this.ctx.moveTo(answer[i][0].x, answer[i][0].y);
                        this.ctx.lineWidth = answer[i][0].lineWidth;
                        this.ctx.strokeStyle = answer[i][0].color;

                        for (var j = 1; j < answer.length; j++){
                            this.ctx.lineTo(answer[i][j].x, answer[i][j].y);
                            this.ctx.stroke();
                        }
                    }
                }
                else
                {
                    this.ctx.beginPath();
                    this.ctx.moveTo(answer[0].x, answer[0].y);
                    this.ctx.lineWidth = answer[0].lineWidth;
                    this.ctx.strokeStyle = answer[0].color;

                    for (var j = 1; j < answer.length; j++){
                        this.ctx.lineTo(answer[j].x, answer[j].y);
                        this.ctx.stroke();
                    }
                }*/
            } else {
                console.log('Jest element');
                console.log(answer);
                response = answer;
                if (answer.hasOwnProperty('path_id')) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(answer.path[0].x, answer.path[0].y);
                    this.ctx.lineWidth = answer.path[0].lineWidth;
                    this.ctx.strokeStyle = answer.path[0].color;
                    for (var j = 1; j < answer.path.length; j++){
                        this.ctx.lineTo(answer.path[j].x, answer.path[j].y);
                        this.ctx.stroke();
                    }
                }
            }
        }.bind(this);

        this.ws.onclose = function(){
            console.log('Connection closed');
            var data = {
                type: 'status',
                message: 'left',
                username: this.username
            };

            this.ws.send(JSON.stringify(data));
        }.bind(this);

        //this.ws.onopen();
        this.joined = true;
    };


    sketchpad = Sketchpad();

}, false);
