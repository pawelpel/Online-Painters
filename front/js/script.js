document.addEventListener('DOMContentLoaded', function(){

    function Painters(){
        if(!(this instanceof Painters)) return new Painters();

        this.buttonn = document.querySelector('input[type=button]');
        this.textt = document.querySelector('input[type=text]');
        this.username = '';

        this.lista = document.querySelector('#lista');

        this.joined = false;
        this.id = 'img_'+Math.round(Math.random()*1000000) + '';

        this.init();
    }

    Painters.prototype.init = function(){

        /* HERE CHANGE YOUR IP */
        this.ws = new WebSocket("ws://localhost:8000/ws");

        this.buttonn.onclick = function(e){
            this.sendData({
                type: 'message',
                username: this.username,
                message: this.textt.value
            });
            this.textt.value = "";
        }.bind(this);

        this.username = 'user_'+Math.round(Math.random()*1000000) + '';

        this.ws.onopen = function() {
            console.log('Connection opened');
            this.sendData({
                type: 'status',
                message: 'joined',
                username: this.username
            })
        }.bind(this);

        this.ws.onmessage = function(e){
            var answer = JSON.parse(e.data);
            if (Array.isArray(answer)){
                console.log(answer);
                for (var i = 0; i < answer.length; i++) {
                    var node = document.createElement("LI");                                                      // Create a <li> node
                    var textnode = document.createTextNode(answer[i]['username'] + ' ' + answer[i]['message']);         // Create a text node
                    node.appendChild(textnode);
                    this.lista.appendChild(node);
                }
            } else {
                var node = document.createElement("LI");                                                      // Create a <li> node
                var textnode = document.createTextNode(answer['username'] + ' ' + answer['message']);         // Create a text node
                node.appendChild(textnode);
                this.lista.appendChild(node);
            }
        }.bind(this);

        this.ws.onclose = function(){
            console.log('Connection closed');
            this.sendData({
                type: 'status',
                message: 'left',
                username: this.username
            })
        }.bind(this);

        this.ws.onopen();
        this.joined = true;
    };

    Painters.prototype.sendData = function(data){
        this.ws.send(JSON.stringify(data))
    };

    var mousetogether = Painters();

}, false);