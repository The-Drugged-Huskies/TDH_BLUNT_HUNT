"""
Flask Application for TDH Blunt Hunt.

This module serves the game frontend and handles leaderboard score submissions.
"""

import json
import os
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__)

# Constants
LEADERBOARD_FILE = os.path.join(app.static_folder, 'data', 'leaderboard.json')
MAX_LEADERBOARD_ENTRIES = 500


@app.route('/')
def index():
    """Renders the main game interface."""
    return render_template('index.html')


@app.route('/withdraw')
def withdraw():
    """Serves the fund recovery tool for the contract owner."""
    return send_from_directory('static', 'withdraw.html')


@app.route('/deploy')
def deploy():
    """Serves the contract deployment tool."""
    return send_from_directory('static', 'deploy.html')


@app.route('/submit-score', methods=['POST'])
def submit_score():
    """
    Handles score submission from the game.

    Expects JSON data: { "name": str, "score": int }
    Updates the local JSON leaderboard, keeps top 500, and returns the simplified rank.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        name = data.get('name', 'Guest')
        score = int(data.get('score', 0))

        # Load existing leaderboard
        leaderboard_data = []
        if os.path.exists(LEADERBOARD_FILE):
            with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
                try:
                    leaderboard_data = json.load(f)
                except json.JSONDecodeError:
                    leaderboard_data = []

        # Add new score (Rank is provisional, will be recalculated)
        leaderboard_data.append({
            "name": name,
            "score": score,
            "rank": 0
        })

        # Sort by score descending
        leaderboard_data.sort(key=lambda x: x['score'], reverse=True)

        # Keep top N and re-rank
        leaderboard_data = leaderboard_data[:MAX_LEADERBOARD_ENTRIES]
        for i, entry in enumerate(leaderboard_data):
            entry['rank'] = i + 1

        # Save back to file
        os.makedirs(os.path.dirname(LEADERBOARD_FILE), exist_ok=True)
        with open(LEADERBOARD_FILE, 'w', encoding='utf-8') as f:
            json.dump(leaderboard_data, f, indent=2)

        # Find user's new rank
        user_rank = next((x['rank'] for x in leaderboard_data if x['name'] == name and x['score'] == score), -1)

        return jsonify({"success": True, "rank": user_rank})

    except Exception as e:
        print(f"Error submitting score: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
