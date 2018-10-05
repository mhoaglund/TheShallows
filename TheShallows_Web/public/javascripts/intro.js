$(function(){
    $("body").niceScroll({
		scrollspeed: 1,
		mousescrollstep: 2
	});
	$(document).on("keypress", function (e) {
		// use e.which
		if(e.which == 75){
			location.reload();
		}
	});
})