type SummonedWords = {
    divElement: HTMLDivElement,
    word: string,
}

let paused = true;
let inPlay = false;
let summonedWords: SummonedWords[] = [];
let userInput = "";
let timeoutID: ReturnType<typeof setTimeout> | undefined = undefined;
const healthBar: HTMLElement = document.getElementById("health-bar")!;
const wordsTypedDisplay: HTMLElement = document.getElementById("words-typed-display")!;
const accuracyDisplay: HTMLElement = document.getElementById("accuracy-display")!;
let playerHealth = 100;
let wordsSummoned = 0;
let wordsTyped = 0;
let wordsMissed = 0;

async function getWords(): Promise<any> {
    let data: any = JSON.parse(localStorage.getItem("words")!);
    if (!data) {
        const response = await fetch("https://random-word-api.herokuapp.com/all");
        data = await response.json();
        localStorage.setItem("words", JSON.stringify(data));
    }
    return data;
}

async function shuffle(words: string[]): Promise<string[]> {
    const response: string[] = await new Promise((resolve, reject) => {
        setTimeout(() => {
            let currentIndex = words.length;

            while (currentIndex !== 0) {
                const randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                
                [words[currentIndex], words[randomIndex]] = [
                    words[randomIndex], words[currentIndex]];
            }

            resolve(words.map((word) => word));
        }, 500);
    });

    return response;
}

function textInput() {
    for (let i = 0; i < summonedWords.length; i++) {
        const { divElement, word } = summonedWords[i];

        if (word.includes(userInput) && word[0] === userInput[0]) {
            divElement.querySelectorAll(".typed-word")[0].textContent = userInput;
        } else {
            divElement.querySelectorAll(".typed-word")[0].textContent = "";
        }
    }
}

function setAccuracyDislpay() {
    let playerAccuracy: number = ((wordsSummoned - wordsMissed) / wordsSummoned * 100);

    if (wordsTyped === 0) {
        playerAccuracy = 0;
    }
    
    accuracyDisplay.innerHTML = `${playerAccuracy.toFixed(2)}%`;
}

function summonWord(word: string): HTMLDivElement | undefined {
    if (!paused) {
        const playfieldEl = document.getElementById("playfield")!;
        const divElement = document.createElement("div");
        const text = document.createTextNode(word);
        divElement.appendChild(text);
        divElement.classList.add("word");
    
        const spanElement = document.createElement("span");
        if (word.includes(userInput) && word[0] === userInput[0]) {
            spanElement.textContent = userInput;
        }
        spanElement.classList.add("typed-word");
        divElement.appendChild(spanElement);

        divElement.style.top = "-25px";
        playfieldEl.appendChild(divElement);
        
        const playfieldWidth = playfieldEl.getBoundingClientRect().width;
        const widthToDeduct = divElement.getBoundingClientRect().width;

        const randomX = Math.floor(Math.random() * playfieldWidth);
        const randomLeft = randomX < widthToDeduct ? randomX : randomX - widthToDeduct;
        
        divElement.style.left = randomLeft + "px";
    
        summonedWords.push({ divElement, word });
        wordsSummoned += 1;
    
        return divElement;
    }
}

function summonPauseScreen() {
    const playfieldEl = document.getElementById("playfield")!;
    const divElement = document.createElement("div");
    divElement.innerHTML = "<div><h1>Game Paused</h1> Click here to continue</div>";
    divElement.id = "pause-screen";

    divElement.addEventListener("click", () => {
        divElement.remove();
        paused = false;

        timeoutID = setTimeout(() => {
            summonedWords.forEach((summonedWord) => {
                caretDisplay.classList.add("blinking");
                move(summonedWord.divElement);
            });
            setup();
        }, 1000);
    });
    
    playfieldEl.appendChild(divElement);
}

function move(divElement: HTMLDivElement | undefined) {
    if (!divElement) return;
    const baseElement = document.getElementById("judgement-base")!;
    const baseY = baseElement.getBoundingClientRect().top;
    let divElementY = divElement.getBoundingClientRect().top;

    divElement.style.top = divElementY + 13 + "px";
    divElementY = divElement.getBoundingClientRect().top;

    if (divElementY < baseY - 30) {
        setTimeout(() => {
            if (!paused) {
                move(divElement);
            };
        }, 100);
    } else {
        summonedWords.shift();
        divElement.remove();
        wordsMissed += 1;
        playerHealth -= 10;
        const { height } = healthBar.getBoundingClientRect();
        healthBar.style.height = (height - 50) + "px";
        setAccuracyDislpay();

        if (playerHealth <= 0) {
            end();
        }
    }
}

function pause() {
    caretDisplay.classList.remove("blinking");
    clearTimeout(timeoutID);
    paused = true;
    summonPauseScreen();
}

function end() {
    const pauseScreen = document.getElementById("pause-screen");
    inPlay = false;
    paused = true;

    for (let i = 0; i < summonedWords.length; i++) {
        summonedWords[i].divElement.remove();
    }
    summonedWords= [];

    textDisplay.textContent = userInput = "";
    timeoutID = undefined;
    wordsSummoned = 0;
    wordsTyped = 0;
    wordsMissed = 0;
    startButton.innerHTML = "play";
    if (pauseScreen) {
        pauseScreen.remove();
    }
    caretDisplay.classList.add("blinking");
}

function start() {
    inPlay = true;
    paused = false;
    setup();
    startButton.innerHTML = "stop";
    playerHealth = 100;
    healthBar.style.height = 500 + "px";
}

function summon(words: string[]) {
    if (!paused) {
        if (words.length <= 0) {
            setup();
            return;
        }

        setTimeout(() => {
            const divElement = summonWord(words.shift()!);
            move(divElement);
            setTimeout(() => summon(words), 1200);
        }, 500);
    }
}

async function setup() {
    const words: string[] = await getWords();
    const randomWords = await shuffle(words);
    summon(randomWords);
}