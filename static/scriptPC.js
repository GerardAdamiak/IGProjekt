let currentPlayer = "Player";
let lockedDice = [];
let score = 0;
let currentButtonState = "roll"; // Tracks the current function of the button: "roll" or "lock"

async function computerTurn() {
    console.log("---- COMPUTER TURN START ----");

    // Simulate dice roll
    const response = await fetch('/generate-numbers');
    const data = await response.json();
    let computerLockedDice = [];

    // Decide which dice to lock (simple strategy for now)
    data.numbers.forEach((num, index) => {
        if (Math.random() > 0.5) {
            computerLockedDice.push(num);
        }
    });

    console.log("Computer's Locked Dice:", computerLockedDice);

    // Calculate the computer's score
    const computerScore = computerLockedDice.reduce((sum, num) => sum + (num === 6 ? 5 : num), 0);
    console.log("Computer's Score This Turn:", computerScore);

    // Add a tile to the computer's pile based on the score
    const tiles = document.querySelectorAll('.rectangle');
    const mainTiles = Array.from(tiles).filter(tile => !tile.closest('.player-pile1, .player-pile2'));
    const targetTile = mainTiles.find(tile => tile.getAttribute('data-score') == computerScore);

    if (targetTile) {
        targetTile.style.position = "absolute";
        targetTile.style.visibility = "hidden";
        const computerPile = document.getElementById('player2-pile');
        const newTile = targetTile.cloneNode(true);
        newTile.style.visibility = "visible";
        computerPile.appendChild(newTile);
    }

    // Update points
    updatePlayerPoints();

    // Switch back to the player
    updateTurn();
    console.log("---- COMPUTER TURN END ----");
}





function updateTurn() {
    currentPlayer = currentPlayer === "Player" ? "PC" : "Player";
    document.getElementById("current-turn").textContent = `Current Turn: ${currentPlayer}`;
    score = 0; // Reset score for new turn
    lockedDice = []; // Reset locked dice for new turn
    const diceImages = document.querySelectorAll('.square img');
    diceImages.forEach(dice => dice.classList.remove("locked", "selected"));
    document.getElementById("score-display").textContent = "Score: 0";

    // Reset button state
    highlightTile(0);

    if (currentPlayer === "PC") {
        document.getElementById("end-button").style.visibility = "hidden";
        document.getElementById("action-button").style.visibility = "hidden";
        setTimeout(computerTurn, 1000); // Simulate computer's turn
    } else {
        document.getElementById("end-button").style.visibility = "visible";
        document.getElementById("action-button").style.visibility = "visible";
        currentButtonState = "roll"; // Ensure the state is reset for the player
        const actionButton = document.getElementById("action-button");
        actionButton.textContent = "Roll the Dice";
    }
}


async function generateNumbers() {
    const response = await fetch('/generate-numbers');
    const data = await response.json();

    const squares = document.querySelectorAll('.square img');
    const lockedDiceNumbers = [];
    const unlockedDiceNumbers = [];

    // Separate locked and unlocked dice numbers
    squares.forEach((dice, index) => {
        const diceValue = parseInt(dice.src.match(/dice(\d)\.png/)[1]); // Extract dice value
        if (lockedDice.includes(index)) {
            lockedDiceNumbers.push(diceValue);
        } else {
            unlockedDiceNumbers.push(data.numbers[index]); // Use generated numbers for unlocked dice
            dice.src = `/static/dice${data.numbers[index]}.png`; // Update the image
        }
    });

    // Check if there is any number in unlocked dice that doesn't appear in locked dice
    const uniqueUnlocked = unlockedDiceNumbers.some(num => !lockedDiceNumbers.includes(num));

    if (!uniqueUnlocked) {
        const playerPile = document.getElementById(currentPlayer === "Player" ? "player1-pile" : "player2-pile");
        const topTile = playerPile.lastElementChild;
        if(topTile){
        const tiles = document.querySelectorAll('.rectangle');
        // Highlight tiles outside the piles
        const mainTiles = Array.from(tiles).filter(tile => !tile.closest('.player-pile1, .player-pile2'));
        const targetTile = mainTiles.find(tile => tile.getAttribute('data-score') == topTile.getAttribute('data-score'));
        playerPile.removeChild(topTile);
        targetTile.style.visibility = "visible"; // Highlight main tile if it matches the score
        }
        updatePlayerPoints();
        updateTurn();
        return;
    }   

    // Switch button to "Lock Selected Dice" after rolling
    const actionButton = document.getElementById("action-button");
    currentButtonState = "lock";
    actionButton.textContent = "Lock Selected Dice";
}


