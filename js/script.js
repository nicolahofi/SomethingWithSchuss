/*
    general init function
 */
async function init() {
  // Fetch the ingredients once when the page loads
  ingredients = await fetchAllIngredients();

  // Fetch and display a random drink
  fetchRandomDrink();

  // Clear old localStorage entries
  clearOldLocalStorage();

  // Event listeners
  ingredientInfoBtn.addEventListener('mouseover', function() {
    if (ingredients) {
      ingredientInfoBox.innerHTML = "<b>mögliche Zutaten:</b> " + ingredients;
      ingredientInfoBox.style.display = 'block'; // Show the info box
    }
  });

  ingredientInfoBtn.addEventListener('mouseout', function() {
    ingredientInfoBox.style.display = 'none'; // Hide the info box
  });

  let fetchPersonBtn = document.querySelector('#personalDrinkButton');
  fetchPersonBtn.addEventListener('click', fetchPersonalDrink);

  let searchCocktailsByIngredient = document.querySelector('#searchCocktailsByIngredient');
  searchCocktailsByIngredient.addEventListener('click', searchCocktails);

  document.querySelector('#personalArea').style.display = 'none';
}

init();


// Function to remove localStorage entries older than a week
function clearOldLocalStorage() {
  let aWeekAgo = new Date();
  aWeekAgo.setDate(aWeekAgo.getDate() - 7);

  for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      let keyDate = new Date(key);

      if (keyDate < aWeekAgo) {
          localStorage.removeItem(key);
          i--;
      }
  }
}

// Function to fetch and display a random drink
async function fetchRandomDrink() {
  let today = new Date().toISOString().slice(0, 10);
  let storedDrink = JSON.parse(localStorage.getItem(today));

  if (storedDrink) {
      displayDrink(storedDrink);
  } else {
      let apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
      let data = await fetchData(apiUrl);
      localStorage.setItem(today, JSON.stringify(data.drinks[0]));
      displayDrink(data.drinks[0]);
  }
}

// Function to display a drink
function displayDrink(drink) {
  let drinkImage = drink.strDrinkThumb;
  let drinkName = drink.strDrink;
  let instructions = drink.strInstructionsDE ? drink.strInstructionsDE : drink.strInstructions;
  let ingredients = [];

  for (let i = 1; i <= 15; i++) {
      let ingredient = drink['strIngredient' + i];
      let measure = drink['strMeasure' + i];
      measure = converter(measure);

      if (ingredient && measure) {
          ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
      }
  }

  document.getElementById('drinkImage').src = drinkImage;
  document.getElementById('drinkName').textContent = `${drinkName}`;
  document.getElementById('drinkInstructions').textContent = `${instructions}`;
  document.getElementById('drinkIngredients').innerHTML = ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
}


/*
    Function to fetch and display a personalized drink
 */
