// Sample Magic: The Gathering trivia questions
export const questionBank = [
  {
    id: 0,
    question: "What are the five colors of mana in Magic: The Gathering?",
    answers: [
      { letter: 'A', text: 'Red, Blue, Green, Black, White', correct: true },
      { letter: 'B', text: 'Red, Blue, Green, Yellow, Purple', correct: false },
      { letter: 'C', text: 'Fire, Water, Earth, Air, Spirit', correct: false },
      { letter: 'D', text: 'Red, Blue, Green, Orange, Pink', correct: false }
    ]
  },
  {
    id: 1,
    question: "What is the maximum number of cards you can have in your opening hand?",
    answers: [
      { letter: 'A', text: '5 cards', correct: false },
      { letter: 'B', text: '6 cards', correct: false },
      { letter: 'C', text: '7 cards', correct: true },
      { letter: 'D', text: '8 cards', correct: false }
    ]
  },
  {
    id: 2,
    question: "Which card type can attack and block?",
    answers: [
      { letter: 'A', text: 'Enchantment', correct: false },
      { letter: 'B', text: 'Creature', correct: true },
      { letter: 'C', text: 'Sorcery', correct: false },
      { letter: 'D', text: 'Planeswalker', correct: false }
    ]
  },
  {
    id: 3,
    question: "What happens when you reach 0 or less life?",
    answers: [
      { letter: 'A', text: 'You shuffle your library', correct: false },
      { letter: 'B', text: 'You draw a card', correct: false },
      { letter: 'C', text: 'You lose the game', correct: true },
      { letter: 'D', text: 'Nothing happens', correct: false }
    ]
  },
  {
    id: 4,
    question: "What is the name of the multiverse in Magic: The Gathering?",
    answers: [
      { letter: 'A', text: 'The Eternities', correct: false },
      { letter: 'B', text: 'The Multiverse', correct: true },
      { letter: 'C', text: 'The Planes', correct: false },
      { letter: 'D', text: 'The Cosmos', correct: false }
    ]
  }
];