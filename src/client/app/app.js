import fetch from "isomorphic-fetch";

(function(){
    'use strict';

    let key = 'aba065d3';
    let q = 'Alien';
    let timeout = null;

    let controller = function controller(view, model){
        this.view = view;
        this.model = model;
    }

    controller.prototype.init = function init(){
        this.view.onLoadGetMovies = this.onLoadGetMovies.bind(this);
        this.view.search = this.onSearch.bind(this);
        this.view.showMovie = this.onShowMovie.bind(this);
    }

    controller.prototype.onLoadGetMovies = function onLoadGetMovies(e){
        this.model.getMovies(this.showMovies.bind(this));
    }

    controller.prototype.onSearch = function onSearch(e){
        var self = this;
        let target = e.currentTarget;
        clearTimeout(timeout);
        timeout = setTimeout(function (){
            q = target.value;
            self.clearMovies();
            self.onLoadGetMovies();
        }, 550);
    }

    controller.prototype.showMovies = function showMovies(model){
        var self = this;
        self.view.render(model); 
    }

    controller.prototype.clearMovies = function clearMovies(){
        this.view.clearView(this.clearMovies.bind(this));
    }

    controller.prototype.onShowMovie = function onShowMovie(e){
        var self = this;

        let target = e.currentTarget;
        let index = target.dataset.index;
        let mid = target.dataset.mid;
        var o = document.querySelectorAll('.open');
        o.forEach(element => {
            element.classList.remove('open');
        });
        target.classList.add('open');
        this.model.getMediaDetail({mid: mid, index: index}, this.xfunc.bind(this));
    }

    controller.prototype.xfunc = function xfunc(model){
        var self = this;
        self.view.showDetails(model); 
    }

    let view = function view(element){
        this.element = element;
        this.getMovie = null;
        this.search = null;
        this.showMovie = null;
    }

    view.prototype.clearView = function clearView(){
        this.element.querySelector("#movies").innerHTML = '<div></div>';
    }

    view.prototype.render = function render(movies){
        var self = this;

        let input = document.getElementById('search');
        input.addEventListener('keyup', this.search);

        if(!movies){
            self.element.querySelector("#error").classList.remove('hidden'); 
            return;
        }

        self.element.querySelector("#error").classList.add('hidden'); 

        movies.forEach(function(movie, index){
            let model = {
                index: index,
                mid: movie.imdbID,
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

            let html = `<div id="M${model.index}" data-index="${model.index}" data-mid="${model.mid}" class="movie__single">
                <div class="movie__thumbnail">
                    <img src="${model.poster}" alt="A movie poster of ${model.title}"> 
                    <p class="movie__title"> ${model.title} </p>
                    <p class="movie__type"> ${model.type} </p>
                    <div id="M${model.index}-details" class="movie__details"></div>
                </div>
            </div>`;
            self.element.querySelector("#movies").insertAdjacentHTML('beforeend', html);
            let el = self.element.querySelector('#M' + model.index);
            el.addEventListener('click', self.showMovie);
            el.addEventListener('mouseover', self.showMovie);
        });

        view.prototype.showDetails = function showDetails(details){
            var self = this;
            let html = `<p class="detail__title"> ${details.title}</p>
                <p class="detail-label">Released</p>
                <p class="detail__year">${details.year}</p>
                <p class="detail-label">Director</p>
                <p class="detail__director">${details.director}</p>
                <p class="detail-label">Rating</p>
                <p class="detail__rating">${details.rating}</p>`

            var el = self.element.querySelector("#M" + details.index + "-details");
            el.innerHTML = html;
        }
    }

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

    model.prototype.getMediaDetail = function getMediaDetail(media, fn){
        var self = this;
        let oReq = new this.XMLHttpRequest();
        if(this.movies[media.index].director != undefined){
            return;
        }
        oReq.onload = function onLoad(e) {
            var r = JSON.parse(e.currentTarget.responseText);
            var movie = self.movies[media.index];
            movie.index = media.index;
            movie.title = r.Title;
            movie.director = r.Director;
            movie.year = r.Year;
            movie.rating = r.Ratings[0].Value;
            fn(movie);
        };
        oReq.open('GET', 'http://www.omdbapi.com/?apikey=aba065d3&i=' + media.mid, true);
        oReq.send();
    }

    model.prototype.getMovie = function getMovie(index, fn){
        var self = this;
        var movies = self.movies;
        var movie = movies[index];
        fn(movie);
    }

    let movieModel = new model(XMLHttpRequest);
    let movieView = new view(document.getElementById('app'));
    let movieController = new controller(movieView, movieModel);

    movieController.init();
    movieController.onLoadGetMovies();

})(); 
