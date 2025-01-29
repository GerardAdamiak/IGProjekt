from flask import Flask, render_template, jsonify, request
import random
import string

app = Flask(__name__)

rooms = {} 



game_state = {
    "current_player": "Player 1",
    "player1_score": 0,
    "player2_score": 0,
}

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.route("/", methods=["GET"])
def main_menu():
    return render_template("main.html")

@app.route("/hotseat", methods=["GET", "POST"])
def hotseat():
    return render_template("index.html")  # Reuse existing player vs player template

@app.route("/player-vs-computer", methods=["GET"])
def player_vs_computer():
    return render_template("player_vs_computer.html")  # Placeholder

@app.route("/room-set", methods=["GET"])
def roomset():
    return render_template("room.html")  # Placeholder

@app.route("/player-vs-player-online", methods=["GET"])
def player_vs_player_online():
    return render_template("player_vs_player_online.html")  # Placeholder

@app.route("/get-current-turn", methods=["POST"])
def get_current_turn():
    room_code = request.json.get("room_code")
    if room_code in rooms:
        return jsonify({"current_turn": rooms[room_code].get("current_turn", "Player 1")})
    return jsonify({"error": "Room not found"}), 404

@app.route("/end-turn", methods=["POST"])
def end_turn():
    
    room_code = request.json.get("room_code")
    if room_code in rooms:
        current_turn = rooms[room_code].get("current_turn", "Player 1")
        next_turn = "Player 2" if current_turn == "Player 1" else "Player 1"
        rooms[room_code]["current_turn"] = next_turn
        return jsonify({"current_turn": next_turn})
    return jsonify({"error": "Room not found"}), 404


@app.route("/generate-numbers")
def generate_numbers():
    numbers = [random.randint(1, 6) for _ in range(8)]
    return jsonify({"numbers": numbers})

@app.route("/create-room", methods=["POST"])
def create_room():
    room_code = generate_room_code()
    # Assign Player 1 as the room creator
    rooms[room_code] = {
        "players": ["Player 1"],  # Player 1 is the creator of the room
        "current_turn": "Player 1",  # Default turn starts with Player 1
        "dice_state": {  # Initial state of the dice
            "dice": [1] * 8,
            "locked": [False] * 8,
            "button_state": "roll",
            "score": 0
        },
        "hidden_tiles": [] 
    }
    return jsonify({"room_code": room_code, "player": "Player 1"})

@app.route("/join-room", methods=["POST"])
def join_room():
    room_code = request.json.get("room_code")
    if room_code in rooms:
        if len(rooms[room_code]["players"]) < 2:
            # Assign Player 2 to the second player
            rooms[room_code]["players"].append("Player 2")
            return jsonify({"success": True, "player": "Player 2"})
        else:
            return jsonify({"success": False, "message": "Room is full."})
    return jsonify({"success": False, "message": "Room not found."})


@app.route("/get-dice-state", methods=["POST"])
def get_dice_state():
    room_code = request.json.get("room_code")
    if room_code in rooms:
        dice_state = rooms[room_code].get(
            "dice_state",
            {
                "dice": [1] * 8,
                "locked": [False] * 8,
                "button_state": "roll",
                "score": 0
            },
        )
        return jsonify({"dice_state": dice_state})
    return jsonify({"error": "Room not found"}), 404

@app.route("/set-dice-state", methods=["POST"])
def set_dice_state():
    room_code = request.json.get("room_code")
    dice_state = request.json.get("dice_state")
    if room_code in rooms:
        rooms[room_code]["dice_state"] = dice_state
        return jsonify({"success": True})
    return jsonify({"error": "Room not found"}), 404


@app.route("/update-hidden-tiles", methods=["POST"])
def update_hidden_tiles():
    room_code = request.json.get("room_code")
    score = request.json.get("score")
    if room_code in rooms:
        hidden_tiles = rooms[room_code].get("hidden_tiles", [])
        if score not in hidden_tiles:
            hidden_tiles.append(score)
        rooms[room_code]["hidden_tiles"] = hidden_tiles
        return jsonify({"success": True})
    return jsonify({"error": "Room not found"}), 404


@app.route("/get-hidden-tiles", methods=["POST"])
def get_hidden_tiles():
    room_code = request.json.get("room_code")
    if room_code in rooms:
        return jsonify({"hidden_tiles": rooms[room_code].get("hidden_tiles", [])})
    return jsonify({"error": "Room not found"}), 404




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=12218, debug=True)
