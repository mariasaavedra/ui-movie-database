import {Controller} from './controller.js';
import {View} from './view.js';
import {Model} from './model.js';

(function(){
    'use strict';

    let movieModel = new Model(XMLHttpRequest);
    let movieView = new View(document.getElementById('app'));
    let movieController = new Controller(movieView, movieModel);

    movieController.init();
    movieController.onLoadGetMovies();

})(); 