function highlightTile(score) {
    if (score > 36) score = 36;

    // Get all tiles
    const tiles = document.querySelectorAll('.rectangle');

    // Reset all tiles to remove previous highlights
    tiles.forEach(tile => tile.style.outline = "");

    // Highlight the top tile in the opponent's pile if it matches the score
    const pile = document.getElementById(currentPlayer === "Player" ? "player2-pile" : "player1-pile");
    const topTile = pile.lastElementChild;

    if (topTile && topTile.getAttribute('data-score') == score) {
        topTile.style.outline = "4px solid #FF4742"; // Highlight top tile if it matches the score
    }

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
    console.log("---- END TURN START ----");
    console.log("Current Player:", currentPlayer);

    // Check for highlighted tiles
    const highlightedTile = Array.from(document.querySelectorAll('.rectangle')).find(tile => tile.style.outline && tile.style.visibility !== "hidden");
    console.log("Highlighted Tile Found:", highlightedTile ? highlightedTile.getAttribute('data-score') : "None");

    // If no tile is highlighted, exit the function
    if (!highlightedTile) {
        alert("No highlighted tile to claim!");
        const playerPile = document.getElementById(currentPlayer === "Player" ? "player1-pile" : "player2-pile");
        console.log("Player Pile ID (no highlighted tile):", playerPile.id);

        const topTile = playerPile.lastElementChild;
        console.log("Top Tile in Player Pile:", topTile ? topTile.getAttribute('data-score') : "None");

        const tiles = document.querySelectorAll('.rectangle');
        const mainTiles = Array.from(tiles).filter(tile => !tile.closest('.player-pile1, .player-pile2'));
        console.log("Main Tiles Outside Piles:", mainTiles.map(tile => tile.getAttribute('data-score')));

        const targetTile = mainTiles.find(tile => tile.getAttribute('data-score') == topTile?.getAttribute('data-score'));
        console.log("Target Tile to Reappear:", targetTile ? targetTile.getAttribute('data-score') : "None");

        if (topTile) {
            playerPile.removeChild(topTile);
            console.log("Removed Top Tile from Player Pile:", topTile.getAttribute('data-score'));
        }

        if (targetTile) {
            targetTile.style.visibility = "visible";
            console.log("Made Target Tile Visible:", targetTile.getAttribute('data-score'));
        }
        updatePlayerPoints();
        updateTurn();
        console.log("---- END TURN END (No Highlighted Tile) ----");
        return;
    }

    // Check if the highlighted tile matches any tile in the opponent's pile by data-score
    const opponentPileSelector = currentPlayer === "Player" ? '.player-pile2 .rectangle' : '.player-pile1 .rectangle';
    const opponentPileTiles = Array.from(document.querySelectorAll(opponentPileSelector));
    const inOpponentPile = opponentPileTiles.some(tile => tile.getAttribute('data-score') === highlightedTile.getAttribute('data-score'));
    console.log("Is Highlighted Tile in Opponent's Pile by Data-Score?", inOpponentPile);

    // Clone the tile and add it to the current player's pile
    const playerPile = document.getElementById(currentPlayer === "Player" ? "player1-pile" : "player2-pile");
    console.log("Current Player Pile ID:", playerPile.id);

    const newTile = highlightedTile.cloneNode(true);
    newTile.style.visibility = "visible";
    newTile.style.position = "absolute";
    playerPile.appendChild(newTile);
    console.log("Added New Tile to Player Pile:", newTile.getAttribute('data-score'));

    // Handle tile visibility or removal
    if (!inOpponentPile) {
        highlightedTile.style.visibility = "hidden";
        console.log("Set Highlighted Tile Visibility to Hidden:", highlightedTile.getAttribute('data-score'));
    } else {
        const opponentPile = document.getElementById(currentPlayer === "Player" ? "player2-pile" : "player1-pile");
        const topTile = opponentPile.lastElementChild;
        console.log("Top Tile in Opponent Pile (to Remove):", topTile ? topTile.getAttribute('data-score') : "None");

        if (topTile && topTile.getAttribute('data-score') === highlightedTile.getAttribute('data-score')) {
            opponentPile.removeChild(topTile);
            console.log("Removed Top Tile from Opponent Pile:", topTile.getAttribute('data-score'));
        }
    }
    updatePlayerPoints();

    // Reset for the next turn
    updateTurn();
    console.log("---- END TURN END ----");
}



function calculatePoints(pileSelector) {
    const pileTiles = document.querySelectorAll(`${pileSelector} .rectangle`);
    let points = 0;

    pileTiles.forEach(tile => {
        const score = parseInt(tile.getAttribute('data-score'));
        if (score >= 21 && score <= 24) {
            points += 1; // Tiles 21-24 are worth 1 point
        } else if (score >= 25 && score <= 28) {
            points += 2; // Tiles 25-28 are worth 2 points
        } else if (score >= 29 && score <= 32) {
            points += 3; // Tiles 29-32 are worth 3 points
        } else if (score >= 33 && score <= 36) {
            points += 4; // Tiles 33-36 are worth 4 points
        }
    });

    return points;
}

function updatePlayerPoints() {
    // Calculate points for Player 1
    const player1Points = calculatePoints('.player-pile1');
    document.getElementById('player1-points').textContent = `Points: ${player1Points}`;

    // Calculate points for Player 2
    const player2Points = calculatePoints('.player-pile2');
    document.getElementById('player2-points').textContent = `Points: ${player2Points}`;
}




document.addEventListener("DOMContentLoaded", () => {
    const diceSquares = document.querySelectorAll('.square img');
    diceSquares.forEach(dice => dice.addEventListener("click", toggleDiceSelection));

    // Initialize points
    updatePlayerPoints();
});