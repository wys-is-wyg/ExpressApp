$(document).ready(function(){
	var element = $('meta[name="active-menu"]').attr('content');
	$('#' + element).addClass('active');
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();

	$('#login-form form').submit(function(event) {
		data =  $('#login-form form').serialize();
		fireBaseLoginUser(data);
		event.preventDefault();
	  });
});