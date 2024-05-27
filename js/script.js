
//Grundfunktionen
async function init() {

  // Fetch and display a random drink
  fetchRandomDrink();

  // Clear old localStorage entries
  clearOldLocalStorage();

  // Event listeners
  // Fetch the ingredients once when the page loads
  let ingredientInfoBtn = document.querySelector('#info-icon');
  let ingredientInfoBox = document.querySelector('#info-ingredients'); // Assuming you have an element to display the info
  let ingredients = null;

  ingredients = await fetchAllIngredients();

  function setupIngredientInfoEvents(ingredientInfoBtn, ingredientInfoBox, ingredients) {
    // Function to detect if the user is on a mobile device
    function isMobileDevice() {
      return /Mobi|Android/i.test(navigator.userAgent);
    }
  
    if (isMobileDevice()) {
      // For mobile devices, use 'click' event on both the button and the info box
      ingredientInfoBtn.addEventListener('click', function() {
        if (ingredients) {
          if (ingredientInfoBox.style.display === 'block') {
            ingredientInfoBox.style.display = 'none';
          } else {
            ingredientInfoBox.innerHTML = "<b>mögliche Zutaten:</b> " + ingredients;
            ingredientInfoBox.style.display = 'block';
          }
        }
      });
  
      ingredientInfoBox.addEventListener('click', function() {
        ingredientInfoBox.style.display = 'none';
      });
  
    } else {
      // For non-mobile devices, use 'mouseover' and 'mouseout' events
      ingredientInfoBtn.addEventListener('mouseover', function() {
        if (ingredients) {
          ingredientInfoBox.innerHTML = "<b>mögliche Zutaten:</b> " + ingredients;
          ingredientInfoBox.style.display = 'block';
        }
      });
  
      ingredientInfoBtn.addEventListener('mouseout', function() {
        ingredientInfoBox.style.display = 'none';
      });
    }
  }
  
  setupIngredientInfoEvents(ingredientInfoBtn, ingredientInfoBox, ingredients);
      

  let fetchPersonBtn = document.querySelector('#personalDrinkButton');
  fetchPersonBtn.addEventListener('click', fetchPersonalDrink);

  let searchCocktailsByIngredient = document.querySelector('#searchCocktailsByIngredient');
  searchCocktailsByIngredient.addEventListener('click', searchCocktails);

  document.querySelector('#personalArea').style.display = 'none';

  // build team info
  team();
}


// execute init function when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
  init();
});


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


// Function to display team info
function team() {
  var teamMembers = document.getElementsByClassName('teamMember');
  var isMobile = window.matchMedia('(max-width: 1080px)').matches;

  for (var i = 0; i < teamMembers.length; i++) {
    (function(i) {
      var img = teamMembers[i].getElementsByTagName('img')[0];
      var info = teamMembers[i].getElementsByClassName('teaminfo')[0];

      if (isMobile) {
        img.addEventListener('click', function() {
          if (info.style.display === 'block') {
            info.style.display = 'none';
          } else {
            info.style.display = 'block';
          }
        });
      } else {
        img.addEventListener('mouseover', function() {
          info.style.display = 'block';
        });

        img.addEventListener('mouseout', function() {
          info.style.display = 'none';
        });
      }
    })(i);
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

  document.getElementById('drinkImage').src = drinkImage;
  document.getElementById('drinkName').textContent = `${drinkName}`;
  document.getElementById('drinkInstructions').textContent = `${instructions}`;
  document.getElementById('drinkIngredients').innerHTML = getIngredientsList(drink);
}


//Function to fetch and display a personalized drink
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
      displayPersonalDrink(drink);
  } else {
      document.getElementById('persDrinkError').textContent = `Tschuldigung, ${name} hüt gits nüt für di.`;
      document.querySelector('#personalArea').style.display = 'none';
  }
}


