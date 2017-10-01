var data = {
	active: initText,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500']}
};

WebFont.load(data);
//Dev: dust compilation
var _co_template = $('#co-template').html();
var cocompiled = dust.compile(_proj_template, 'PROJECT');

dust.loadSource(cocompiled);

$( window ).resize(function() {
    setOalls();
});

var oallht;
var oallwth;
var oallctr;
var useOverlay = true;
var lightnessmod = 1.2;

function setOalls(){
	 oallht = $(window).height();
	 oallwth = $(window).width(); 
	 oallctr = {x: (oallwth/2), y: (oallht/2) };
}


