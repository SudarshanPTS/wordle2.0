document.addEventListener("DOMContentLoaded", () => {
    let currentGuess = [];
    let currentRow = 0;
    let word = "";
    let maxRows = 6;
    let wordLength = 5;
    let gameOver = false;

    // Fetch a random word from the backend
    fetch("/get_word")
        .then(response => response.json())
        .then(data => {
            word = data.word.toUpperCase();
            console.log("Word to guess:", word); // Debugging
            createBoard();
        });

    // Create the game board (grid for guesses)
    const createBoard = () => {
        const gameBoard = document.getElementById("game-board");
        for (let i = 0; i < maxRows * wordLength; i++) {
            const div = document.createElement("div");
            div.classList.add("tile");
            gameBoard.appendChild(div);
        }
    };

    // Update the game board display based on the current guess
    const updateBoard = () => {
        const gameBoard = document.getElementById("game-board");
        const currentTiles = Array.from(gameBoard.children).slice(currentRow * wordLength, (currentRow + 1) * wordLength);
        currentTiles.forEach((tile, index) => {
            tile.textContent = currentGuess[index] || "";
        });
    };

    // Handle keyboard input (virtual or physical)
    const handleKeyPress = (key) => {
        if (gameOver) return;

        if (key === "Enter") {
            if (currentGuess.length === wordLength) {
                checkWordValidity(currentGuess.join("").toUpperCase());
            }
        } else if (key === "Backspace") {
            currentGuess.pop();
        } else if (/^[A-Za-z]$/.test(key)) {  // Only accept alphabetic input
            if (currentGuess.length < wordLength) {
                currentGuess.push(key.toUpperCase());
            }
        }
        updateBoard();
    };

    // Check if the guessed word is valid
    const checkWordValidity = (guess) => {
        fetch(`/check_word_validity?word=${guess}`)
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    checkGuess();
                } else {
                    document.getElementById("result").textContent = "Not in word list!";
                }
            });
    };

    // Check if the guessed word is correct and apply colors
    const checkGuess = () => {
        const guess = currentGuess.join("");
        const gameBoard = document.getElementById("game-board");
        const currentTiles = Array.from(gameBoard.children).slice(currentRow * wordLength, (currentRow + 1) * wordLength);

        let wordArray = word.split('');
        let guessArray = [...currentGuess]; // Copy the current guess

        // First, mark letters that are correct (green)
        currentTiles.forEach((tile, index) => {
            tile.classList.remove("correct", "present", "absent");  // Reset tile colors before setting new ones

            if (guessArray[index] === wordArray[index]) {
                tile.classList.add("correct");
                wordArray[index] = null;  // Mark letter as used in the word array
                guessArray[index] = null;  // Mark letter as used in the guess array
            }
        });

        // Then, mark letters that are present but in the wrong position (yellow)
        currentTiles.forEach((tile, index) => {
            if (guessArray[index] !== null && wordArray.includes(guessArray[index])) {
                tile.classList.add("present");
                wordArray[wordArray.indexOf(guessArray[index])] = null;  // Remove matched letter from word array
            } else if (guessArray[index] !== null) {
                tile.classList.add("absent");
            }
        });

        if (guess === word) {
            document.getElementById("result").textContent = "You guessed the word!";
            showMeaning();
            gameOver = true;
        } else {
            currentRow++;
            if (currentRow === maxRows) {
                document.getElementById("result").textContent = `Game over! The word was ${word}.`;
                showMeaning();
                gameOver = true;
            } else {
                currentGuess = [];
            }
        }
    };

    // Fetch and display the word's meaning
    const showMeaning = () => {
        fetch(`/get_word_meaning?word=${word}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("result").textContent += ` Meaning: ${data.meaning}`;
            });
    };

    // Attach event listeners to the virtual keyboard buttons
    document.querySelectorAll("#keyboard button").forEach(button => {
        button.addEventListener("click", () => {
            handleKeyPress(button.textContent);
        });
    });

    // Attach event listener for physical keyboard input
    document.addEventListener("keydown", (event) => {
        const key = event.key;

        if (key === "Enter" || key === "Backspace" || /^[A-Za-z]$/.test(key)) {
            handleKeyPress(key);
        }
    });
});
