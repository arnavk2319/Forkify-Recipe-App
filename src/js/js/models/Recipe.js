import axios from 'axios';

export default class Recipe {
    constructor(id){                            // each recipe is identified by an ID
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;                                         // this.ingredients is an Array
        }
        catch(error){
            console.log(error);
            alert(error);
        }
    }

    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3) ;                                                     //assuming it takes 50 mins to cook one recipe
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces' , 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [... unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {                                         // 'map' returns an array, adding new ingredients to this array for each of the different items and then assigning the new igredients added to "this.ingredients" 
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, index) => {                                                    // 'unit' is the 'el' here
                ingredient = ingredient.replace(unit, units[index]);
            })

            // 2) Remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));                     // findIndex method takes a callback as an arg, in this case, where the ingredient name is determined whether it is in the unitsShort array , and wherever found true that index will be returned to the 'unitIndex' parameter

            let finalObjectIngredient;
            if(unitIndex > -1){
                // There is a unit
                const arrCount = arrIng.slice(0, unitIndex);                                            // Eg. 4 1/2 cups, arrCount will be an array which is [4,1/2]
                let count;

                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-','+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));                                 // eval("4+1/2") --> 4.5
                }

                finalObjectIngredient = {
                    count : count,
                    unit: arrIng[unitIndex],
                    ingredient : arrIng.slice(unitIndex + 1).join(' ')
                };

            } else if(parseInt(arrIng[0], 10)) {
                // There is NO unit, but the 1st element is a number
                finalObjectIngredient = {
                    count : parseInt(arrIng[0], 10),
                    unit : '',
                    ingredient: arrIng.slice(1).join(' ')
                };
            } else if(unitIndex === -1){
                // There is no unit and no number in the 1st position
                finalObjectIngredient = {
                    count : 1,
                    unit: '',
                    ingredient : ingredient
                };
            }

            return finalObjectIngredient;                                                                      // return the value of 'ingredient' to 'newIngredients'
        });

        this.ingredients = newIngredients;
    }


    updateServings(type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        }); 

        this.servings = newServings;
    }

}