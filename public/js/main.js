$(document).ready(function(){
	var element = $('meta[name="active-menu"]').attr('content');
	$('#' + element).addClass('active');
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
	$('.custom-file-input').change(function(e){
		var fileName = e.target.files[0].name;
		$(this).next('.custom-file-label').html(fileName);
	});
	var socket = io('http://localhost:80');

	socket.on('news', function (data) {
		var div = document.getElementById("news-list");
		console.log("Rendering news : ",data);

		for(var i = 0;i < data.length;i++){
			var newsItem = data[i];
			div.innerHTML += "<h3>" + newsItem.title + ' <small>'+ newsItem.date + "</small></h3><br>";
		}

		socket.emit('my other event', { my: 'data' });
	});
});