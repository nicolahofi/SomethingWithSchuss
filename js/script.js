
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
    fetchRandomDrink();
}

async function fetchRandomDrink() {
  const apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
    let data = await fetchData(apiUrl);
    // store the drink in local storage
    localStorage.setItem(today, JSON.stringify(data.drinks[0]));
    displayDrink(data.drinks[0]);
}

// Funktion zum Anzeigen des zufälligen Getränks auf der Seite
function displayDrink(drink) {
    // get infos from drink object
  let drinkImage = drink.strDrinkThumb;
  let drinkName = drink.strDrink;
  let instructions = drink.strInstructionsDE;
  let ingredients = [];
  for (let i = 1; i <= 15; i++) {
    let ingredient = drink['strIngredient' + i];
    let measure = drink['strMeasure' + i];
    measure = converter(measure);
    if (ingredient && measure) {
      ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
    }
  }

  // display drink on page
  document.getElementById('drinkImage').src = drinkImage;
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
      document.getElementById('personalDrink').textContent = `Tschuldigung, ${name} hüt gits nüt für di.`;
    }

  }

  // Funktion zum Anzeigen des personalisierten Getränks auf der Seite
  function displayPersonalDrink(drink) {
    let drinkName = drink.strDrink;
    let instructions = drink.strInstructionsDE;
    let ingredients = [];
    for (let i = 1; i <= 15; i++) {
      let ingredient = drink['strIngredient' + i];
      let measure = drink['strMeasure' + i];
      measure = converter(measure);
      if (ingredient && measure) {
        ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
      }
    }

    // drink

    let persDrinkImg = document.getElementById('persDrinkImg');
    if (persDrinkImg) {
      persDrinkImg.remove();
    }
    persDrinkImg = document.createElement('img');
    persDrinkImg.id = 'persDrinkImg';
    persDrinkImg.src = drink.strDrinkThumb;
    persDrinkImg.alt = drinkName;

    // display drink on page
    document.getElementById('persDrinkName').insertAdjacentElement('afterend', persDrinkImg);
    document.getElementById('persDrinkName').textContent = `Diis persönlicha Gsöff für ${document.getElementById('nameInput').value.trim()}: ${drinkName}`;
    document.getElementById('persDrinkInstructions').textContent = `Zubereitung: ${instructions}`;
    document.getElementById('persDrinkIngredients').innerHTML = ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');


  }

function converter(measure) {
  if (measure && measure.toLowerCase().includes('oz')) {
    return measure.replace('oz', 'ml');
  } 
  return measure;
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
    let allDrinks = [];
    for (let ingredient of ingredients) {
      let apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;
      let data = await fetchData(apiUrl);
      if (data !== null) {
        allDrinks = allDrinks.concat(data.drinks);
      }
    }

    let finalDrinks = allDrinks.filter(drink => {
      let count = allDrinks.filter(d => d.strDrink === drink.strDrink).length;
      return count === ingredients.length;
    });

    // remove duplicates
    let uniqueFinalDrinks = finalDrinks.filter((drink, index) => {
      return index === finalDrinks.findIndex(d => d.strDrink === drink.strDrink);
    });
    
    if (uniqueFinalDrinks.length === 0) {
      // Error handling
      document.getElementById('cocktailTable').innerText = 'Mit dera Zuatat gits kai Gsöff. (du alki)';
    } else {
      displayCocktails(uniqueFinalDrinks);
    }
  }

  // Funktion zum Anzeigen der gefundenen Cocktails
  function displayCocktails(drinks) {
    let cocktailTable = document.getElementById('cocktailTable');
    cocktailTable.innerHTML = ''; // Clear previous results

    let table = document.createElement('table');
    let tbody = document.createElement('tbody');

    drinks.forEach(function(drink) {
      let row = document.createElement('tr');

      // Bild
      let drinkCell = document.createElement('td');
      let image = document.createElement('img');
      image.src = drink.strDrinkThumb;
      image.alt = drink.strDrink + " Image";
      drinkCell.appendChild(image);

      // Name (Link)
      let nameLink = document.createElement('a');
      // nameLink.href = drink.idDrink;
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

          let instructions = details.strInstructionsDE;
          let ingredients = [];
          for (let i = 1; i <= 15; i++) {
            let ingredient = details['strIngredient' + i];
            let measure = details['strMeasure' + i];
            measure = converter(measure);
            if (ingredient && measure) {
              ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
            }
          }
      
      
          // display drink on page
          let instruction = document.createElement('p');
          instruction.innerHTML = `<p>Zubereitung: ${instructions}</p>`;
          let ingredientsList = document.createElement('ul');
          ingredientsList.innerHTML = ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');

          detailsElement.appendChild(instruction);
          detailsElement.appendChild(ingredientsList);

          nameLink.parentElement.appendChild(detailsElement);

          detailsVisible = true;
        } else {
          detailsElement.remove();
          detailsVisible = false;
        }
        

      });

      drinkCell.appendChild(nameLink);

      row.appendChild(drinkCell);

      tbody.appendChild(row);
  });

  table.appendChild(tbody);
  cocktailTable.appendChild(table);
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