async function fetchPersonalDrink() {

  document.querySelector('#personalArea').style.display = 'block';
  let name = document.getElementById('nameInput').value.trim();

  if (!name) {
      document.getElementById('persDrinkError').textContent = `Gib din nama ii.`;
      document.querySelector('#personalArea').style.display = 'none';
  } else {
      document.getElementById('persDrinkError').textContent = '';
  }

  let firstLetter = name.charAt(0).toLowerCase();
  let apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${firstLetter}`;
  let data = await fetchData(apiUrl);
  let drinks = data.drinks;

  if (drinks && drinks.length > 0) {
      let randomIndex = Math.floor(Math.random() * drinks.length);
      let drink = drinks[randomIndex];
      displayPersonalDrink(drink, name);
  } else {
      document.getElementById('persDrinkName').textContent = `Tschuldigung, ${name} hüt gits nüt für di.`;
  }
}

// Function to display a personalized drink
function displayPersonalDrink(drink, name) {
  let drinkName = drink.strDrink;
  let instructions = drink.strInstructionsDE ? drink.strInstructionsDE : drink.strInstructions;
  let ingredients = [];

  for (let i = 1; i <= 15; i++) {
      let ingredient = drink['strIngredient' + i];
      let measure = drink['strMeasure' + i];
      measure = converter(measure);

      if (ingredient && measure) {
          ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
      }
  }

  // remove img if already existing
  let existingImg = document.getElementById('persDrinkImg');
  if (existingImg) {
    existingImg.remove();
  }

  let persDrinkImg = document.createElement('img');
  persDrinkImg.id = 'persDrinkImg';
  persDrinkImg.src = drink.strDrinkThumb;
  persDrinkImg.alt = drinkName;

  document.getElementById('persDrinkImgDiv').appendChild(persDrinkImg);
  // document.getElementById('persDrinkName').textContent = `Diis persönlicha Gsöff für ${name}: ${drinkName}`;
  document.getElementById('persDrinkName').textContent = `${drinkName}`;
  document.getElementById('persDrinkInstructions').textContent = `Zubereitung: ${instructions}`;
  document.getElementById('persDrinkIngredients').innerHTML = ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
}




// get all possible ingredients for the info box

let ingredientInfoBtn = document.querySelector('#info-icon');
let ingredientInfoBox = document.querySelector('#info-ingredients'); // Assuming you have an element to display the info
let ingredients = null;

async function fetchAllIngredients() {
  const url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
  const data = await fetchData(url);
  const drinks = data.drinks;

  let ingredients = new Set();

  drinks.forEach(drink => {
    for (let i = 1; i <= 15; i++) {
      let ingredient = drink['strIngredient' + i];
      if (ingredient) {
        ingredients.add(ingredient.trim().toLowerCase());
      }
    }
  });

  let ingredientsArray = Array.from(ingredients);
  let ingredientsString = ingredientsArray.join(', ');
  return ingredientsString;
}

// Fetch the ingredients once when the page loads
window.addEventListener('load', async function() {
  ingredients = await fetchAllIngredients();
});




/*
    Function to search cocktails by ingredients
 */

async function searchCocktails() {
  let ingredientsInput = document.getElementById('ingredientsInput').value.trim();

  if (!ingredientsInput) {
      document.getElementById('leftoverDrinkError').innerText = 'muasch zerst öppis iigeh';
      return;
  } else {
      document.getElementById('leftoverDrinkError').innerText = '';
  }

  let ingredients = ingredientsInput.split(',').map(ingredient => ingredient.trim());
  let allDrinks = [];

  for (let ingredient of ingredients) {
      let apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;
      let data = await fetchData(apiUrl);

      if (data) {
          allDrinks = allDrinks.concat(data.drinks);
      }
  }

  let finalDrinks = allDrinks.filter(drink => {
      let count = allDrinks.filter(d => d.strDrink === drink.strDrink).length;
      return count === ingredients.length;
  });

  let uniqueFinalDrinks = finalDrinks.filter((drink, index) => index === finalDrinks.findIndex(d => d.strDrink === drink.strDrink));

  if (uniqueFinalDrinks.length === 0) {
      document.getElementById('leftoverDrinkError').innerText = 'Mit dera Zuatat gits kai Gsöff. (du alki)';
  } else {
      displayCocktails(uniqueFinalDrinks);
  }
}




// Function to display found cocktails
function displayCocktails(drinks) {
  let cocktailContainer = document.getElementById('cocktailTable');
  cocktailContainer.innerHTML = ''; // Clear previous results

 drinks.forEach(drink => {
  let drinkDiv = document.createElement('div');
  drinkDiv.classList.add('drink');

  let image = document.createElement('img');
  image.src = drink.strDrinkThumb;
  image.alt = drink.strDrink + " Image";
  drinkDiv.appendChild(image);

  let nameLink = document.createElement('a');
  nameLink.href = '#';
  nameLink.textContent = drink.strDrink;

  let detailsVisible = false;
  let detailsElement = null;

  nameLink.addEventListener('click', async function(e) {
    e.preventDefault();

    if (!detailsVisible) {
      let apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`;
      let data = await fetchData(apiUrl);
      let details = data.drinks[0];
      detailsElement = document.createElement('div');

      let instruction = document.createElement('p');
      let insturction = details.strInstructionsDE ? details.strInstructionsDE : details.strInstructions;
      instruction.innerHTML = `<p>Zubereitung: ${insturction}</p>`;
      let ingredientsList = document.createElement('ul');
      ingredientsList.innerHTML = getIngredientsList(details);

      detailsElement.appendChild(instruction);
      detailsElement.appendChild(ingredientsList);
      nameLink.parentElement.appendChild(detailsElement);

      detailsVisible = true;
    } else {
      detailsElement.remove();
      detailsVisible = false;
    }
  });

  drinkDiv.appendChild(nameLink);
  cocktailContainer.appendChild(drinkDiv);
});

}

function getIngredientsList(details) {
  let ingredients = [];
  for (let i = 1; i <= 15; i++) {
    let ingredient = details['strIngredient' + i];
    let measure = details['strMeasure' + i];
    measure = converter(measure);
    if (ingredient && measure) {
      ingredients.push(`<li>${measure.trim()} ${ingredient.trim()}</li>`);
    }
  }
  return ingredients.join('');
}

// Function to convert measure units
function converter(measure) {
  if (measure && measure.toLowerCase().includes('oz')) {
    measure = measure.replace('oz', '').trim();
    if (measure == "1/2") measure = 0.5;
    let number = parseFloat(measure);
    if (!isNaN(number)) {
      let convertedMeasure = number * 29.5735;
      convertedMeasure = Math.ceil(convertedMeasure / 5) * 5;
      return `${convertedMeasure} ml`;
    }
  }
  if (measure && measure.toLowerCase().includes('tsp')) {
    measure = measure.replace('tsp', 'Teelöfel').trim();
  }

  return measure;
}

// Function to fetch data from API
async function fetchData(url) {
  try {
      let response = await fetch(url);
      let data = await response.json();
      console.log(data);
      return data;
  } catch (error) {
      console.log(error);
      return null;
  }
}