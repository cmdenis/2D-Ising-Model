// 2D Ising Model Simulation (Metropolis)
// By Christian M. Denis

// This was made after taking PHYS-362: Statistical Mechanics at McGill in Winter 2021
// I think this is a pretty cool model that gives rize to really awesome shapes.

// Feel free to share, modify, scramble, cut into small little bits, copy,
// take pictures of, obssess over, question, sell for your own benefit, tear appart,
// or study this code.

// By no means is this code particularly innovative, but hopefully it can
// be a cool thing to have, especially since it's easier to open in a browser then
// getting your hands dirty in the command line and such...
// I highly recommend section 8.2 in "An Introduction To Thermal Physics" by Daniel V. Schroeder to get
// a nice explanation of what this code does. The pseudo-code example in this same section is
// pretty much what the code here is doing.

// I've tried to comment as much as I can as so to make the program clearer. If you're confused about
// JavaScript and all that stuff, I invite you to go watch this playlist, which helped me tremendously
// when I was starting off: https://youtube.com/playlist?list=PLpPnRKq7eNW3We9VdCfx9fprhqXHwTPXL
// I find it to be a pretty cool tool to make websites and this kind of portable user friendly applications.


// Stuff to create the "canvas"
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var scaler = 3;
canvas.width = window.innerWidth*0.8*scaler;
canvas.height = window.innerHeight*0.8*scaler;



function Site(){
    /* Constructor to generate each individual site of the Ising grid */

    //this.spin = 1; // All the sites start with a spin up

    this.spin = (Math.floor(Math.random()-0.5)+1)*2 -1;

    this.changeSpin = function() {
        /* Method that changes the spin */
        this.spin = -this.spin;
    }
}

// Simulation parameters

var temp = 2                  // Temperature
var kb = 1                      //
var magn = 1
var switchPerTimeStep = 30      // Number of picked sites per time step

// Creating the array that will contain all the sites

var nb_x_sites = 30;
var nb_y_sites = 30;

var isingGrid = new Array(nb_x_sites);      // First creating the rows

for (var i = 0; i < nb_x_sites; i++) {      // Looping over all the rows and putting the collumn in them
    isingGrid[i] = new Array(nb_y_sites)
    for (var j = 0; j < nb_y_sites; j++) {
        
        isingGrid[i][j] = new Site();      // Building all the actual sites
    
    }
}



function checkEnergy(grid, x_pos, y_pos) {
    /* Function that checks the energy difference of flipping the spin */

    var switchSpin = 2*grid[x_pos][y_pos].spin;

    var up = switchSpin * grid[x_pos][(y_pos + 1) % nb_y_sites].spin;
    var down = switchSpin * grid[x_pos][(((y_pos - 1) % nb_y_sites) + nb_y_sites) % nb_y_sites].spin;
    var right = switchSpin * grid[(x_pos + 1) % nb_x_sites][y_pos].spin;
    var left = switchSpin * grid[(((x_pos - 1) % nb_x_sites) + nb_x_sites) % nb_x_sites][y_pos].spin;

    return (up + down + right + left)*magn;
}

function switchDecision(gridSwitchDecision, checkX, checkY) {
    /* Function to make the spins switch using the Metropolis algorithm */

    var energyDifference = checkEnergy(gridSwitchDecision, checkX, checkY);

    if(energyDifference <= 0) {             // Energy difference is smaller then 0 (so flips automatically)
        gridSwitchDecision[checkX][checkY].changeSpin();

        return true;
    }

    else{                                   // Energy difference is bigger, so need to check with boltzman factor
        var probability = Math.exp(-energyDifference / (kb * temp));
        var boolSwitch = (Math.random() < probability);


        if(boolSwitch) {
            gridSwitchDecision[checkX][checkY].changeSpin();

            return true;

        }
        return boolSwitch;
    }
}

function pickSite(gridPickSite, switchPerTime){
    var siteToSwitch = []; // Array in which all the sites to switch are contained

    for(var i = 0; i < switchPerTime; i++){
        var rando_x = Math.floor(Math.random()*(nb_x_sites - 0.00000001));
        var rando_y = Math.floor(Math.random()*(nb_y_sites - 0.00000001));

        if(switchDecision(gridPickSite, rando_x, rando_y)){ // Stores the location in siteToSwitch if there is a switch, but doesn't if there is none.
            siteToSwitch.push([rando_x, rando_y]);
        }
    }
    return siteToSwitch;
}

// Now we must actually draw the image and run the animmation

function draw(siteList){
    /* Changes the spins given a list of sites to change. */

    var blockSizeX = canvas.width/nb_x_sites
    var blockSizeY = canvas.height/nb_y_sites


    for(var i = 0; i < siteList.length; i++){

        upDown = (isingGrid[siteList[i][0]][siteList[i][1]].spin + 1)/2

        if(upDown == 1){

            ctx.fillRect(siteList[i][0]*blockSizeX, siteList[i][1]*blockSizeY, blockSizeX, blockSizeY);
        }
        else if(upDown == 0){
            ctx.clearRect(siteList[i][0]*blockSizeX, siteList[i][1]*blockSizeY, blockSizeX, blockSizeY);
        }
    }
}

function drawGrid(){
    /* Function to draw a grid with appropriate size and lines. */
    var blockSizeX = canvas.width/nb_x_sites
    var blockSizeY = canvas.height/nb_y_sites

    for(var i = 0; i<nb_x_sites+2; i++){
        ctx.moveTo(i*blockSizeX, 0);
        ctx.lineTo(i*blockSizeX, canvas.height);  
    }
    for(var i=0; i<nb_y_sites; i++){
        ctx.moveTo(0, i*blockSizeY);
        ctx.lineTo(canvas.width, i*blockSizeY);
    }
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawInit(grid){
    /* Function to draw the initial layout of the spins. 
    It's no use to update all the of the sites later on. Only the ones which changes
    need to be adjusted. */

    initList = [];
    for(var i = 0; i<nb_x_sites; i++){
        for(var j=0; j<nb_y_sites; j++){
            initList.push([i, j]);
        }
    }
    draw(initList);
}


//
//  NOW THE ANIMATION BEGINS
//

// First, we clear the canvas
ctx.clearRect(0, 0, innerWidth, innerHeight)

// Then, we draw the initial configuration of the spins
drawInit();

// This is the recursive animation function that will redraw the canvas to create the animation.
function animate() {
    requestAnimationFrame(animate);

    draw(pickSite(isingGrid, switchPerTimeStep));  // Draws the sites that are changed

    // This is the part to calculate the magnetization per spin of the lattice
    var netMagnetization = 0;       
    for(var i = 0; i<nb_x_sites; i++){
        for(var j=0; j<nb_y_sites; j++){
            netMagnetization += isingGrid[i][j].spin;
        }
    }
    var magPerSpin = Math.round(netMagnetization/(nb_x_sites*nb_y_sites)*100)/100;
    document.getElementById("magnetization").innerHTML = "magnetization per spin: " + magPerSpin;  // Outputs the magnetization per spin
}

animate()












