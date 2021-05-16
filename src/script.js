const COORD_SIZE = 1000;
let canvas = null;
let context = null;
let inputBuffer = {};
let previousTime = null;
let maze = [];
let maze_size = null;
let myCharacter = null;
let myStairs = null;
let visited = [];
let exitpath = [];
let breadcrumbs = []
let time = 0;
let score = 0;
let displayHint = false;
let displayBreadcrumbs = true;
let displayPath = false;
let displaySign = false;
let charXPos = 0;
let charYPos = 0;
let stairXPos = 0;
let stairYPos = 0;
let signOpacity = 0.2;
let speed = .005;



let imgFloor = new Image();
imgFloor.isReady = false;
imgFloor.src = '../images/floor-pattern-2.jpg';
imgFloor.onload = function() {
    this.isReady = true;
};

let puddle = new Image();
puddle.isReady = false;
puddle.src = '../images/puddle.png';
puddle.onload = function() {
    this.isReady = true;
};

let light = new Image();
light.isReady = false;
light.src = '../images/lightbulb.png';
light.onload = function() {
    this.isReady = true;
};

let radioactive = new Image();
radioactive.isReady = false;
radioactive.src = '../images/radioactive.png';
radioactive.onload = function() {
    this.isReady = true;
};

function loadImages() {
    myCharacter = function(imageSource, location) {
        let image = new Image();
        image.isReady = false;
        image.onload = function() {
            this.isReady = true;
        };
        image.src = imageSource;
        return {
            location: location,
            image: image
        };
    }('../images/suit.png', maze[charXPos][charYPos]);


    myStairs = function(imageSource, location) {
        let image = new Image();
        image.isReady = false;
        image.onload = function() {
            this.isReady = true;
        };
        image.src = imageSource;
        return {
            location: location,
            image: image
        };
    }('../images/stairs.png', maze[stairXPos][stairYPos]);
}



function drawCell(cell) {
    if (imgFloor.isReady) {
        context.save();
        context.globalAlpha = 0.5;
        context.drawImage(imgFloor,
            cell.x * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size),
            COORD_SIZE / maze_size + 0.5, COORD_SIZE / maze_size + 0.5);
        context.restore()
    }

    if (displayBreadcrumbs && cell.breadcrumb) {
        context.save();
        context.globalAlpha = 0.5;
        context.drawImage(puddle,
            cell.x * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size),
            COORD_SIZE / maze_size + 0.5, COORD_SIZE / maze_size + 0.5);
        context.restore()
    }

    if (displayPath && cell.path) {
        context.save();
        context.globalAlpha = 0.2;
        context.drawImage(light,
            cell.x * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size),
            COORD_SIZE / maze_size + 0.5, COORD_SIZE / maze_size + 0.5);
        context.restore()
    }

    if (displayHint && cell.hint) {
        context.save();
        context.globalAlpha = 0.2;
        context.drawImage(light,
            cell.x * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size),
            COORD_SIZE / maze_size + 0.5, COORD_SIZE / maze_size + 0.5);
        context.restore()
    }

    if (cell.edges.n === 1) {
        context.moveTo(cell.x * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size));
        context.lineTo((cell.x + 1) * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size));
    }

    if (cell.edges.s === 1) {
        context.moveTo(cell.x * (COORD_SIZE / maze_size), (cell.y + 1) * (COORD_SIZE / maze_size));
        context.lineTo((cell.x + 1) * (COORD_SIZE / maze_size), (cell.y + 1) * (COORD_SIZE / maze_size));
    }

    if (cell.edges.e === 1) {
        context.moveTo((cell.x + 1) * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size));
        context.lineTo((cell.x + 1) * (COORD_SIZE / maze_size), (cell.y + 1) * (COORD_SIZE / maze_size));
    }

    if (cell.edges.w === 1) {
        context.moveTo(cell.x * (COORD_SIZE / maze_size), cell.y * (COORD_SIZE / maze_size));
        context.lineTo(cell.x * (COORD_SIZE / maze_size), (cell.y + 1) * (COORD_SIZE / maze_size));
    }
}

function renderMaze() {  

    context.beginPath();
    for (let row = 0; row < maze_size; row++) {
        for (let col = 0; col < maze_size; col++) {
            drawCell(maze[row][col]);
        }
    }        
    context.closePath();
    
    context.lineWidth = 6;
    context.lineCap = 'round';
    context.strokeStyle = '#444';
    context.stroke();
}

