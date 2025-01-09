from flask import Flask, render_template_string, jsonify  # type: ignore
import random

app = Flask(__name__)

# Global variables to manage game state
game_state = {
    "current_player": "Player 1",
    "player1_score": 0,
    "player2_score": 0,
    "locked_dice": [],
}

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Turn-Based Dice Game</title>
        <style>
            body {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f0f0f0;
                padding-left: 25vw;
            }

            .vertical-line {
                width: 5px;
                height: 100%;
                background-color: black;
                margin-right: 3vw;
            }

            .container {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                max-width: 1000px;
            }

            .rectangle {
                width: 3vw;
                height: 6vw;
                background-size: cover;
                background-position: center;
                transition: transform 0.2s ease-in-out;
            }

            .dices {
                display: flex;
                flex-direction: column;
                margin-right: 10vw;
                margin-left: -15vw;
                align-items: center;
            }

            .players {
                display: flex;
                flex-direction: column;
            }

            .button-24 {
                background: #FF4742;
                border: 1px solid #FF4742;
                border-radius: 6px;
                color: #FFFFFF;
                cursor: pointer;
                font-size: 16px;
                font-weight: 800;
                padding: 12px 14px;
                margin-top: 10px;
                text-align: center;
            }

            .button-24:hover {
                background-color: initial;
                color: #FF4742;
            }

            .playername {
                font-size: 40px;
                font-weight: 800;
                text-align: center;
            }

            #player1 {
                padding-bottom: 2vh;
            }

            #player2 {
                padding-top: 2vh;
            }

            .rectangle:hover {
                transform: scale(1.1);
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(4, 50px);
                grid-gap: 15px;
                margin-top: 20px;
            }

            .square img {
                width: 50px;
                height: 50px;
                cursor: pointer;
                border: 3px solid transparent;
            }

            .square img.locked {
                border: 4px solid #008000; /* Green for locked dice */
                cursor: not-allowed;
            }

            .square img.selected {
                border: 4px solid #FF4742; /* Red for selected dice */
            }

            .player-pile1 {
    position: relative; /* Allows stacking tiles within the pile */
    width: 3vw;
    height: 6vw;
    margin-bottom: 20vh;
    margin-left: calc(22.5vw + 75px);
    border: 2px dashed #aaa; /* Optional: Visual cue for the pile area */
    
}
.player-pile2 {
    position: relative; /* Allows stacking tiles within the pile */
    width: 3vw;
    height: 6vw;
    margin-top: 20vh;
    margin-left: calc(22.5vw + 75px);
    border: 2px dashed #aaa; /* Optional: Visual cue for the pile area */
   
}

        </style>
       <script>
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
</script>


    </head>
    <body>
        <div class="dices">
            <div id="current-turn" style="font-size: 20px; margin-bottom: 10px;">Current Turn: Player 1</div>
            <button id="action-button" class="button-24" role="button" onclick="toggleAction()">Roll the Dice</button>
            <button class="button-24" role="button" onclick="endTurn()">End Turn</button>
            <div id="score-display" style="margin-top: 20px; font-size: 20px; font-weight: bold;">Score: 0</div>
            <div class="grid">
                {% for _ in range(8) %}
                    <div class="square">
                        <img src="/static/dice1.png" alt="dice">
                    </div>
                {% endfor %}
            </div>
        </div>
        <div class="vertical-line"></div>
        <div class="players">
            <div class="playername" id="player1">Player 1</div>
              <div id="player1-pile" class="player-pile1"></div>
            <div class="container">
                {% for i in range(1, 17) %}
                    <div class="rectangle" data-id="{{ i }}" data-score="{{ 20 + i }}" 
     style="background-image: url('/static/tile{{ i }}.png');"></div>

                {% endfor %}
            </div>
            <div id="player2-pile" class="player-pile2"></div>
            <div class="playername" id="player2">Player 2</div>
        </div>
    </body>
    </html>
    """)

@app.route("/generate-numbers")
def generate_numbers():
    numbers = [random.randint(1, 6) for _ in range(8)]  # Generate 8 random numbers for the dice
    return jsonify({"numbers": numbers})

if __name__ == "__main__":
    app.run(debug=True)
