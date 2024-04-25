
/* 
  RANDOM DRINK OF THE DAY
*/

// Überprüfen, ob der heutige zufällige Drink bereits im LocalStorage gespeichert ist
const today = new Date().toISOString().slice(0, 10);
const storedDrink = JSON.parse(localStorage.getItem(today));
if (storedDrink) {
    // display the stored drink
  displayDrink(storedDrink);
} else {
    // fetch a new random drink
    const apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
    fetchData(apiUrl);
}

// Funktion zum Anzeigen des zufälligen Getränks auf der Seite
function displayDrink(drink) {
    // get infos from drink object
  const drinkName = drink.strDrink;
  const instructions = drink.strInstructionsDE;
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink['strIngredient' + i];
    const measure = drink['strMeasure' + i];
    if (ingredient && measure) {
      ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
    }
  }

  // display drink on page
  document.getElementById('drinkName').textContent = `Gsöff vom Tag: ${drinkName}`;
  document.getElementById('drinkInstructions').textContent = `Zubereitung: ${instructions}`;
  document.getElementById('drinkIngredients').innerHTML = ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
}



/*
  SEARCH DRINK BY NAME
*/

// Funktion zum Abrufen eines personalisierten Drinks von der CocktailDB-API basierend auf dem eingegebenen Vornamen
async function fetchPersonalDrink() {

    // get name from input field
    const name = document.getElementById('nameInput').value.trim();
    if (!name) {
      alert('Please enter your first name.');
      return;
    }
    let firstLetter = name.charAt(0).toLowerCase();
    let apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${firstLetter}`;

    let data = await fetchData(apiUrl);
    drinks = data.drinks;
    if (drinks && drinks.length > 0) {
      let randomIndex = Math.floor(Math.random() * drinks.length);
      let drink = drinks[randomIndex];
      displayPersonalDrink(drink);
    } else {
      document.getElementById('personalDrink').textContent = `Tschuldigung, hüt gits nüt für di: ${name}.`;
    }

  }

  // Funktion zum Anzeigen des personalisierten Getränks auf der Seite
  function displayPersonalDrink(drink) {
    const drinkName = drink.strDrink;
    const instructions = drink.strInstructionsDE;
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = drink['strIngredient' + i];
      const measure = drink['strMeasure' + i];
      if (ingredient && measure) {
        ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
      }
    }

    document.getElementById('personalDrink').innerHTML = `
      <p>Diis persönlicha Gsöff für ${document.getElementById('nameInput').value.trim()}: ${drinkName}</p>
      <p>Zubereitung: ${instructions}</p>
      <ul>${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
    `;
  }



  /*
    LEFTOVER DRINK BY INGREDIENTS
  */

  // Funktion zum Suchen von Cocktails basierend auf den eingegebenen Zutaten
  async function searchCocktails() {
    let ingredientsInput = document.getElementById('ingredientsInput').value.trim();
    if (!ingredientsInput) {
        document.getElementById('cocktailList').innerHTML = '<li>No cocktails found with the specified ingredient.</li>';
      return;
    }
    let ingredients = ingredientsInput.split(',').map(ingredient => ingredient.trim());

    // API-Anfrage für Cocktails mit den angegebenen Zutaten
    let apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredients.join(',')}`;
    let data = await fetchData(apiUrl);
    if (data === null) {
      // Error handling
      document.getElementById('cocktailList').innerText = 'Mit dera Zuatat gits kai Gsöff. (du alki)';
    } else {
      displayCocktails(data.drinks);
    }
  }

  // Funktion zum Anzeigen der gefundenen Cocktails
  function displayCocktails(cocktails) {
    let cocktailList = document.getElementById('cocktailList');
    cocktailList.innerHTML = ''; // Clear previous results
    cocktails.forEach(cocktail => {
      let cocktailName = cocktail.strDrink;
      let listItem = document.createElement('li');
      listItem.textContent = cocktailName;
      cocktailList.appendChild(listItem);
    });
  }




// get data from api
async function fetchData(url) {
    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log(data);
        return data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}