async function generateMaze() {
    maze.length = 0;

    for (let row = 0; row < maze_size; row++) {
        maze.push([]);
        for (let col = 0; col < maze_size; col++) {
            maze[row].push({
                x: col, 
                y: row, 
                path: false,
                hint: false,
                breadcrumb: false,
                edges: {
                    n: 1,
                    s: 1,
                    w: 1,
                    e: 1
                }
            });
        }
    }

    frontier = []
    added = []
    
    added.push(maze[0][0])

    while (added.length < (maze_size * maze_size)) {

        // Loop through all cells in the maze and add their neighbors to the frontier
        for (cell in added) {
            let x = added[cell].x
            let y = added[cell].y
            // East
            if (x + 1 < maze_size && added.indexOf(maze[y][x+1]) == -1 && frontier.indexOf(maze[y][x+1]) == -1) {
                frontier.push(maze[y][x+1]);
            }

            // South
            if (y + 1 < maze_size && added.indexOf(maze[y+1][x]) == -1 && frontier.indexOf(maze[y+1][x]) == -1) {
                frontier.push(maze[y+1][x]);
            }

            // West
            if (x - 1 >= 0 && added.indexOf(maze[y][x-1]) == -1 && frontier.indexOf(maze[y][x-1]) == -1) {
                frontier.push(maze[y][x-1]);
            }

            // North
            if (y - 1 >= 0 && added.indexOf(maze[y-1][x]) == -1 && frontier.indexOf(maze[y-1][x]) == -1) {
                frontier.push(maze[y-1][x]);
            }
        }
        
        // Choose a random cell in the frontier, add it to the maze, and remove it from the frontier
        added.push(frontier[Math.floor(Math.random() * frontier.length)]);
        frontier.splice(frontier.indexOf(added[added.length - 1]), 1);

        // Choose a random wall from the last added cell and update the maze object so that wall is not rendered
        wallAdded = false;
        while(!wallAdded) {
            let randWall = (Math.floor(Math.random() * 4));
            let lastAdded = added[added.length - 1];
            // console.log(lastAdded.y + ", " + lastAdded.x);

            if (randWall == 0 && lastAdded.y - 1 >= 0 && added.includes(maze[lastAdded.y - 1][lastAdded.x])) {
                maze[lastAdded.y][lastAdded.x].edges.n = 0;
                maze[lastAdded.y - 1][lastAdded.x].edges.s = 0;
                wallAdded = true;
                // console.log("North");
            }
            else if (randWall == 1 && lastAdded.x + 1 < maze_size && added.includes(maze[lastAdded.y][lastAdded.x + 1])) {
                maze[lastAdded.y][lastAdded.x].edges.e = 0;
                maze[lastAdded.y][lastAdded.x + 1].edges.w = 0;
                wallAdded = true;
                // console.log("East");
            }
            else if (randWall == 2 && lastAdded.y + 1 < maze_size && added.includes(maze[lastAdded.y + 1][lastAdded.x])) {
                maze[lastAdded.y][lastAdded.x].edges.s = 0;
                maze[lastAdded.y + 1][lastAdded.x].edges.n = 0;
                wallAdded = true;
                // console.log("South");
            }
            else if (randWall == 3 && lastAdded.x - 1 >= 0 && added.includes(maze[lastAdded.y][lastAdded.x - 1])) {
                maze[lastAdded.y][lastAdded.x].edges.w = 0;
                maze[lastAdded.y][lastAdded.x - 1].edges.e = 0;
                wallAdded = true;
                // console.log("West");
            } 
        }
    }
}


function findExit() {
    let startx = myCharacter.location.x;
    let starty = myCharacter.location.y;
    let endx = myStairs.location.x;
    let endy = myStairs.location.y;

    for (let row = 0; row < maze_size; row++) {
        for (let col = 0; col < maze_size; col++) {
            maze[col][row].path = false;
            maze[col][row].hint = false;
        }
    }        
    exitpath.length = 0;
    
    visited = [];
    for (let row = 0; row < maze_size; row++) {
        visited.push([]);
        for (let col = 0; col < maze_size; col++) {
            visited[row].push(false);
        }
    }

    DFS(startx, starty, endx, endy);
    
    
    for (cell in exitpath) {
        maze[exitpath[cell].y][exitpath[cell].x].path = true;
    } 
    if (exitpath.length >= 2) {
        maze[exitpath[exitpath.length - 2].y][exitpath[exitpath.length - 2].x].hint = true;
    }
}

function DFS(x, y, endx, endy) {
    visited[y][x] = true;    

    if (x == endx && y == endy) {
        exitpath.push({x: x, y: y})
        return true;
    }

    // North
    if (y - 1 >= 0 && !visited[y - 1][x] && maze[y][x].edges.n == 0) {
        if (DFS(x, y - 1, endx, endy)) {
            exitpath.push({x: x, y: y});
            return true;
        }
    }

    // East
    if (x + 1 < maze_size && !visited[y ][x + 1] && maze[y][x].edges.e == 0) {
        if (DFS(x + 1, y, endx, endy)) {
            exitpath.push({x: x, y: y});
            return true;
        }
    }

    // South
    if (y + 1 < maze_size && !visited[y + 1][x] && maze[y][x].edges.s == 0) {
        if (DFS(x, y + 1, endx, endy)) {
            exitpath.push({x: x, y: y});
            return true;
        }
    }

    // West
    if (x - 1 >= 0 && !visited[y][x - 1] && maze[y][x].edges.w == 0) {
        if (DFS(x - 1, y, endx, endy)) {
            exitpath.push({x: x, y: y});
            return true;
        }
    }
}


