$(document).ready(function(){
	var element = $('meta[name="active-menu"]').attr('content');
	$('#' + element).addClass('active');
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();

	
});