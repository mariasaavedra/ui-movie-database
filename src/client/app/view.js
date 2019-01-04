export class View {
    constructor(element){
        this.element = element;
        this.search = null;
        this.showMovie = null;
    }
}

const MEDIA_TYPE = {
    "GAME": "game",
    "MOVIE": "movie",
    "TV": "series",
    "NONE": "N/A"
}

View.prototype.clearView = function clearView(){
    this.element.querySelector("#movies").innerHTML = '<div></div>';
}

View.prototype.render = function render(movies){
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
    
View.prototype.showDetails = function showDetails(details){
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