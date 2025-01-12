from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# Global variables to manage game state
game_state = {
    "current_player": "Player 1",
    "player1_score": 0,
    "player2_score": 0,
   
}

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route("/generate-numbers")
def generate_numbers():
    numbers = [random.randint(1, 6) for _ in range(8)]  # Generate 8 random numbers for the dice
    return jsonify({"numbers": numbers})

if __name__ == "__main__":
    app.run(debug=True)
