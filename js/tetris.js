var COLS = 10, ROWS = 20;
var board = [];
var score;
const NO_OF_HIGH_SCORES = 10;
const HIGH_SCORES = 'highScores';
var maxScore = 0;
var lose;
var interval;
var intervalRender;
var current; // current moving shape
var currentX, currentY; // position of current shape
var freezed; // is current shape settled on the board?
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];
var colors = [
    'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple'
];

// creates a new 4x4 shape in global variable 'current'
// 4x4 so as to cover the size when the shape is rotated
function newShape() {
    var id = Math.floor( Math.random() * shapes.length );
    var shape = shapes[ id ]; // maintain id for color filling

    current = [];
    for ( var y = 0; y < 4; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                current[ y ][ x ] = id + 1;
            }
            else {
                current[ y ][ x ] = 0;
            }
        }
    }
    
    // new shape starts to move
    freezed = false;
    // position where the shape will evolve
    currentX = 5;
    currentY = 0;
}

// clears the board
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

// keep the element moving down, creating new shapes and clearing lines
function tick() {
    if ( valid( 0, 1 ) ) {
        ++currentY;
    }
    // if the element settled
    else {
        freeze();
        valid(0, 1);
        clearLines();
        if (lose) {
            clearAllIntervals();
            return false;
        }
        newShape();
    }
}

// stop shape at its position and fix it to board
function freeze() {
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
            }
        }
    }
    freezed = true;
}

// returns rotates the rotated shape 'current' perpendicularly anticlockwise
function rotate( current ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
        }
    }

    return newCurrent;
}

// check if any lines are filled and clear them
function clearLines() {
    for ( var y = ROWS - 1; y >= 0; --y ) {
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        if ( rowFilled ) {
            score += 1000;
            if (score > maxScore) { maxScore = score;}
            
            //sessionStorage.setItem(score);
            document.getElementById( 'score' ).innerHTML = 'Score : ' + score;
            document.getElementById( 'clearsound' ).play();
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            ++y;
        }
    }
}

function keyPress( key ) {
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) ) {
                --currentX;
            }
            break;
        case 'right':
            if ( valid( 1 ) ) {
                ++currentX;
            }
            break;
        case 'down':
            if ( valid( 0, 1 ) ) {
                ++currentY;
            }
            break;
        case 'rotate':
            var rotated = rotate( current );
            if ( valid( 0, 0, rotated ) ) {
                current = rotated;
            }
            break;
        case 'drop':
            while( valid(0, 1) ) {
                ++currentY;
            }
            tick();
            break;
    }
}

// checks if the resulting position of current shape will be feasible
function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1 && freezed) {
                        lose = true; // lose if the current shape is settled at the top most row
                        checkHighScore(score);
                        /*localStorage.setItem('score', score);
                        localStorage.setItem('topScore', maxScore);    */
                        document.getElementById('playbutton').disabled = false;
                    } 
                    return false;
                }
            }
        }
    }
    return true;
}


function playButtonClicked() {
    newGame();
    document.getElementById("playbutton").disabled = true;
}

function saveHighScore(score, highScores) {
    const name = prompt('INGRESA UN NOMBRE: ');
    const newScore = { score, name };
    
    // 1. Add to list
    highScores.push(newScore);
  
    // 2. Sort the list
    highScores.sort((a, b) => b.score-a.score);
    
    // 3. Select new list
    highScores.splice(NO_OF_HIGH_SCORES);
    
    // 4. Save to local storage
    localStorage.setItem(HIGH_SCORES, JSON.stringify(highScores));
}

function checkHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES)) ?? [];
    const lowestScore = highScores[NO_OF_HIGH_SCORES-1]?.score ?? 0;
    
    if (score > lowestScore) {
      saveHighScore(score, highScores); 
      //showHighScores();
    }
}



function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES)) ?? [];
    const highScoreList = document.getElementById(HIGH_SCORES);
    
    highScoreList.innerHTML = highScores
      .map((score) => `<li>${score.score}-${score.name}`)
      .join('');
  }

function newGame() {
    clearAllIntervals();
    intervalRender = setInterval( render, 30 );
    init();
    newShape();
    score = 0;
    document.getElementById( 'score' ).innerHTML = 'Score : ' + score;
    lose = false;
    interval = setInterval( tick, 400 );
}

function clearAllIntervals(){
    clearInterval( interval );
    clearInterval( intervalRender );
}

/*let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        deferredPrompt = e;
    });

    const installApp = document.getElementById('installApp');
    installApp.addEventListener('click', async () => {
        if (deferredPrompt !== null) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                deferredPrompt = null;
            }
        }
    });*/

    // Inicializa deferredPrompt para su uso más tarde.

const divInstall = document.getElementById("installContainer");
const butInstall = document.getElementById("butInstall");

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Previene a la mini barra de información que aparezca en smartphones
  e.preventDefault();
  // Guarda el evento para que se dispare más tarde
  deferredPrompt = e;
  // Actualizar la IU para notificarle al usuario que se puede instalar tu PWA
  showInstallPromotion();
  // De manera opcional, envía el evento de analíticos para saber si se mostró la promoción a a instalación del PWA
  console.log(`'beforeinstallprompt' event was fired.`);
});

buttonInstall.addEventListener('click', async () => {
    // Esconde la información promotora de la instalación
    hideInstallPromotion();
    // Muestre el mensaje de instalación
    deferredPrompt.prompt();
    // Espera a que el usuario responda al mensaje
    const { outcome } = await deferredPrompt.userChoice;
    // De manera opcional, envía analíticos del resultado que eligió el usuario
    console.log(`User response to the install prompt: ${outcome}`);
    // Como ya usamos el mensaje, no lo podemos usar de nuevo, este es descartado
    deferredPrompt = null;
  });