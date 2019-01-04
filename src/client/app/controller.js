export class Controller {
    constructor(view, model){
        this.view = view;
        this.model = model;
    }
}

Controller.prototype.init = function init(){
    this.view.onLoadGetMovies = this.onLoadGetMovies.bind(this);
    this.view.search = this.onSearch.bind(this);
    this.view.showMovie = this.onShowMovie.bind(this);
    this.view.hideMovie = this.onHideMovie.bind(this);
}

Controller.prototype.onLoadGetMovies = function onLoadGetMovies(e){
    // make a search on page load, so page isn't empty.
    this.model.getMovies(this.showMovies.bind(this));
}

Controller.prototype.onSearch = function onSearch(e){
    let self = this;
    let target = e.currentTarget;
    if(self.debounce){
        clearTimeout(self.debounce);
    }
    // set a timeout so user has finished typing before firing a search.
    self.debounce = setTimeout(function (){
        q = target.value;
        self.clearMovies();
        self.onLoadGetMovies();
    }, 550);
}

Controller.prototype.showMovies = function showMovies(model){
    let self = this;
    self.view.render(model); 
}

Controller.prototype.clearMovies = function clearMovies(){
    // on a new search clear the view from previous movies/shows
    this.view.clearView(this.clearMovies.bind(this));
}

Controller.prototype.onShowMovie = function onShowMovie(e){
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

Controller.prototype.onHideMovie = function onHideMovie(e){
    let self = this;
    let target = e.currentTarget;
    // remove the open class to element that was selected or moused over.
    target.classList.remove('open');
}

Controller.prototype.showMovieDetails = function xfunc(model){
    let self = this;
    self.view.showDetails(model); 
}