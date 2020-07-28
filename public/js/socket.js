$(function(){
   	//make connection
	var socket = io.connect();

	//buttons and inputs
	var message = $("#message")

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})

});