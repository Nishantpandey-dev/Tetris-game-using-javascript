const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLS = 12;
const BLOCK_SIZE = 20;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

// Arena (game board)
function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

// Tetromino shapes
function createPiece(type) {
    if (type === 'T') return [[0,1,0],[1,1,1],[0,0,0]];
    if (type === 'O') return [[2,2],[2,2]];
    if (type === 'L') return [[0,0,3],[3,3,3],[0,0,0]];
    if (type === 'J') return [[4,0,0],[4,4,4],[0,0,0]];
    if (type === 'I') return [[0,0,0,0],[5,5,5,5],[0,0,0,0],[0,0,0,0]];
    if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
    if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
}

// Draw block
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Colors
const colors = [
    null,
    'purple',
    'yellow',
    'orange',
    'blue',
    'cyan',
    'green',
    'red'
];

// Collision
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Merge piece
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Clear rows
function sweep() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) continue outer;
        }
        arena.splice(y, 1);
        arena.unshift(new Array(COLS).fill(0));
        y++;
    }
}

// Rotate
function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

// Player
const player = {
    pos: {x: 0, y: 0},
    matrix: null
};

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0)); // Game over reset
    }
}

// Movement
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        sweep();
        playerReset();
    }
    dropCounter = 0;
}

// Rotate control
function playerRotate() {
    const pos = player.pos.x;
    player.matrix = rotate(player.matrix);
    if (collide(arena, player)) {
        player.matrix = rotate(player.matrix); // revert
        player.matrix = rotate(player.matrix);
        player.matrix = rotate(player.matrix);
        player.pos.x = pos;
    }
}

// Controls
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") playerMove(-1);
    else if (event.key === "ArrowRight") playerMove(1);
    else if (event.key === "ArrowDown") playerDrop();
    else if (event.key === "ArrowUp") playerRotate();
});

// Draw everything
function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

// Game loop
let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Init
const arena = createMatrix(COLS, ROWS);
playerReset();
update();