let paused = false;
let summonedWords = [];
let wordTyped = "";
let timeoutID = undefined;

const inputArea = document.getElementById("input-area");

async function getRandomWords() {
    const response = await fetch("https://random-word-api.herokuapp.com/all");
    return response.json();
}

function typedText() {
    for (let i = 0; i < summonedWords.length; i++) {
        const { divElement, word } = summonedWords[i];

        if (word.includes(wordTyped)) {
            divElement.querySelectorAll(".typed-word")[0].textContent = wordTyped;
        } else {
            divElement.querySelectorAll(".typed-word")[0].textContent = "";
        }
    }
}

function summonWord(word) {
    const mainPage = document.getElementsByTagName("main")[0];
    const divElement = document.createElement("div");
    const text = document.createTextNode(word);
    divElement.appendChild(text);
    divElement.classList.add("word");
    
    const spanElement = document.createElement("span");
    if (word.includes(wordTyped)) {
        spanElement.textContent = wordTyped;
    }
    spanElement.classList.add("typed-word");
    divElement.appendChild(spanElement);

    const randomLeft = Math.floor(Math.random() * 967);
    
    divElement.style.left = randomLeft + "px";
    divElement.style.top = "20px";

    summonedWords.push({divElement, word});
    mainPage.appendChild(divElement);

    return divElement;
}

function summonPauseScreen() {
    const mainPage = document.getElementsByTagName("main")[0];
    const newDivElement = document.createElement("div");
    const newHeaderElement = document.createElement("h2");
    newHeaderElement.textContent = "Game Paused.";
    newDivElement.appendChild(newHeaderElement);

    const newButtonElement = document.createElement("button");
    newButtonElement.textContent = "Click here to continue"
    newButtonElement.addEventListener("click", () => {
        newDivElement.remove();
        paused = false;
        inputArea.focus();
        
        timeoutID = setTimeout(() => {
            if (!paused) {
                summonedWords.forEach((summonWord) => {
                    move(summonWord.divElement);
                });
                setup();
            }
        }, 1000);
    });

    newDivElement.appendChild(newButtonElement);

    mainPage.appendChild(newDivElement);
}
 
function move(wordElement) {
    const baseElement = document.getElementsByClassName("base")[0];
    const baseY = baseElement.getBoundingClientRect().top;
    let wordElementY = wordElement.getBoundingClientRect().top;

    wordElement.style.top = wordElementY + 20 + "px";
    wordElementY = wordElement.getBoundingClientRect().top;

    if (wordElementY < baseY) {
        setTimeout(() => {
            if (!paused) {
                move(wordElement);
            }
        }, 60);
    } else {
        summonedWords.shift();
        wordElement.remove();
    }
}

function start(words) {
    console.log({ dumpData });
    console.log({ words });
    if (!paused) {
        if (words.length <= 0) {
            console.log(3, "going to setup");
            setup();
            return;
        }
        setTimeout(() => {
            console.log(2, "not ready for setup");
            const worldElement = summonWord(words.shift());
            move(worldElement);
            setTimeout(() => start(words), 500)
        }, 500);
    }
}

const getDumpData = async () => {
    const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(dumpData.map(data => data));
        }, 500);
    });

    return response;
};

async function setup() {
    console.log(1, "inside setup");
    // const randomWords = await getRandomWords();
    // console.log(randomWords);
    // start(randomWords);
    const words = await getDumpData();
    start(words);
}

const dumpData = [
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

inputArea.addEventListener("focusout", (e) => {
    if (!paused) {
        clearTimeout(timeoutID);
        paused = true;
        summonPauseScreen();
    }
});

function checkEnteredWord() {
    for (let i = 0; i < summonedWords.length; i++) {
        const { divElement, word } = summonedWords[i];

        console.log(word);
        if (word === wordTyped) {
            summonedWords.splice(i, 1);
            divElement.remove();
        }
    }

    wordTyped = "";
}

document.addEventListener("keydown", (e) => {
    const alphanumericRegex = /^([a-zA-Z0-9 _-]+)$/;

    if (e.key === "Enter") {
        checkEnteredWord();
    }

    if (e.key === "Backspace") {
        wordTyped = wordTyped.slice(0, -1);
    }

    if (e.key.length <= 1 && alphanumericRegex.test(e.key)) {
        console.log(e.key);
        wordTyped += e.key;
    }

    typedText(wordTyped);
});