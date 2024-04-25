const inputArea: HTMLElement = document.getElementById("input-area")!;
const textDisplay: HTMLElement = document.getElementById("text")!;
const caretDisplay: HTMLElement = document.getElementById("caret")!;
const startButton: HTMLElement = document.getElementById("start-button")!;

function commands(input: string) {
    switch(input) {
        case "-play": {
            if (!inPlay) start();
            break;
        }
        case "-stop": {
            if (inPlay) end();
            break;
        }
        case "-pause": {
            if (!paused) pause();
            break;
        }
    }
}

function checkEnteredWord() {
    commands(userInput);

    for (let i = 0; i < summonedWords.length; i++) {
        const { divElement, word } = summonedWords[i];

        if (word === userInput) {
            summonedWords.splice(i, 1);
            divElement.remove();
            
            const { height } = healthBar.getBoundingClientRect();
            if (playerHealth < 100 && height < 500) {
                playerHealth += 5;
                healthBar.style.height = (height + 25) + "px";
            } else if (playerHealth >= 100 && height <= 500) {
                healthBar.style.height = 500 + "px";
            }
        }
    }

    userInput = "";
    // textDisplay.innerHTML = "";
}

window.addEventListener("blur", () => {
    if (!paused) pause();
});

startButton.addEventListener("click", () => {
    if (inPlay) {
        end();
        return;
    } 
    
    start();
});

function typeUserInput(input: string) {
    userInput += input;

    const textNode = document.createTextNode(input);
    const spanElement = document.createElement("span");
    spanElement.classList.add("letter");
    spanElement.appendChild(textNode);

    textDisplay.appendChild(spanElement);
    caretDisplay.style.right = (-5) + "px";
    if (input === " ") {
        caretDisplay.style.right = (-14) + "px";
    }
}

function deleteTextInput() {
    userInput = userInput.slice(0, -1);
    
    const letterElements = textDisplay.querySelectorAll(".letter");
    letterElements[letterElements.length - 1].remove();
}

document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (inPlay && paused) return;

    const alphanumericRegex = /^([a-zA-Z0-9 _-]+)$/;
    const input = e.key;

    if (input === "Enter" || input === " ") { checkEnteredWord(); }

    if (input === "Backspace") { userInput = userInput.slice(0, -1); }

    if (input.length <= 1 && alphanumericRegex.test(input)) {
        userInput += input;
        caretDisplay.classList.remove("blinking");
    }

    if (userInput === "" && !paused) {
        caretDisplay.classList.add("blinking");
    }

    if (userInput === "" && !inPlay) {
        caretDisplay.classList.add("blinking");
    }
    
    textDisplay.innerHTML = userInput;
    caretDisplay.style.right = (-6) + "px";
    textInput();
});