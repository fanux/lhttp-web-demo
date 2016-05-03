# lhttp-web-demo :dog:
We recommend some webframeworks like [vue.js](http://vuejs.org.cn/) or [angular](https://angularjs.org/)
###just clone the code, and open index.html in your browser!
![chat-demo](https://github.com/fanux/lhttp-web-demo/blob/master/web-demo.gif)

###index.html:
```javascript
<head>
    <script src="./lhttp-client.js"></script>
    <script src="./vue.min.js"></script>
</head>

<body id="chat">
    <ul>
        <li v-for="m in messages">
            {{m}}
        </li>
    </ul>
    <input v-model="message"> <button v-on:click="send">Send</button>
</body>
<script type="text/javascript">
var lhttp_client = new Lhttp("ws://yourIp:yourLhttpPort/");
new Vue({
    el:"#chat",
    data:{
        messages:[]
    },
    methods:{
        send:function(){
            lhttp_client.context.publish("chatroom", "chat", null, this.message);
            this.message = "";
        }
    },
    created:function() {
        var _this = this;
        lhttp_client.on_message = function(context) {
            console.log("on message: " + context.getBody());
            if (context.getBody() != "") {
                _this.messages.push(context.getBody());
            }
        }
    }
})
lhttp_client.on_open = function(context) {
    context.subscribe("chatroom", "chat", null, "");
}
</script>
```
# more infomation about the [chat server](https://github.com/fanux/lhttp) and the [javascript sdk](https://github.com/fanux/lhttp-javascript-sdk)

