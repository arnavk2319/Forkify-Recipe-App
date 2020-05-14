import Search from './js/models/Search';
import { elements,renderLoader,clearLoader } from './js/views/base';
import * as searchView from './js/views/searchView';
import * as recipeView from './js/views/recipeView';
import * as listView from './js/views/listView';
import * as likesView from './js/views/likesView';
import Recipe from './js/models/Recipe';
import List from './js/models/List';
import Likes from './js/models/Likes';


/*Global state of the app
    - Search object
    - Current Recipe project
    - Shopping list object
    - Liked recipes 
*/

const state  = {};
window.state = state;


/*SEARCH CONTROLLER*/
const controlSearch = async () => {
    // 1) Get the query from the view
    const query = searchView.getInput();

    if(query) {
        // 2) New Search object and add to state
        state.search = new Search(query);                                                           //search is part of the global state object

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResultsList);

        try{
        // 4) Search for recipes
        await state.search.getResults();

        // 5) Render results for UI
        clearLoader();  
        searchView.renderResults(state.search.result);                                              //result is the 'this.result' in Search.js                                            
        }
        catch(error){
            alert("Error loading recipes");
            clearLoader();  
        }                                                   
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);                                            // setting the data attribute 'goto' of the button tags in createButton, 10 for decimal base
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);      
    }
});


/* RECIPE CONTROLLER */

const controlRecipe = async () => {
    // Get the ID from the url
    const id = window.location.hash.replace('#','');

    if(id){
        // Prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if(state.search) {
            searchView.highlightSelected(id);
        }

        // Create a new recipe object
        state.recipe = new Recipe(id);                                                                  // ADDED 'recipe' AS ANOTHER state object like 'search'

        try{
        //Get recipe data and parse the ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        // Calculate servings and time
        state.recipe.calcServings();
        state.recipe.calcTime();

        //Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        }
        catch(error){
            alert("Error processing recipe");
        }
    
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event,controlRecipe));                                  //attaching different events to the same action 


/**
 * LIST CONTROLLER
 */
const controlList = () => {
    //Create a new list if there is none
    if(!state.list) state.list = new List();

    //Add each ingredient to the list and the UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Handle delete and update item events 
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle delete event 
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id);

        //Delete from the UI
        listView.deleteItem(id);
    } 
    // Handle the count update
    else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});




/**
 * LIKES CONTROLLER
 */

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    // User has NOT liked the current selected recipe
    if(!state.likes.isLiked(currentId)){
        // Add like to the state
        const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img);

        // Toggle the like button
        likesView.toggleLikeBtn(true);
        likesView.toggleLikeMenu(state.likes.getNumLikes());

        // Add like to the UI list
        likesView.renderLikeItem(newLike);

    // User has liked the recipe
    } else {
        // Remove the like from the state
        state.likes.deleteLike(currentId);

        // Toggle the like button
        likesView.toggleLikeBtn(false);
        likesView.toggleLikeMenu(state.likes.getNumLikes());

        // Remove the like from the UI list
        likesView.deleteLikeItem(currentId);
    }
    
}



// Restore liked recipes on page load
window.addEventListener('load' , e => {
    state.likes = new Likes();

    // Restore Likes
    state.likes.readStorage();

    // Toggle like button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes 
    state.likes.likes.forEach(like => {
        likesView.renderLikeItem(like);
    })
})


// Hnadling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked 
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        // Increase button is clicked 
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe_btn--add *')){
        // Add ingredients to the shopping list
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Likes controller
        controlLike();
    }
});



