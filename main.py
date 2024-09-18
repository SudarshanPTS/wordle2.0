from flask import Flask, render_template, request, jsonify
import random
import requests

app = Flask(__name__)

# Load the word list
with open("wordlist.txt") as f:
    words = [word.strip() for word in f.readlines()]

@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to get a random word
@app.route('/get_word', methods=['GET'])
def get_word():
    chosen_word = random.choice(words)
    return jsonify({"word": chosen_word})

# Endpoint to get word meaning
@app.route('/get_word_meaning', methods=['GET'])
def get_word_meaning():
    word = request.args.get('word')
    response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
    
    if response.status_code == 200:
        data = response.json()
        if data and isinstance(data, list):
            meanings = data[0].get('meanings', [])
            if meanings:
                definition = meanings[0]['definitions'][0]['definition']
                return jsonify({"meaning": definition})
    
    return jsonify({"meaning": "No meaning available for this word."})

# Endpoint to check if a word is valid (new addition)
@app.route('/check_word_validity', methods=['GET'])
def check_word_validity():
    guessed_word = request.args.get('word', '').strip().upper()
    if guessed_word in [w.upper() for w in words]:
        return jsonify({"valid": True})
    return jsonify({"valid": False})

if __name__ == "__main__":
    app.run(debug=True)
