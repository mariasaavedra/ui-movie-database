export class Model {
    constructor(XMLHttpRequest){
        this.XMLHttpRequest = XMLHttpRequest;
        this.key = 'aba065d3';
        this.q = 'Alien';
        this.oReq = null;
    }
}

Model.prototype.getMovies = function getMovies(fn){
    let self = this;
    if (self.oReq){
        self.oReq.abort();
    }
    self.oReq = new this.XMLHttpRequest();
    self.oReq.onload = function onLoad(e) {
        self.movies = JSON.parse(e.currentTarget.responseText).Search;
        fn(self.movies); // render
    };
    self.oReq.open('GET', 'http://www.omdbapi.com/?apikey=aba065d3&s=' + self.q, true);
    self.oReq.send();
};

// gets results from search of a paticular movie/show
Model.prototype.getMediaDetail = function getMediaDetail(media, fn){
    let self = this;
    if (self.oReq){
        self.oReq.abort();
    }
    self.oReq = new this.XMLHttpRequest();
    if(this.movies[media.index].director != undefined){
        return;
    }
    self.oReq.onload = function onLoad(e) {
        let r = JSON.parse(e.currentTarget.responseText);
        let movie = self.movies[media.index];
        movie.index = media.index;
        movie.title = r.Title;
        movie.director = r.Director;
        movie.year = r.Year;
        movie.rating = r.Ratings[0].Value;
        fn(movie); // render
    };
    self.oReq.open('GET', 'http://www.omdbapi.com/?apikey=aba065d3&i=' + media.mid, true);
    self.oReq.send();
}