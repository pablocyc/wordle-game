import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import WORDS from '../assets/words.json';
import './WordleWord';
import './WordleKeyboard';

const LOSE_SOUND = new Audio('sounds/lose.mp3');
const WIN_SOUND = new Audio('sounds/win.mp3');

const LETTERS = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ",
  "z", "x", "c", "v", "b", "n", "m"
]

class WordleGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.startGame()
  }

  static get styles() {
    return /* css */`
      :host {
        --exact-color: #6aaa64;
        --exist-color: #c9b458;
        --used-color: #3a3a3c;
        font-family: Montserrat, sans-serif;
      }

      .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100vh;
      }

      h1 {
        text-transform: upperCase;
        border-bottom: 1px solid #666;
      }

      .words {
        display: flex;
        flex-direction: column;
        font-weight: bold;
      }
    `;
  }

  startGame() {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    this.secretWord = word
    console.log(word)
    this.ending = false
  }

  connectedCallback() {
    this.render();
    this.currentWord = this.shadowRoot.querySelector('wordle-word[current]')
    this.keyboard = this.shadowRoot.querySelector('wordle-keyboard')
    document.addEventListener('keyup', ev => this.pushLetter(ev.key))
    document.addEventListener('keyboard', ev => this.pushLetter(ev.detail))
  }

  pushLetter(letter) {
    if (this.ending) return
    
    const key = letter.toLowerCase()
    const isEnter = key === 'enter'
    const isBackspace = key === 'backspace'
    const isLetter = LETTERS.includes(key)
    const isEmptyWord = this.currentWord.isEmpty()

    isEnter && this.checkRestrictions()
    isBackspace && this.currentWord.removeLetter()

    if (isLetter && isEmptyWord) {
      this.currentWord.addLetter(key)
    }
  }

  checkRestrictions() {
    const isEmpty = this.currentWord.isEmpty()

    if (isEmpty) {
      alert('La palabra debe tener 5 letras')
      return
    }

    const word = this.currentWord.toString()
    const existWord = WORDS.includes(word)
    if (!existWord) {
      alert('La palabra no existe')
      return
    }

    const solve = this.resolve()
    if (!solve) {
      this.nextWord()
      return
    }

    this.win()
  }

  resolve () {
    const word = this.currentWord.toString()
    const possibleLetter = word.split('')
    const secretLetters = this.secretWord.split('')

    possibleLetter.forEach( (letter, index) => {
      const exactLetter = letter === this.secretWord[index]
      if (exactLetter) { 
        this.currentWord.setExactLetter(index)
        this.keyboard.setLetter(letter, "exact");
        secretLetters[index] = ' '
      }
    })

    possibleLetter.forEach( (letter, index) => {
      const existLetter = secretLetters.includes(letter)

      if (existLetter) {
        this.currentWord.setExistLetter(index)
        this.keyboard.setLetter(letter, "exist");
        const pos = secretLetters.findIndex( l => l === letter)
        secretLetters[pos] = ' '
      } else {
        this.keyboard.setLetter(letter, "used");
      }
    })

    this.currentWord.classList.add('sended')
    this.currentWord.setRAELink(word)
    return this.currentWord.isSolved()
  }

  nextWord () {
    this.currentWord = this.shadowRoot.querySelector('wordle-word[current]')
    const nextWord = this.currentWord.nextElementSibling

    if (nextWord) {
      nextWord.setAttribute('current', '')
      this.currentWord.removeAttribute('current')
      this.currentWord = nextWord
      return
    }

    this.lose()
  }

  win () {
    WIN_SOUND.volume = 0.2
    WIN_SOUND.play()
    confetti()
    this.ending = true
  }

  lose () {
    LOSE_SOUND.play()
    this.ending = true
    alert('Perdiste')
  }

  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${WordleGame.styles}</style>
    <div class="container">
      <h1>Wordle</h1>
      <div class="words">
        <wordle-word current></wordle-word>
        <wordle-word></wordle-word>
        <wordle-word></wordle-word>
        <wordle-word></wordle-word>
        <wordle-word></wordle-word>
        <wordle-word></wordle-word>
      </div>
      <wordle-keyboard></wordle-keyboard>
    </div>`;
  }
}

customElements.define("wordle-game", WordleGame);