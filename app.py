from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

game_state = {
    "current_player": "Player 1",
    "player1_score": 0,
    "player2_score": 0,
}

@app.route("/", methods=["GET"])
def main_menu():
    return render_template("main.html")

@app.route("/hotseat", methods=["GET", "POST"])
def hotseat():
    return render_template("index.html")  # Reuse existing player vs player template

@app.route("/player-vs-computer", methods=["GET"])
def player_vs_computer():
    return render_template("player_vs_computer.html")  # Placeholder

@app.route("/player-vs-player-online", methods=["GET"])
def player_vs_player_online():
    return render_template("player_vs_player_online.html")  # Placeholder

@app.route("/generate-numbers")
def generate_numbers():
    numbers = [random.randint(1, 6) for _ in range(8)]
    return jsonify({"numbers": numbers})



if __name__ == "__main__":
    app.run(debug=True)
