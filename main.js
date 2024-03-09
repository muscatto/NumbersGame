import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDwWkVyWCVuFjJVOPWQwFtKIAeDEMD_yt0",
  authDomain: "my-numbers-game-525b7.firebaseapp.com",
  projectId: "my-numbers-game-525b7",
  storageBucket: "my-numbers-game-525b7.appspot.com",
  messagingSenderId: "46795804306",
  appId: "1:46795804306:web:eca6d2172505c37d09e04b",
};

async function addData(name, time) {
  try {
    const docRef = await addDoc(collection(db, "rank"), {
      name: name,
      time: time,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

function showData() {
  for (let i = 0; i < results.length; i++) {
    const nameElem = document.getElementById(`name-${i}`);
    const timeElem = document.getElementById(`time-${i}`);
    nameElem.textContent = results[i].name;
    timeElem.textContent = results[i].time;
  }
}

async function readData() {
  const q = query(collection(db, "rank"), orderBy("time"), limit(5));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    results.push({
      name: doc.data().name,
      time: doc.data().time,
      createdAt: doc.data().createElement,
    });
  });
  console.log(results);
  showData();
}

class Panel {
  constructor(game) {
    this.game = game;
    this.el = document.createElement("li");
    this.el.classList.add("pressed");

    this.el.addEventListener("click", () => {
      this.check();
    });
  }

  getEl() {
    return this.el;
  }

  activate(num) {
    this.el.classList.remove("pressed");
    this.el.textContent = num;
  }

  check() {
    if (currentNum !== parseInt(this.el.textContent, 10)) {
      return;
    }
    this.el.classList.add("pressed");
    currentNum++;

    if (currentNum !== 25) {
      return;
    }
    clearTimeout(this.game.getTimeoutId());
    // 紙吹雪とモーダル
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    const close = document.getElementById("close");
    const modal = document.getElementById("modal");
    const mask = document.getElementById("mask");
    const finishedTime = document.getElementById("finished-time");
    modal.classList.remove("hidden");
    mask.classList.remove("hidden");
    finishedTime.textContent = `Time: ${this.game.getTimerTime()} s`;
    close.addEventListener("click", () => {
      modal.classList.add("hidden");
      mask.classList.add("hidden");
    });
    mask.addEventListener("click", () => {
      close.click();
    });
    // ここまで
    const submitName = prompt("名前を入力してください");
    if (typeof submitName !== "string") {
      return;
    }
    addData(submitName, Number(this.game.getTimerTime()));
  }
}

class Board {
  constructor(game) {
    this.game = game;
    this.panels = [];
    for (let i = 0; i < 25; i++) {
      this.panels.push(new Panel(this.game));
    }
    this.setup();
  }

  setup() {
    const board = document.getElementById("board");
    this.panels.forEach((panel) => {
      board.appendChild(panel.getEl());
    });
  }

  activate() {
    const nums = [];
    for (let i = 0; i < 25; i++) {
      nums.push(i);
    }
    this.panels.forEach((panel) => {
      const num = nums.splice(Math.floor(Math.random() * nums.length), 1)[0];
      panel.activate(num);
    });
  }
}

class Game {
  constructor() {
    this.board = new Board(this);
    currentNum = undefined;
    this.startTime = undefined;
    this.timeoutId = undefined;
    this.timer = document.getElementById("timer");

    const btn = document.getElementById("btn");
    btn.addEventListener("click", () => {
      this.start();
    });
    readData();
  }

  runTimer() {
    this.timer.textContent = ((Date.now() - this.startTime) / 1000).toFixed(2);
    this.timeoutId = setTimeout(() => {
      this.runTimer();
    }, 10);
  }

  getTimerTime() {
    return this.timer.textContent;
  }

  start() {
    if (typeof this.timeoutId !== "undefined") {
      clearTimeout(this.timeoutId);
    }
    currentNum = 0;
    this.board.activate();
    this.startTime = Date.now();
    this.runTimer();
  }

  getTimeoutId() {
    return this.timeoutId;
  }
}

window.location.href('https://muscatto.github.io/NumbersGameReact/')
let currentNum = undefined;
let results = [];
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
new Game();
