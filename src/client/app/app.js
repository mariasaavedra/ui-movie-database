(function(){
    'use strict';
   // would move this into a .env file in production. 
    let key = 'aba065d3';
    let q = 'Alien'; // setting up the initial query for the movie Alien, so it searches on page load.
    let timeout = null;

    const MEDIA_TYPE = {
        "GAME": "game",
        "MOVIE": "movie",
        "TV": "series",
        "NONE": "N/A"
    }

    let controller = function controller(view, model){
        this.view = view;
        this.model = model;
    }

    controller.prototype.init = function init(){
        this.view.onLoadGetMovies = this.onLoadGetMovies.bind(this);
        this.view.search = this.onSearch.bind(this);
        this.view.showMovie = this.onShowMovie.bind(this);
        this.view.hideMovie = this.onHideMovie.bind(this);
    }

    controller.prototype.onLoadGetMovies = function onLoadGetMovies(e){
        // make a search on page load, so page isn't empty.
        this.model.getMovies(this.showMovies.bind(this));
    }

    controller.prototype.onSearch = function onSearch(e){
        let self = this;
        let target = e.currentTarget;
        clearTimeout(debounce);
        // set a timeout so user has finished typing before firing a search.
        debounce = setTimeout(function (){
            q = target.value;
            self.clearMovies();
            self.onLoadGetMovies();
        }, 550);
    }

    controller.prototype.showMovies = function showMovies(model){
        let self = this;
        self.view.render(model); 
    }

    controller.prototype.clearMovies = function clearMovies(){
        // on a new search clear the view from previous movies/shows
        this.view.clearView(this.clearMovies.bind(this));
    }

    controller.prototype.onShowMovie = function onShowMovie(e){
        let self = this;
        let target = e.currentTarget;
        // these are the data attributes that every movie element is given.
        let index = target.dataset.index;
        let mid = target.dataset.mid;

        // add the open class to element that was selected or moused over.
        target.classList.add('open');
        // makes request to get details on that movie/show
        this.model.getMediaDetail({mid: mid, index: index}, this.showMovieDetails.bind(this));
    }

    controller.prototype.onHideMovie = function onHideMovie(e){
        let self = this;
        let target = e.currentTarget;
        // remove the open class to element that was selected or moused over.
        target.classList.remove('open');
    }

    controller.prototype.showMovieDetails = function xfunc(model){
        let self = this;
        self.view.showDetails(model); 
    }

    let view = function view(element){
        this.element = element;
        this.search = null;
        this.showMovie = null;
    }

    view.prototype.clearView = function clearView(){
        this.element.querySelector("#movies").innerHTML = '<div></div>';
    }

    view.prototype.render = function render(movies){
        let self = this;
        // listen for when the user makes a search
        let input = document.getElementById('search');
        input.addEventListener('keyup', this.search);

        // if there was an error loading movies, display the error message
        if(!movies){
            self.element.querySelector("#error").classList.remove('hidden'); 
        } else {
            self.element.querySelector("#error").classList.add('hidden'); 
        }
        // this foreach might be better in the model function, converting the response json.
        if (movies !== undefined){
            movies.forEach(function(movie, index){
                let model = {
                    index: index,
                    mid: movie.imdbID,
                    title: movie.Title,
                    type: movie.Type,
                    poster: movie.Poster
                }
                if(model.type === MEDIA_TYPE.GAME){  
                    return;
                }
                // if the poster in unavaible, use this one.
                if(model.poster === MEDIA_TYPE.NONE){
                    model.poster = require('../img/no-poster.png');
                }
                // this is the HTML for our movie/show title.
                let html = `<div id="M${model.index}" data-index="${model.index}" data-mid="${model.mid}" class="movie__single">
                    <div class="movie__thumbnail">
                        <img src="${model.poster}" alt="A movie poster of ${model.title}"> 
                        <p class="movie__title"> ${model.title} </p>
                        <p class="movie__type"> ${model.type} </p>
                        <div id="M${model.index}-details" class="movie__details"></div>
                    </div>
                </div>`;
                // insert our movie/show html into the #movies container
                self.element.querySelector("#movies").insertAdjacentHTML('beforeend', html);

                let movieCells = document.querySelectorAll("#movies > .movie__single");

                // show movie/show details whenever they're clicked or moused over.
                movieCells.forEach(function(el){
                    el.addEventListener('click', self.showMovie);
                    el.addEventListener('mouseenter', self.showMovie);
                    el.addEventListener('mouseleave', self.hideMovie);
                });
            });
        }
    }
        
    view.prototype.showDetails = function showDetails(details){
        let self = this;
        let html = `<p class="detail__title"> ${details.title}</p>
            <p class="detail-label">Released</p>
            <p class="detail__year">${details.year}</p>
            <p class="detail-label">Director</p>
            <p class="detail__director">${details.director}</p>
            <p class="detail-label">Rating</p>
            <p class="detail__rating">${details.rating}</p>`
        // add html (details) to movie/show element that was selected or moused over.  
        let el = self.element.querySelector("#M" + details.index + "-details");
        el.innerHTML = html;
    }
    
    // our model will be constructed from a request.
    let model = function model(XMLHttpRequest){
        this.XMLHttpRequest = XMLHttpRequest;
    }

    var oReq = null;
    model.prototype.getMovies = function getMovies(fn){
        let self = this;
        if (oReq){
            oReq.abort();
        }
        oReq = new this.XMLHttpRequest();
        oReq.onload = function onLoad(e) {
            self.movies = JSON.parse(e.currentTarget.responseText).Search;
            fn(self.movies); // render
        };
        oReq.open('GET', 'http://www.omdbapi.com/?apikey=aba065d3&s=' + q, true);
        oReq.send();
    };

    // gets results from search of a paticular movie/show
    var oReq = null;
    model.prototype.getMediaDetail = function getMediaDetail(media, fn){
        let self = this;
        if (oReq){
            oReq.abort();
        }
        oReq = new this.XMLHttpRequest();
        if(this.movies[media.index].director != undefined){
            return;
        }
        oReq.onload = function onLoad(e) {
            let r = JSON.parse(e.currentTarget.responseText);
            let movie = self.movies[media.index];
            movie.index = media.index;
            movie.title = r.Title;
            movie.director = r.Director;
            movie.year = r.Year;
            movie.rating = r.Ratings[0].Value;
            fn(movie); // render
        };
        oReq.open('GET', 'http://www.omdbapi.com/?apikey=aba065d3&i=' + media.mid, true);
        oReq.send();
    }

    let movieModel = new model(XMLHttpRequest);
    let movieView = new view(document.getElementById('app'));
    let movieController = new controller(movieView, movieModel);

    movieController.init();
    movieController.onLoadGetMovies();

})(); 