function renderCharacter(character) {
    if (character.image.isReady) {
        context.drawImage(
            character.image,
            character.location.x * (COORD_SIZE / maze_size), 
            character.location.y * (COORD_SIZE / maze_size),
            (COORD_SIZE / maze_size),
            (COORD_SIZE / maze_size),
        );
    }
}

function renderSign(image) {
    if (image.isReady && displaySign) {
        context.save();
        context.globalAlpha = signOpacity;
        context.drawImage(
            image,
            COORD_SIZE / 2 - COORD_SIZE / 7,
            COORD_SIZE / 2 - COORD_SIZE / 8,
            COORD_SIZE / 3.5,
            COORD_SIZE / 4,
        );
        context.restore();
    }        
}


function processInput() {
    for (input in inputBuffer) {
        moveCharacter(inputBuffer[input], myCharacter);
    }
    inputBuffer = {};
}


function moveCharacter(key, character) {
    if (key === 'ArrowDown' || key === 'k' || key === 's') {
        if (character.location.edges.s == 0) {
            maze[character.location.y][character.location.x].breadcrumb = true;
            character.location = maze[character.location.y + 1][character.location.x];
        }
    }
    if (key == 'ArrowUp' || key === 'i' || key === 'w') {
        if (character.location.edges.n == 0) {
            maze[character.location.y][character.location.x].breadcrumb = true;
            character.location = maze[character.location.y - 1][character.location.x];
        }
    }
    if (key == 'ArrowRight' || key === 'l' || key === 'd') {
        if (character.location.edges.e == 0) {
            maze[character.location.y][character.location.x].breadcrumb = true;
            character.location = maze[character.location.y][character.location.x + 1];
        }
    }
    if (key == 'ArrowLeft' || key === 'j' || key === 'a') {
        if (character.location.edges.w == 0) {
            maze[character.location.y][character.location.x].breadcrumb = true;
            character.location = maze[character.location.y][character.location.x - 1];
        }
    }

    if (key == 'h') {
        displayHint = !displayHint;
    }

    if (key == 'b') {
        displayBreadcrumbs = !displayBreadcrumbs;
    }

    if (key == 'p') {
        displayPath = !displayPath;
    }

    if (key == 'f') {
        displaySign = !displaySign;
    }
}


function update(elapsedTime) {
    time += elapsedTime / 1000;
    document.getElementById('time-display').innerHTML = time.toFixed(0);
    document.getElementById('score-display').innerHTML = score.toFixed(0);
    document.getElementById('high-score-display').innerHTML = localStorage.getItem('high-score');

    // console.log(signOpacity)
    signOpacity += elapsedTime * speed;
    if (signOpacity < .1) {
        speed = .001
    } 
    if (signOpacity > .5) {
        console.log(speed)
        speed = -.001
    }

    if (myCharacter.location.x == myStairs.location.x && myCharacter.location.y == myStairs.location.y) {
        score += maze_size * maze_size - time;
        if (score > localStorage.getItem('high-score')) {
            localStorage.setItem('high-score', score.toFixed(0));
        }
        time = 0;
        startGameLoop();
    }

    if (displayHint || displayPath) {
        findExit();
    }
}


function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    renderSign(radioactive);
    renderMaze();
    renderCharacter(myStairs);
    renderCharacter(myCharacter);
}


function gameLoop(time) {
    let elapsedTime = time - previousTime;
    previousTime = time;

    processInput();
    update(elapsedTime);
    render();

    requestAnimationFrame(gameLoop);
}


function initialize() {
    canvas = document.getElementById('main-canvas');
    context = canvas.getContext('2d');
    previousTime = performance.now(); 
    maze_size = 5;

    if (localStorage.getItem('high-score') === null) {
        localStorage.setItem('high-score', 0);
    }

    window.addEventListener('keydown', function(event) {
        inputBuffer[event.key] = event.key;
    });    

    document.getElementById('5button').addEventListener("click", function() {
        maze_size = 5;
        startGameLoop();
    })

    document.getElementById('10button').addEventListener("click", function() {
        maze_size = 10;
        startGameLoop();
    })

    document.getElementById('15button').addEventListener("click", function() {
        maze_size = 15;
        startGameLoop();
    })

    document.getElementById('20button').addEventListener("click", function() {
        maze_size = 20;
        startGameLoop();
    })

    startGameLoop();
}


async function startGameLoop() {
    await generateMaze(maze_size);
    charXPos = Math.floor(Math.random() * Math.floor(maze_size));
    charYPos = Math.floor(Math.random() * Math.floor(maze_size));
    stairXPos = Math.floor(Math.random() * Math.floor(maze_size));
    stairYPos = Math.floor(Math.random() * Math.floor(maze_size));
    await loadImages();

    requestAnimationFrame(gameLoop);
}