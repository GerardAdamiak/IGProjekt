let lockedDice = [];
let score = 0;
let currentButtonState = "roll"; // Tracks the current function of the button: "roll" or "lock"
let currentPlayer = "Player 1";

        function getQueryParam(param) {
            const params = new URLSearchParams(window.location.search);
            return params.get(param);
        }

         async function fetchCurrentTurn() {
            const roomCode = getQueryParam("room_code");
            const player = getQueryParam("player");

            const response = await fetch("/get-current-turn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_code: roomCode })
            });
            const data = await response.json();

            if (data.current_turn) {
                document.getElementById("current-turn").innerText = "Current Turn: " + data.current_turn;

                // Show or hide elements based on whose turn it is
                const gameControls = document.getElementById("game-controls");
                if (data.current_turn === player) {
                    gameControls.style.display = "block"; // Show controls
                } else {
                    gameControls.style.display = "none"; // Hide controls
                }
            }
        }

        async function endTurn() {
            const roomCode = getQueryParam("room_code");

            const response = await fetch("/end-turn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_code: roomCode })
            });
            const data = await response.json();

            if (data.current_turn) {
                document.getElementById("current-turn").innerText = "Current Turn: " + data.current_turn;
            }
            score = 0; // Reset score for new turn
    lockedDice = []; // Reset locked dice for new turn
    const diceImages = document.querySelectorAll('.square img');
    diceImages.forEach(dice => dice.classList.remove("locked", "selected"));
    document.getElementById("score-display").textContent = "Score: 0";


            const actionButton = document.getElementById("action-button");
    currentButtonState = "roll";
    actionButton.textContent = "Roll the Dice";
        }

        // Poll the current turn every 2 seconds to keep the game state synchronized
        setInterval(fetchCurrentTurn, 100);

    

function highlightTile(score) {
    if (score > 36) score = 36;

    // Get all tiles
    const tiles = document.querySelectorAll('.rectangle');

    // Reset all tiles to remove previous highlights
    tiles.forEach(tile => tile.style.outline = "");

    // Highlight the top tile in the opponent's pile if it matches the score
    const pile = document.getElementById(currentPlayer === "Player 1" ? "player2-pile" : "player1-pile");
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

document.addEventListener("DOMContentLoaded", () => {
    const diceSquares = document.querySelectorAll('.square img');
    diceSquares.forEach(dice => dice.addEventListener("click", toggleDiceSelection));

    // Initialize points
    // updatePlayerPoints();
});

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
        const playerPile = document.getElementById(currentPlayer === "Player 1" ? "player1-pile" : "player2-pile");
        const topTile = playerPile.lastElementChild;
        if(topTile){
        const tiles = document.querySelectorAll('.rectangle');
        // Highlight tiles outside the piles
        const mainTiles = Array.from(tiles).filter(tile => !tile.closest('.player-pile1, .player-pile2'));
        const targetTile = mainTiles.find(tile => tile.getAttribute('data-score') == topTile.getAttribute('data-score'));
        playerPile.removeChild(topTile);
        targetTile.style.visibility = "visible"; // Highlight main tile if it matches the score
        }
        endTurn();
        return;
    }   

    // Switch button to "Lock Selected Dice" after rolling
    const actionButton = document.getElementById("action-button");
    currentButtonState = "lock";
    actionButton.textContent = "Lock Selected Dice";
}

async function saveDiceState() {
    const roomCode = getQueryParam("room_code");
    const diceState = {
        dice: Array.from(document.querySelectorAll('.square img')).map(dice =>
            parseInt(dice.src.match(/dice(\d)\.png/)[1])
        ),
        locked: Array.from(document.querySelectorAll('.square img')).map(dice =>
            dice.classList.contains("locked")
        ),
        button_state: currentButtonState,
        score: score
    };

    await fetch("/set-dice-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_code: roomCode, dice_state: diceState })
    });
}


async function restoreDiceState() {
    const roomCode = getQueryParam("room_code");
    const response = await fetch("/get-dice-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_code: roomCode })
    });
    const data = await response.json();

    if (data.dice_state) {
        const { dice, locked, button_state, score: restoredScore } = data.dice_state;
        const squares = document.querySelectorAll('.square img');

        // Restore dice values and locked state
        squares.forEach((diceImg, index) => {
            diceImg.src = `/static/dice${dice[index]}.png`;
            if (locked[index]) {
                diceImg.classList.add("locked");
                lockedDice.push(index);
            } else {
                diceImg.classList.remove("locked");
            }
        });

        // Restore button state
        currentButtonState = button_state;
        const actionButton = document.getElementById("action-button");
        actionButton.textContent =
            button_state === "roll" ? "Roll the Dice" : "Lock Selected Dice";

        // Restore score
        score = restoredScore;
        document.getElementById("score-display").textContent = `Score: ${score}`;
    }
}


window.onload = async function () {
    const roomCode = getQueryParam("room_code");
    const player = getQueryParam("player");

    if (roomCode) {
        document.getElementById("room-code-display").innerText = "Room Code: " + roomCode;
    }
    if (player) {
        document.getElementById("player-display").innerText = "You are: " + player;
    }

    await restoreDiceState();
    fetchCurrentTurn();
};


// Call saveDiceState whenever dice are rolled or locked
document.getElementById("action-button").addEventListener("click", async () => {
    if (currentButtonState === "roll") {
        await generateNumbers();
    } else if (currentButtonState === "lock") {
        lockSelectedDice();
    }
    saveDiceState(); // Save state after each action
});
       