// Function to display a personalized drink
function displayPersonalDrink(drink) {
  
  // remove img if already existing
  let existingImg = document.getElementById('persDrinkImg');
  if (existingImg) {
    existingImg.remove();
  }

  // build personal drink image
  let persDrinkImg = document.createElement('img');
  persDrinkImg.id = 'persDrinkImg';
  persDrinkImg.src = drink.strDrinkThumb;
  persDrinkImg.alt = drink.strDrink;

  document.getElementById('persDrinkImgDiv').appendChild(persDrinkImg);
  document.getElementById('persDrinkName').textContent = `${drink.strDrink}`;
  document.getElementById('persDrinkInstructions').textContent = `${drink.strInstructionsDE ? drink.strInstructionsDE : drink.strInstructions}`;
  document.getElementById('persDrinkIngredients').innerHTML = getIngredientsList(drink);
}


// get all possible ingredients for the info box
async function fetchAllIngredients() {
  const url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
  const data = await fetchData(url);
  const drinks = data.drinks;

  let ingredients = [];

  drinks.forEach(drink => {
    for (let i = 1; i <= 15; i++) {
      let ingredient = drink['strIngredient' + i];
      if (ingredient) {
        ingredients.push(ingredient.trim().toLowerCase());
      }
    }
  });

  let ingredientsString = ingredients.join(', ');
  return ingredientsString;
}


//Function to search cocktails by ingredients
async function searchCocktails() {
  let ingredientsInput = document.getElementById('ingredientsInput').value.trim();

  // error handling
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
      document.getElementById('leftoverDrinkError').innerText = 'Mit dera Zuatat gits kai Gsöff. (du Alki)';
  } else {
      displayCocktails(uniqueFinalDrinks);
  }
}


// Function to display found cocktails
function displayCocktails(drinks) {
  let cocktailContainer = document.getElementById('cocktailTable');
  cocktailContainer.innerHTML = '';

  drinks.forEach(drink => {
  let drinkDiv = document.createElement('div');
  drinkDiv.classList.add('drink');

  let image = document.createElement('img');
  image.src = drink.strDrinkThumb;
  image.alt = drink.strDrink + " Image";
  drinkDiv.appendChild(image);

  // build name link
  let nameLink = document.createElement('a');
  nameLink.href = '#';
  nameLink.textContent = drink.strDrink;

  // add br tag
  let br = document.createElement('br');
  drinkDiv.appendChild(br);

  let detailsVisible = false;
  let detailsElement = null;

  // click on name link
  nameLink.addEventListener('click', async function(e) {
    e.preventDefault();

    if (!detailsVisible) {
      let apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`;
      let data = await fetchData(apiUrl);
      let details = data.drinks[0];
      detailsElement = document.createElement('div');

      // build instruction
      let instruction = document.createElement('div');
      let instructionTitle = document.createElement('h4');
      instructionTitle.textContent = 'Zubereitung';
      let instructionText = document.createElement('p');
      instructionText.style.color = '#888';
      instructionText.textContent = details.strInstructionsDE ? details.strInstructionsDE : details.strInstructions;
      
      instruction.appendChild(instructionTitle);
      instruction.appendChild(instructionText);

      // build ingredients list
      let ingredients = document.createElement('div');
      let ingredientsTitle = document.createElement('h4');
      ingredientsTitle.textContent = 'Zutaten';
      ingredientsTitle.style.color = 'white';
      let ingredientsList = document.createElement('ul');
      ingredientsList.innerHTML = getIngredientsList(details);

      ingredients.appendChild(ingredientsTitle);
      ingredients.appendChild(ingredientsList);


      detailsElement.appendChild(instruction);
      detailsElement.appendChild(ingredients);
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


// function to get ingredients list
function getIngredientsList(details) {
  let ingredients = [];
  for (let i = 1; i <= 15; i++) {
    let ingredient = details['strIngredient' + i];
    let measure = details['strMeasure' + i];
    measure = converter(measure);
    if (ingredient && measure) {
      ingredients.push(`<li>${measure.trim()} ${ingredient.trim()}</li>`);
    } else if (ingredient) {
      ingredients.push(`<li>${ingredient.trim()}</li>`);
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
    measure = measure.replace('tsp', 'Tl').trim();
  }
  if (measure && measure.toLowerCase().includes('tblsp')) {
    measure = measure.replace('tblsp', 'El').trim();
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