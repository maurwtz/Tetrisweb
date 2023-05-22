
var COLS = 10, ROWS = 20;
var board = [];
var score;
var linea; //cantidas de lineas completadas
var name;
var player;
var ranking;
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

//SPLASH
const splash = document.querySelector(".splash");

document.addEventListener("DOMContentLoaded", (e)=>{
    setTimeout(()=>{
        splash.classList.add("display-none");
    }, 2000)
})


// MOTION SENSORS
const movementCooldown = 500; //cooldown entre movimientos
let lastMovementTime = 0; // 

once = true;

window.addEventListener('deviceorientation', handleOrientation);

function handleOrientation(event) {
  const alpha = event.alpha;
  const beta = event.beta;
  const gamma = event.gamma;
  
}

// Register event listener for device orientation changes
window.addEventListener('deviceorientation', handleOrientation);

// Function to handle device orientation changes
function handleOrientation(event) {
  // Extract rotation data from event object
  var alpha = event.alpha; // Rotation around the z-axis (0 to 360 degrees)
  var beta = event.beta; // Rotation around the x-axis (-180 to 180 degrees)
  var gamma = event.gamma; // Rotation around the y-axis (-90 to 90 degrees)

  //
  if (once){
    initialGamma = gamma;
    initialAlpha = alpha;
    initialBeta = beta;

    once = false;
  }
    
  

  //DEBUG
  document.getElementById('gamma-value').textContent = 'Gamma: ' + parseFloat(initialGamma).toFixed(2);
  document.getElementById('alpha-value').textContent = 'Alpha: ' + parseFloat(initialAlpha).toFixed(2);
  document.getElementById('beta-value').textContent = 'Beta: ' + parseFloat(initialBeta).toFixed(2);

  const currentTime = Date.now();

  if (currentTime - lastMovementTime >= movementCooldown) {
        // Update the last movement time
        lastMovementTime = currentTime;
        if (alpha < initialAlpha-10) { // 0 browsre - 30 phone
            console.log("Right")
            // Tilted to the right
            moveRight(); // Move Tetris piece right
        } else if (alpha > initialAlpha+10) { // 0 browser - -30 phone
            console.log("Left")
            // Tilted to the left
            moveLeft(); // Move Tetris piece left
        } else if (beta > initialBeta+10) { // 90 browser - 120 phone
            console.log("Down")
            // Tilted down
            moveDown(); // Move Tetris piece down
        } else if (beta < initialBeta-10) { // 90 browser - 70 phone
            console.log("Up")
            // Tilted up
            moveRotate(); // Rotate Tetris piece
        }
    }
}



//WEBSOCKET

const webSocket = new WebSocket("wss://ucpgames-api.azurewebsites.net/multiplayer");

webSocket.onopen = (event) => {
    console.log(event.data);
  };

webSocket.onmessage = (event) => {
    var listRank = '';
    rankingGame = JSON.parse(event.data);
    console.log(rankingGame);

    rankingGame.events[0].players.sort((a, b) => b.value - a.value);

    for (let index = 0; index < rankingGame.events[0].players.length; index++) {
        var p = rankingGame.events[0].players[index];
        listRank+= '<li>' + p.name + ' puntos ('+ p.value +')</li>';
        
    }
    
    var listado = document.getElementById("mp");

    listado.innerHTML = listRank;
};
//listRank.sort((a, b) => a.value-b.value);



function sendText(){  

  const msg = {
    game: "Tetrisweb",
    event: "lineas",
    value: 1,
    player: name,
  };
  console.log(msg)
  webSocket.send(JSON.stringify(msg));
  
  console.log("llego acá");
  
}


//GAME
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
            linea += 1;
            if (score > maxScore) { maxScore = score;}
            
            // Aca puede haber un event para multiplayer, enviar datos al websocket
            sendText();

            document.getElementById( 'score' ).innerHTML = 'SCORE ' + score;
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
    name = prompt('INGRESA UN NOMBRE: ');
    newGame();
    document.getElementById("playbutton").disabled = true;
}

function saveHighScore(score, highScores) {
    const newScore = { score, name };
    player = name;
    //sendText(); // envia el score al websocket

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
      
    }
}

function receiveSocket(){
    
}


function newGame() {
    clearAllIntervals();
    intervalRender = setInterval( render, 30 );
    init();
    newShape();
    linea = 0;
    score = 0;
    document.getElementById( 'score' ).innerHTML = 'SCORE  ' + score;
    lose = false;
    interval = setInterval( tick, 400 );
}

function clearAllIntervals(){
    clearInterval( interval );
    clearInterval( intervalRender );
}

const divInstall = document.getElementById("installContainer");
const butInstall = document.getElementById("butInstall");


window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile.
    event.preventDefault();
    console.log('👍', 'beforeinstallprompt', event);
    // Stash the event so it can be triggered later.
    window.deferredPrompt = event;
    // Remove the 'hidden' class from the install button container.
    divInstall.classList.toggle('hidden', false);
  });

  butInstall.addEventListener('click', async () => {
    console.log('👍', 'butInstall-clicked');
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      // The deferred prompt isn't available.
      return;
    }
    // Show the install prompt.
    promptEvent.prompt();
    // Log the result
    const result = await promptEvent.userChoice;
    console.log('👍', 'userChoice', result);
    // Reset the deferred prompt variable, since
    // prompt() can only be called once.
    window.deferredPrompt = null;
    // Hide the install button.
    divInstall.classList.toggle('hidden', true);
  });

  window.addEventListener('appinstalled', (event) => {
    console.log('👍', 'appinstalled', event);
    // Clear the deferredPrompt so it can be garbage collected
    window.deferredPrompt = null;
  });