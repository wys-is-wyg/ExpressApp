class Socket{

    constructor(io){
        if (typeof this.instance === 'object') {
            return this.instance;
        }
        this.io = io;
        this.openSocket();
        this.instance = this;
        return this;
    }

    openSocket(){
        this.io.on('connection', (socket) => {
        console.log('New user connected');
    
        //default username
        socket.username = "Anonymous";
    
            //listen on change_username
            socket.on('change_username', (data) => {
                socket.username = data.username
            })
    
            //listen on new_message
            socket.on('new_message', (data) => {
                //broadcast the new message
                this.io.sockets.emit('new_message', {message : data.message, username : socket.username});
            })
    
            //listen on typing
            socket.on('typing', (data) => {
            socket.broadcast.emit('typing', {username : socket.username})
            })
        })
  }
}
module.exports = Socket;