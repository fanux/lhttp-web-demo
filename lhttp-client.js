function Lhttp(url) {
    var _this = this;
    _this.conn = new WebSocket(url);

    //client interface
    _this.on_open = function(c){console.log("base on open")}
    _this.on_message = function(c){console.log("base on message")}
    _this.on_close = function(c){console.log("base on close")}
    _this.on_error = function(c){console.log("base on error")}

    _this.conn.onclose = function(evt) {
        var c = new Context(_this.conn, evt.data);
        _this.on_close(c);
    }
    _this.conn.onopen = function(evt) {
        var c = new Context(_this.conn, null);
        _this.on_open(c);
    }
    _this.conn.onmessage = function(evt) {
        console.log("receive message: " + evt.data);
        var c = new Context(_this.conn, evt.data);
        _this.on_message(c);
    }
    _this.conn.onerror = function(evt) {
        var c = new Context(_this.conn, evt.data);
        _this.on_error(c);
    }

    _this.context = new Context(_this.conn, null);
}

var HEADER_KEY_PUBLISH = "publish";
var HEADER_KEY_SUBSCRIBE = "subscribe";

function Context(conn, message) {
    var _this = this;
    _this.conn = conn;
    _this.req = new Message(message);
    _this.resp = new Message("");
    _this.upstreamURL = "";
    _this.multiparts = [];

    _this.setCommand = function(str) {
        _this.resp.command = str;
    }

    _this.getCommand = function() {
        return _this.req.command;
    }

    _this.getHeader = function(str) {
        return _this.req.headers;
    }

    _this.addHeader = function(key, value) {
        _this.resp.headers[key] = value;
    }

    _this.getBody = function() {
        return _this.req.body;
    }

    _this.send = function(body) {
        _this.resp.body = body;
        if (_this.resp.command == "") {
            _this.resp.command = _this.req.command;
        }
        if (_this.resp.headers == {}) {
            _this.resp.headers = _this.req.headers;
        }
        _this.conn.send(_this.resp.encode());
        console.log("send message: " + _this.resp.encode());
    }

    _this.getMultipart = function() {
        return _this.multiparts;
    }

    _this.appendPart = function(headers, body) {
        //TODO
    }

    function assembleMessage(channel, command, headers, body) {
        _this.setCommand(command);

        for(var h in headers){
            _this.addHeader(h, headers[h]);
        }

        _this.send(body);
    }

    _this.publish = function(channel, command, headers, body) {
        //console.log("publish body: " + body);
        _this.addHeader(HEADER_KEY_PUBLISH, channel);
        assembleMessage(channel, command, headers, body);
    }

    _this.subscribe = function(channel, command, headers, body) {
        _this.addHeader(HEADER_KEY_SUBSCRIBE, channel);
        assembleMessage(channel, command, headers, body);
    }
}

var PROTOCOL_AND_VER = "LHTTP/1.0";

function Message(message) {
    var _this = this;
    _this.rawMessage = message;
    _this.command = "";
    _this.headers = {};
    _this.body = ""

    _this.decode = function() {
        var array = _this.rawMessage.split("\r\n\r\n");
        var command_and_headers = array[0];
        _this.body = array[1];
        console.log("body: " + _this.body);

        var slice = command_and_headers.split("\r\n");
        _this.command = slice[0].slice(PROTOCOL_AND_VER.length + 1);
        console.log("command: " + _this.command);

        var k,v;
        var temp;
        for (var i = 1; i < slice.length; i++) {
            temp = slice[i].split(":");
            k = temp[0];
            v = temp[1];

            console.log("header key: " + k + " header value: " + v);

            _this.headers[k] = v;
        }
    }

    _this.encode = function() {
        var msg = PROTOCOL_AND_VER + " " + _this.command + "\r\n";
        for (var h in _this.headers) {
            msg += h + ":" + _this.headers[h] + "\r\n";
        }
        msg += "\r\n" + _this.body;

        console.log("encode msg: " , msg);

        return msg;
    }

    if (message && message.startsWith(PROTOCOL_AND_VER)) {
        _this.decode();
    }
}

var m = new Message("LHTTP/1.0 command\r\nh1:v1\r\nh2:v2\r\n\r\nbody");
m.encode();
