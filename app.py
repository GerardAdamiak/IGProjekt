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



@app.route("/generate-numbers")
def generate_numbers():
    numbers = [random.randint(1, 6) for _ in range(8)]
    return jsonify({"numbers": numbers})

@app.route("/create-room", methods=["POST"])
def create_room():
    room_code = generate_room_code()
    # Assign Player 1 as the room creator
    rooms[room_code] = {"players": ["Player 1"]}
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


if __name__ == "__main__":
    app.run(debug=True)
