// Array to store highscores
var highscores = [];

// Function to load highscores from localStorage
function loadHighscores() {
    var storedHighscores = localStorage.getItem('highScores');
    if (storedHighscores) {
        highscores = JSON.parse(storedHighscores);
    }
}

// Function to save highscores to localStorage
function saveHighscores() {
    localStorage.setItem('highscores', JSON.stringify(highscores));
}

// Function to add a highscore to the list
function addHighscore(name, score) {
    var newHighscore = {name: name, score: score};
    highscores.push(newHighscore);
    highscores.sort(function(a, b) {
        return b.score - a.score;
    });
    if (highscores.length > 10) {
        highscores.pop();
    }
    saveHighscores();
}

// Function to display highscores on screen
function displayHighscores() {
    var highscoresList = document.getElementById('highscores');
    highscoresList.innerHTML = '';
    for (var i = 0; i < highscores.length; i++) {
        var highscore = highscores[i];
        var listItem = document.createElement('li');
        listItem.textContent = highscore.name + ': ' + highscore.score;
        highscoresList.appendChild(listItem);
    }
}

// Function to reset highscores
function resetHighscores() {
    highscores = [];
    localStorage.clear();
    saveHighscores();
    displayHighscores();
}

// Load highscores and display them when the page loads
loadHighscores();
displayHighscores();