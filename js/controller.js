document.body.onkeydown = function( e ) {
    var keys = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate',
        32: 'drop'
    };


    if ( typeof keys[ e.keyCode ] != 'undefined' ) {
        keyPress( keys[ e.keyCode ] );
        render();
    }
};


let btnRotate = document.getElementById("butRotar");
let btnDown = document.getElementById("butAbajo");
let btnRight = document.getElementById("butDerecha");
let btnLeft = document.getElementById("butIzquierda");




btnDown.addEventListener("click", function( e )  {
    
    moveDown();
});
btnRight.addEventListener("click", () => {
    moveRight();
});
btnLeft.addEventListener("click", () => {
    moveLeft();
});
btnRotate.addEventListener("click", () => {
    rotate();
});




function moveLeft(){
    keyPress( 'left');
    render();
}
function moveRight(){
    keyPress( 'right');
    render();
}
function moveDown(){
    keyPress( 'down' );
    render();
}
function rotate(){
    keyPress( 'rotate');
    render();
}
