var data = {
	active: initText,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Oranienbaum', 'Nunito Sans:900,700,500,300']}
};

WebFont.load(data);
$( window ).resize(function() {
    setOalls();
});

var oallht;
var oallwth;
var oallctr;
var useOverlay = true;
var lightnessmod = 1.2;

function initText(){

	setOalls();
}

function setOalls(){
	 oallht = $(window).height();
	 oallwth = $(window).width(); 
	 oallctr = {x: (oallwth/2), y: (oallht/2) };
}

$(function(){
		$('#menu').slicknav({
			label: '',
			prependTo:'.menucontainer'
		});
		$('#menu').css({
			display: 'none'
		});
	});