let currentPlayer = "Player 1";
let lockedDice = [];
let score = 0;
let currentButtonState = "roll"; // Tracks the current function of the button: "roll" or "lock"

function updateTurn() {
    currentPlayer = currentPlayer === "Player 1" ? "Player 2" : "Player 1";
    document.getElementById("current-turn").textContent = `Current Turn: ${currentPlayer}`;
    score = 0; // Reset score for new turn
    lockedDice = []; // Reset locked dice for new turn
    const diceImages = document.querySelectorAll('.square img');
    diceImages.forEach(dice => dice.classList.remove("locked", "selected"));
    document.getElementById("score-display").textContent = "Score: 0";

    // Reset button state
    const actionButton = document.getElementById("action-button");
    currentButtonState = "roll";
    actionButton.textContent = "Roll the Dice";
    highlightTile(0);
}

async function generateNumbers() {
    const response = await fetch('/generate-numbers');
    const data = await response.json();

    const squares = document.querySelectorAll('.square img');
    data.numbers.forEach((num, index) => {
        if (!lockedDice.includes(index)) {
            squares[index].src = `/static/dice${num}.png`;
        }
    });

    // Switch button to "Lock Selected Dice" after rolling
    const actionButton = document.getElementById("action-button");
    currentButtonState = "lock";
    actionButton.textContent = "Lock Selected Dice";
}

function highlightTile(score) {
// Get all tiles
if(score>36)score = 36;
const tiles = document.querySelectorAll('.rectangle');

// Reset all tiles to remove previous highlights
tiles.forEach(tile => tile.style.outline = "");

// Iterate over each pile
const piles = [document.getElementById("player1-pile"), document.getElementById("player2-pile")];

piles.forEach(pile => {
    // Get the topmost tile in the pile (last child)
    const topTile = pile.lastElementChild;

    if (topTile && topTile.getAttribute('data-score') == score) {
        topTile.style.outline = "4px solid #FF4742"; // Highlight top tile if it matches the score
    }
});

// Highlight tiles outside the piles
const mainTiles = Array.from(tiles).filter(tile => !tile.closest('.player-pile1, .player-pile2'));
const targetTile = mainTiles.find(tile => tile.getAttribute('data-score') == score);
if (targetTile) {
    targetTile.style.outline = "4px solid #FF4742"; // Highlight main tile if it matches the score
}
}



function lockSelectedDice() {
const selectedDice = document.querySelectorAll('.square img.selected');

 if (selectedDice.length === 0) {
    alert("You must select at least one die to lock.");
    return; // Exit the function if no dice are selected
}

selectedDice.forEach(dice => {
    dice.classList.add("locked");
    dice.classList.remove("selected");
    const index = Array.from(dice.parentNode.parentNode.children).indexOf(dice.parentNode);
    lockedDice.push(index);

    // Calculate score: if dice shows 6, count as 5
    const diceValue = parseInt(dice.src.match(/dice(\d)\.png/)[1]);
    score += diceValue === 6 ? 5 : diceValue;
});
document.getElementById("score-display").textContent = `Score: ${score}`;


// Highlight the tile corresponding to the new score
highlightTile(score);

// Switch button to "Roll the Dice" after locking
const actionButton = document.getElementById("action-button");
currentButtonState = "roll";
actionButton.textContent = "Roll the Dice";

}


function toggleAction() {
    if (currentButtonState === "roll") {
        generateNumbers();
    } else if (currentButtonState === "lock") {
        lockSelectedDice();
    }
}

function toggleDiceSelection(event) {
// Prevent selection when in "Roll the Dice" mode
if (currentButtonState === "roll") return;

const dice = event.target;
const diceValue = dice.src.match(/dice(\d)\.png/)[1]; // Extract dice value
const allDice = document.querySelectorAll('.square img');

// Check if this number is already locked
const lockedNumbers = lockedDice.map(index => {
    const lockedDiceImage = document.querySelectorAll('.square img')[index];
    return lockedDiceImage.src.match(/dice(\d)\.png/)[1];
});

if (lockedNumbers.includes(diceValue)) return; // Prevent selection of dice with locked numbers

// Unselect all dice first
allDice.forEach(otherDice => otherDice.classList.remove("selected"));

// Select all dice with the same value
allDice.forEach(otherDice => {
    const otherValue = otherDice.src.match(/dice(\d)\.png/)[1];
    if (otherValue === diceValue) {
        otherDice.classList.add("selected");
    }
});
}


function endTurn() {
// Check for highlighted tiles
const highlightedTile = Array.from(document.querySelectorAll('.rectangle')).find(tile => tile.style.outline);

// If no tile is highlighted, exit the function
if (!highlightedTile) {
    alert("No highlighted tile to claim!");
    const playerPile = document.getElementById(currentPlayer === "Player 1" ? "player1-pile" : "player2-pile");
    const topTile = playerPile.lastElementChild;
    
    const tiles = document.querySelectorAll('.rectangle');
    // Highlight tiles outside the piles
    const mainTiles = Array.from(tiles).filter(tile => !tile.closest('.player-pile1, .player-pile2'));
    const targetTile = mainTiles.find(tile => tile.getAttribute('data-score') == topTile.getAttribute('data-score'));
    playerPile.removeChild(topTile);
    targetTile.style.visibility = "visible"; // Highlight main tile if it matches the score
    

    updateTurn();
    return;
}

// Hide the highlighted tile in the main area
highlightedTile.style.visibility = "hidden";

// Clone the tile and add it to the player's pile
const playerPile = document.getElementById(currentPlayer === "Player 1" ? "player1-pile" : "player2-pile");
const newTile = highlightedTile.cloneNode(true);
newTile.style.visibility = "visible"; // Ensure the cloned tile is visible
newTile.style.position = "absolute"; // Stack tiles on top of each other
playerPile.appendChild(newTile);

// Reset for the next turn
updateTurn();
}




document.addEventListener("DOMContentLoaded", () => {
    const diceSquares = document.querySelectorAll('.square img');
    diceSquares.forEach(dice => dice.addEventListener("click", toggleDiceSelection));
});