import fetch from "isomorphic-fetch";

(function(){
    'use strict';

    //let apiKey = process.env.API_KEY;
    let apiKey = 'aba065d3';
    let q = 'Alien';
    let url = 'http://www.omdbapi.com/?apikey=' + apiKey + '&s=' + q;

    

    // --- Controller ---
    // Handles events between the view and model 
    let controller = function controller(view, model){
        this.view = view;
        this.model = model;
    }

    controller.prototype.init = function init(){
        this.view.onLoadGetMovies = this.onLoadGetMovies.bind(this);
    }

    controller.prototype.onLoadGetMovies = function onLoadGetMovies(e){
        console.log("On load get movies..");
        this.model.getMovies(this.showMovies.bind(this));
    }

    controller.prototype.onClickGetMovie = function onClickGetMovie(e){
        console.log(e);
        let target = e.currentTarget;
        let index =  parseInt(target.dataset.index, 10);
        this.model.getMovie(index, this.showMovie.bind(this));
    }

    controller.prototype.onSearch = function onSearch(e){
        this.model.getMovies(this.showMovies.bind(this));
    }

    controller.prototype.showMovies = function showMovies(model){
        var self = this;
        model.forEach(function(movie, index){
            let model = {
                index: index,
                title: movie.Title,
                type: movie.Type,
                poster: movie.Poster
            }
            if(model.type === 'game'){
                return;
            }
            if(model.poster === 'N/A'){
                model.poster = require('../img/no-poster.png');
            }
            self.view.render(model); 
        });
    }

    controller.prototype.clearMovies = function clearMovies(){
        this.view.clear(this.clearMovies.bind(this));
    }

    controller.prototype.showMovie = function showMovie(model){
        var self = this;
        console.log(model);
    }

    // --- View ---
    // Handles DOM manipulations
    let view = function view(element){
        this.element = element;
        this.getMovie = null;
    }

    view.prototype.render = function render(model){
        let type = model.type;
        let html = `<div id="M${model.index}" data-index="${model.index}" class="movie__single">
                        <div class=" movie__thumbnail">
                            <img src=" ${model.poster} "> 
                            <p class="movie__title"> ${model.title} </p>
                            <p class="movie__type"> ${model.type} </p>
                        </div>
                    </div>`;
        this.element.insertAdjacentHTML('beforeend', html);
        let el = this.element.querySelector('#M' + model.index);

        el.addEventListener('click', function(){
            console.log("model", model);
        });
    }

    view.prototype.clear = function clear(){
        this.element.innerHTML = '<div></div>';
    }

    // --- Model ---
    // Get data from GET request
    let model = function model(XMLHttpRequest){
        this.XMLHttpRequest = XMLHttpRequest;
    }

    model.prototype.getMovies = function getMovies(fn){
        var self = this;
        let oReq = new this.XMLHttpRequest();
        oReq.onload = function onLoad(e) {
            self.movies = JSON.parse(e.currentTarget.responseText).Search;
            fn(self.movies);
        };
        oReq.open('GET', 'http://www.omdbapi.com/?apikey=aba065d3&s=' + q, true);
        oReq.send();
    };

    model.prototype.getMovie = function getMovie(index, fn){
        var self = this;
        var movies = self.movies;
        var movie = movies[index];
        fn(movie);
    }

    let movieModel = new model(XMLHttpRequest);
    let movieView = new view(document.getElementById('movies'));
    let movieController = new controller(movieView, movieModel);

    movieController.init();
    movieController.onLoadGetMovies();

    let input = document.getElementById('search');
    let timeout = null;

    input.addEventListener('keyup', function(e){
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            console.log('Input Value:', input.value);
            q = input.value;
            movieController.clearMovies();
            movieController.model.getMovies(movieController.showMovies.bind(movieController));
        }, 500);
    });
})(); 