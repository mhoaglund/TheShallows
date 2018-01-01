var data_location = 'https://s3.amazonaws.com/shallows/current_array.json';
var data = {
	active: set_time,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500']}
};

WebFont.load(data);
//Dev: dust compilation
var _obj_template = $('#obj-template').html();
var cocompiled = dust.compile(_obj_template, 'ARR_OBJ');

function getProjectData(myUrl){
	var result = null;
	$.ajax( { url: myUrl, 
		type: 'GET', 
		dataType: 'json',
        crossDomain: true,
		contentType: 'application/json',
		async: true,
		cache: false,
		data: '',
		success: function(data) { 
			datamain = clean_and_supplement(data);
			displayAll(datamain, '#objecthost', 'ARR_OBJ', function(){
				console.log("done");
				$('.array-object').each(function(){
                    //TODO attach anything we need for draggable shit down there
				});
			});
		},
		error: function(data){
			alert("problem");
		}
	});
	return result;
}

function displayAll(_data, _target, _template = 'CH_ORD', _cb = null){
	dust.render(_template, _data, function(err, out) {
        $(_target).html(out);
		if(_cb )_cb();
	});
}

function clean_and_supplement(data){
	data['alpha_board'] = letter_of_alphabet(data['board'][0], true);

	data['results'].forEach(function(element) {
		var moves = element['order']['moves'];
		if(moves.length > 0){
			moves.forEach(function(_move){
				_move["alphabetized"] = [];
				_move["alphabetized"][0] = letter_of_alphabet(_move.from[0]-1, false) + _move.from[1].toString();
				_move["alphabetized"][1] = letter_of_alphabet(_move.to[0]-1, false) + _move.to[1].toString();
			});
		}
	});
	return data;
}

$(function(){
    
    getObjectData(data_location);
    
    interact('.draggable')
    .draggable({
        inertia: false,
        restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        autoScroll: false,
        onmove: dragMoveListener,
        onend: function (event) {}
    });

    function dragMoveListener (event) {
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
    window.dragMoveListener = dragMoveListener;
    interact('.dropzone').dropzone({
        accept: '.draggable',
        overlap: 0.75,
        ondropactivate: function (event) {
            event.target.classList.add('drop-active');
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget,
                dropzoneElement = event.target;
            dropzoneElement.classList.add('drop-target');
            draggableElement.classList.add('can-drop');
            draggableElement.textContent = 'Dragged in';
        },
        ondragleave: function (event) {
            event.target.classList.remove('drop-target');
            event.relatedTarget.classList.remove('can-drop');
            event.relatedTarget.textContent = 'Dragged out';
        },
        ondrop: function (event) {
            event.relatedTarget.textContent = 'Dropped';
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-active');
            event.target.classList.remove('drop-target');
        }
  });
})
