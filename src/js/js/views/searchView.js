import { elements } from './base';

export const getInput = () => elements.searchInput.value; 

export const clearInput= () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResultsList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelector('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
}

export const limitRecipeTitle = (title, limit = 17) => {                                                       //no need to pass limit argument in the function call whereever as it is constant given argument
    const newTitle = [];
    if(title.length > limit) {
        title.split(' ').reduce((acc,curr) => {
            if(acc + curr.length <= limit) {
                newTitle.push(curr);
            }
            return acc + curr.length;

        }, 0);

        return `${newTitle.join(' ')}...`;                                          //join is the opposite of the split function
    }
    return title;
}

// type : 'prev' or 'next', this function returns the entire markup
const createButton = (pageNo, type) => `                                            
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? pageNo - 1 : pageNo + 1}>
        <span>Page ${type === 'prev' ? pageNo - 1 : pageNo + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
    `;


const renderRecipe = recipe => {
    const markup = 
    `<li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>                                                        
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>`;

    elements.searchResultsList.insertAdjacentHTML('beforeend',markup);
}

const renderPageButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults/resPerPage);
    let button;

    if(page === 1){
        // Button to go to next page
        button = createButton(page, 'next');
    }
    else if(page < pages){                                                              
        // Both next and prev buttons, here the value of the 'page' variable in being set from the data attribute 'goto' 
        // goto's value is set in createButton and then that value is used in the event listener in the index.js file
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    }
    else if(page === pages && pages > 1){
        //on last page, only button to go to prev page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //render results of current page
    const start = (page - 1) * resPerPage ;                                                     // start and end indices
    const end = (page) * resPerPage;

    recipes.slice(start,end).forEach(renderRecipe);                                             // displaying only 10 recipes

    // render pagination buttons
    renderPageButtons(page,recipes.length,resPerPage);
};