const gridBg = document.getElementById('grid-bg');
const tileContainer = document.getElementById('tile-container');
const scoreElement = document.getElementById('score');
const gameMessage = document.getElementById('game-message');
const messageText = document.getElementById('message-text');
const restartBtn = document.getElementById('restart-btn');

let board = [];
let score = 0;
let isAnimating = false; 


for (let i = 0; i < 16; i++) {
    let cell = document.createElement('div');
    cell.classList.add('bg-cell');
    gridBg.appendChild(cell);
}


function initGame() {
    tileContainer.innerHTML = '';
    board = Array(4).fill().map(() => Array(4).fill(null));
    score = 0;
    hasLost = false;
    isAnimating = false;
    updateScore();
    gameMessage.classList.add('hidden');
    
    addRandomTile();
    addRandomTile();
}

function updateScore() {
    scoreElement.textContent = score;
}


function addRandomTile() {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === null) emptyCells.push({r, c});
        }
    }
    
    if (emptyCells.length > 0) {
        let {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        let value = Math.random() < 0.9 ? 2 : 4;
        

        let tile = document.createElement('div');
        tile.classList.add('tile');
        tile.textContent = value;
        tile.setAttribute('data-value', value);
        setTilePosition(tile, r, c);
        tileContainer.appendChild(tile);
        board[r][c] = { value: value, element: tile };
    }
}
function setTilePosition(element, row, col) {
    element.style.transform = `translate(${col * 100}px, ${row * 100}px)`;
}

function slideAndMerge(line) {
    let tiles = line.filter(tile => tile !== null); 
    let mergedLine = [];
    let toRemove = []; 

    for (let i = 0; i < tiles.length; i++) {
        if (i < tiles.length - 1 && tiles[i].value === tiles[i + 1].value) {
            let newValue = tiles[i].value * 2;
            score += newValue;
            
            tiles[i].value = newValue;
            mergedLine.push(tiles[i]);
            toRemove.push(tiles[i + 1]);
            i++; 
        } else {
            mergedLine.push(tiles[i]);
        }
    }

    while (mergedLine.length < 4) mergedLine.push(null);
    return { mergedLine, toRemove };
}


function move(direction) {
    if (isAnimating || hasLost) return;
    
    let moved = false;
    let elementsToRemove = [];


    let newBoard = Array(4).fill().map(() => Array(4).fill(null));

    for (let i = 0; i < 4; i++) {
        let line = [];
        for (let j = 0; j < 4; j++) {
            if (direction === 'Left') line.push(board[i][j]);
            if (direction === 'Right') line.push(board[i][3 - j]);
            if (direction === 'Up') line.push(board[j][i]);
            if (direction === 'Down') line.push(board[3 - j][i]);
        }

        let { mergedLine, toRemove } = slideAndMerge(line);
        elementsToRemove.push(...toRemove);
        for (let j = 0; j < 4; j++) {
            let tile = mergedLine[j];
            let r, c;
            
            if (direction === 'Left') { r = i; c = j; }
            if (direction === 'Right') { r = i; c = 3 - j; }
            if (direction === 'Up') { r = j; c = i; }
            if (direction === 'Down') { r = 3 - j; c = i; }

            newBoard[r][c] = tile;

            if (tile !== null) {
                if (board[r][c] !== tile) {
                    moved = true;
                    setTilePosition(tile.element, r, c);
                }
            }
        }
        toRemove.forEach(tile => {
            moved = true;
            let targetR, targetC;
            for(let r=0; r<4; r++){
                for(let c=0; c<4; c++){
                    if(newBoard[r][c] && newBoard[r][c].element === mergedLine.find(m => m && m.value === tile.value*2)?.element) {
                        targetR = r; targetC = c;
                    }
                }
            }
            if(targetR !== undefined) setTilePosition(tile.element, targetR, targetC);
        });
    }

    if (moved) {
        isAnimating = true; 
        board = newBoard;
        updateScore();

        setTimeout(() => {
            elementsToRemove.forEach(tile => tile.element.remove());
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (board[r][c]) {
                        board[r][c].element.textContent = board[r][c].value;
                        board[r][c].element.setAttribute('data-value', board[r][c].value);
                    }
                }
            }
            
            addRandomTile();
            isAnimating = false; 
            checkGameOver();
        }, 150);
    }
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'a': move('Left'); break;
        case 'd': move('Right'); break;
        case 'w': move('Up'); break;
        case 's': move('Down'); break;
    }
});

function checkGameOver() {

    if (board.flat().some(cell => cell && cell.value === 2048)) {
        showGameOver("Ти виграв! 🎉");
        return;
    }
    if (board.flat().includes(null)) return;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            let val = board[r][c].value;
            if (c < 3 && val === board[r][c + 1].value) return;
            if (r < 3 && val === board[r + 1][c].value) return;
        }
    }
    hasLost = true;
    showGameOver("Гру закінчено!");
}

function showGameOver(text) {
    messageText.textContent = text;
    gameMessage.classList.remove('hidden');
}

restartBtn.addEventListener('click', initGame);
initGame();