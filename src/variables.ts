type SummonedWords = {
    divElement: HTMLDivElement,
    word: string,
}

let paused = true;
let inPlay = false;
let summonedWords: SummonedWords[] = [];
let userInput = "";
let timeoutID: ReturnType<typeof setTimeout> | undefined = undefined;
const healthBar: HTMLElement = document.getElementById("bar")!;
const accuracyDisplay: HTMLElement = document.getElementById("accuracy-display")!;
let playerHealth = 100;
let wordsSummoned = 0;
let wordsMissed = 0;

const fakeData = [
    "abreact",
    "abreacted",
    "abreacting",
    "abreaction",
    "abreactions",
    "abreacts",
    "abreast",
    "abri",
    "abridge",
    "abridged",
    "abridgement",
    "abridgements",
    "abridger",
    "abridgers",
    "abridges",
    "abridging",
    "abridgment",
    "abridgments",
    "abris",
    "abroach",
    "abroad",
    "abrogable",
    "abrogate",
    "abrogated",
    "abrogates",
    "abrogating",
    "abrogation",
    "abrogations",
    "abrogator",
    "abrogators",
    "abrosia",
    "abrosias",
    "abrupt",
    "abrupter",
    "abruptest",
    "abruption",
    "abruptions",
    "abruptly",
    "abruptness",
    "abruptnesses",
    "abs",
];

async function getWords(): Promise<any> {
    const response = await fetch("https://random-word-api.herokuapp.com/all");
    return response.json();
}

function textInput() {
    for (let i = 0; i < summonedWords.length; i++) {
        const { divElement, word } = summonedWords[i];

        if (word.includes(userInput)) {
            divElement.querySelectorAll(".typed-word")[0].textContent = userInput;
        } else {
            divElement.querySelectorAll(".typed-word")[0].textContent = "";
        }
    }
}

function summonWord(word: string): HTMLDivElement | undefined {
    if (!paused) {
        const mainPageEl = document.getElementsByTagName("main")[0];
        const divElement = document.createElement("div");
        const text = document.createTextNode(word);
        divElement.appendChild(text);
        divElement.classList.add("word");
    
        const spanElement = document.createElement("span");
        if (word.includes(userInput)) {
            spanElement.textContent = userInput;
        }
        spanElement.classList.add("typed-word");
        divElement.appendChild(spanElement);
    
        const randomLeft = Math.floor(Math.random() * 967);
        
        divElement.style.left = randomLeft + "px";
        divElement.style.top = "20px";
    
        summonedWords.push({ divElement, word });
        mainPageEl.appendChild(divElement);
        wordsSummoned += 1;
    
        return divElement;
    }
}

function summonPauseScreen() {
    const mainPageEl = document.getElementsByTagName("main")[0];
    const divElement = document.createElement("div");
    const headerEl = document.createElement("h1");
    headerEl.textContent = "Game Paused.";
    divElement.appendChild(headerEl);

    const buttonEl = document.createElement("button");
    buttonEl.textContent = "Click here to continue";
    buttonEl.addEventListener("click", () => {
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
    buttonEl.classList.add("play-button");

    divElement.appendChild(buttonEl);
    mainPageEl.appendChild(divElement);
}

function move(divElement: HTMLDivElement | undefined) {
    if (!divElement) return;
    const baseElement = document.getElementsByClassName("base")[0];
    const baseY = baseElement.getBoundingClientRect().top;
    let divElementY = divElement.getBoundingClientRect().top;

    divElement.style.top = divElementY + 20 + "px";
    divElementY = divElement.getBoundingClientRect().top;

    const playerAccuracy = ((wordsSummoned - wordsMissed) / wordsSummoned * 100).toFixed(2);
    accuracyDisplay.innerHTML = `${playerAccuracy}%`;

    if (divElementY < baseY) {
        setTimeout(() => {
            if (!paused) {
                move(divElement);
            };
        }, 60);
    } else {
        summonedWords.shift();
        divElement.remove();
        wordsMissed += 1;
        playerHealth -= 10;
        const { height } = healthBar.getBoundingClientRect();
        healthBar.style.height = (height - 50) + "px";

        if (playerHealth <= 0) {
            end();
        }
    }
}

function end() {
    inPlay = false;
    paused = true;

    for (let i = 0; i < summonedWords.length; i++) {
        summonedWords[i].divElement.remove();
    }
    summonedWords= [];

    userInput = "";
    timeoutID = undefined;
    startButton.innerHTML = "play";
}

function start(words: string[]) {
    if (!paused) {
        if (words.length <= 0) {
            setup();
            return;
        }

        setTimeout(() => {
            const divElement = summonWord(words.shift()!);
            move(divElement);
            setTimeout(() => start(words), 500);
        }, 500);
    }
}

async function getFakeData(): Promise<string[]> {
    const response: string[] = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(fakeData.map((data) => data));
        }, 500);
    });

    return response;
}

async function setup() {
    // const words: string[] = await getWords();
    // console.log(words);
    // start(words);
    const words: string[] = await getFakeData();
    start(words);
}