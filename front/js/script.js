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

        var local;
        this.line = {
            path_id: 0,
            path: []
        };

        this.joined = false;
        this.id = 'img_'+Math.round(Math.random()*1000000) + '';
        this.username = 'user_'+Math.round(Math.random()*1000000) + '';

        var ctx = false;
        var ws = false;

        this.handleConnection();
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
            ctx = this.canvas.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }.bind(this);
    }

    Sketchpad.prototype.setUpCanvas = function(){
        this.canvas = document.querySelector('canvas');
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = 400;

        ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (localStorage.getItem("localdb") === null) {
            localStorage.setItem("localdb", JSON.stringify([]));
        }

        local = JSON.parse(localStorage.localdb);
        if (Array.isArray(local) && local.length > 0) {
            for (var i = 0; i < local.length; i++){
                    if (local[i].hasOwnProperty('path_id')) {
                        ctx.beginPath();
                        ctx.moveTo(local[i].path[0].x, local[i].path[0].y);
                        ctx.lineWidth = local[i].path[0].lineWidth;
                        ctx.strokeStyle = local[i].path[0].color;
                        for (var j = 1; j < local[i].path.length; j++){
                            ctx.lineTo(local[i].path[j].x, local[i].path[j].y);
                            ctx.stroke();
                        }
                    }
                }
        }
        

        this.canvas.onmousedown = function(e){
            this.mouseDown = true;
            this.canvas.style.cursor = 'crosshair';
            ctx.beginPath();
            ctx.moveTo(this.getX(e), this.getY(e));

            var empty = [];
            this.line = {
                path_id: Math.round(Math.random()*1000000) + '',
                path: empty
            };

        }.bind(this);

        this.canvas.onmouseup = function(){
            this.mouseDown = false;

            
            local.push(this.line);
            localStorage.setItem("localdb", JSON.stringify(local));
            ws.send(JSON.stringify(this.line));
        }.bind(this);

        this.canvas.onmousemove = function(e){
            if(!this.mouseDown) return;
            ctx.lineWidth = this.currentValue;
            ctx.strokeStyle = this.currentColor;
            ctx.lineTo(this.getX(e), this.getY(e));
            ctx.stroke();


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

    Sketchpad.prototype.handleConnection = function(){
        this.connectButton = document.querySelector('#connect');
        this.disconnectButton = document.querySelector('#disconnect');
        this.led = document.querySelector('#led');

        this.connectButton.addEventListener('click', this.init, false);
        this.disconnectButton.addEventListener('click', function(){
            ws.close();
        }, false);
    }

    Sketchpad.prototype.init = function(){

        
        ws = new WebSocket("ws://localhost:8000/ws");

        ws.onopen = function() {
            console.log('Connection opened');
            var data = {
                type: 'status',
                message: 'joined',
                username: this.username
            };
            ws.send(JSON.stringify(data));
        }.bind(this);

        ws.onmessage = function(e){
            var answer = JSON.parse(e.data);
            if (Array.isArray(answer) && answer.length > 0){
                console.log('Jest lista');
                var local_copy = local;
                var answer_copy = answer;

                for (var i = 0; i < local_copy.length; i++) {
                    for (var j = 0; j < answer_copy; j++) {
                        if (local_copy[i].path_id == answer_copy[j].path_id) {
                            delete(local_copy[i]);
                            delete(answer_copy[j]);
                        }
                    }
                }

                answer = answer_copy;

                for (var i = 0; i < answer.length; i++){
                    if (answer[i].hasOwnProperty('path_id')) {
                        local.push(answer[i]);
                        localStorage.setItem("localdb", JSON.stringify(local));
                        ctx.beginPath();
                        ctx.moveTo(answer[i].path[0].x, answer[i].path[0].y);
                        ctx.lineWidth = answer[i].path[0].lineWidth;
                        ctx.strokeStyle = answer[i].path[0].color;
                        for (var j = 1; j < answer[i].path.length; j++){
                            ctx.lineTo(answer[i].path[j].x, answer[i].path[j].y);
                            ctx.stroke();
                        }
                    }
                }

                for (var i = 0; i < local_copy.length; i++)
                {
                    ws.send(JSON.stringify(local_copy[i]));
                }


            } else {
                console.log('Jest element');
                console.log(answer);
                response = answer;
                if (answer.hasOwnProperty('path_id')) {
                    //local.push(answer);
                    //localStorage.setItem("localdb", JSON.stringify(local));
                    ctx.beginPath();
                    ctx.moveTo(answer.path[0].x, answer.path[0].y);
                    ctx.lineWidth = answer.path[0].lineWidth;
                    ctx.strokeStyle = answer.path[0].color;
                    for (var j = 1; j < answer.path.length; j++){
                        ctx.lineTo(answer.path[j].x, answer.path[j].y);
                        ctx.stroke();
                    }
                }
            }
        }.bind(this);

        ws.onclose = function(){
            console.log('Connection closed');
            var data = {
                type: 'status',
                message: 'left',
                username: this.username
            };

            ws.send(JSON.stringify(data));
            this.joined = false;
        }.bind(this);
        
        this.joined = true;
    };


    sketchpad = Sketchpad();

}, false);
