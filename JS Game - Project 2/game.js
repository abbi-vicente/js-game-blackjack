// keeps track of the total sum of both dealer and player
let dealerSum = 0;
let dealerInitSum = 0;
let yourInitSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden; /*keeps track of the hidden cards*/
let deck;

let message = "";
let messageColor = "";
let canHit = true; /*allows the player to draw while yourInitSum <= 21*/
let canStay = true;

// sound effects for when a button is clicked or when a player has won or lost
const hitSound = new Audio("img/cards/sounds/Card Flip.mp3");
const blackJackSound = new Audio("img/cards/sounds/Blackjack.mp3");
const winSound = new Audio("img/cards/sounds/Win.mp3");
const loseSound = new Audio("img/cards/sounds/Lose.mp3");
const tieSound = new Audio("img/cards/sounds/Tie Score.mp3");
const shuffleSound = new Audio("img/cards/sounds/Card Shuffle.mp3");

// dealing cards and starting a new game
window.onload = function () {
	buildDeck();
	shuffleDeck();
	newGame();
	shuffleSound.play();
};

// building deck
function buildDeck() {
	let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
	let types = ["C", "D", "H", "S"];
	deck = [];

	for (let i = 0; i < types.length; i++) {
		for (let j = 0; j < values.length; j++) {
			deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
		}
	}
}

// shuffling deck
function shuffleDeck() {
	for (let i = 0; i < deck.length; i++) {
		let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
		let temp = deck[i];
		deck[i] = deck[j];
		deck[j] = temp;
	}
}

// this is what is displayed when starting a new game
function newGame() {
	hidden = deck.pop();
	dealerSum += getValue(hidden);
	dealerAceCount += checkAce(hidden);

	while (dealerSum < 17) {
		let cardImg = document.createElement("img");
		let card = deck.pop();
		cardImg.src = "img/cards/" + card + ".png";
		dealerSum += getValue(card);
		dealerAceCount += checkAce(card);
		dealerInitSum += getValue(card);
		document.getElementById("dealer-cards").append(cardImg);
	}

	for (let i = 0; i < 2; i++) {
		let cardImg = document.createElement("img");
		let card = deck.pop();
		cardImg.src = "img/cards/" + card + ".png";
		yourInitSum += getValue(card);
		yourAceCount += checkAce(card);
		document.getElementById("your-cards").append(cardImg);
		document.getElementById("your-sum").innerText = yourInitSum;
	}

	document.getElementById("your-sum").innerText = yourInitSum;
	document.getElementById("hit").addEventListener("click", hit);
	document.getElementById("stay").addEventListener("click", stay);
	document.getElementById("deal").addEventListener("click", deal);
}

// hit button or when you draw a new card
function hit() {
	if (!canHit) {
		return;
	}

	hidden = deck.pop();
	dealerSum = getValue(hidden) + dealerInitSum;
	let cardImg = document.createElement("img");
	let card = deck.pop();
	cardImg.src = "img/cards/" + card + ".png";
	yourInitSum += getValue(card);
	yourAceCount += checkAce(card);
	document.getElementById("your-cards").append(cardImg);
	hitSound.play();
	document.getElementById("your-sum").innerText = yourInitSum;

	if (reduceAce(yourInitSum, yourAceCount) > 21) {
		canHit = false;
		document.getElementById("hidden").src = "img/cards/" + hidden + ".png";
		message = "You went over 21! You Lose! 😔";
		messageColor = "#8D1D05";
		document.getElementById("dealer-sum").innerText = dealerSum;
		loseSound.play();
	}
	document.getElementById("dealer-message").innerText = message;
	document.getElementById("dealer-message").style.color = messageColor;
	// for this, we want to get initial sum, but also take into consideration whether an ace is 1 or 11
	document.getElementById("your-sum").innerText = yourInitSum;
	document.getElementById("your-sum").innerText = `${reduceAce(yourInitSum, yourAceCount)}`;
}

// stay button. this is when you stop drawing and lets us know who wins
function stay() {
	dealerSum = reduceAce(dealerSum, dealerAceCount);
	yourInitSum = reduceAce(yourInitSum, yourAceCount);

	canHit = false;

	document.getElementById("hidden").src = "img/cards/" + hidden + ".png";

	if (yourInitSum > 21) {
		message = "You Lose! 💸";
		messageColor = "#8D1D05";
		loseSound.play();
	} else if (dealerSum > 21) {
		message = "Dealer went over 21 and got busted! You win! 😝";
		messageColor = "#B2FFFF";
		winSound.play();
	} else if (yourInitSum === 21) {
		message = "Blackjack! You win! 🤑";
		messageColor = "#B2FFFF";
		blackJackSound.play();
	}
	//for when the player and the dealer gets a score less than 21
	else if (yourInitSum < dealerSum) {
		message = "You stood with a lower score than the dealer. You Lose! 😭";
		messageColor = "#8D1D05";
		loseSound.play();
	} else if (yourInitSum > dealerSum) {
		message = "You stood with a higher score than the dealer. You Win! 🥳";
		messageColor = "#B2FFFF";
		winSound.play();
	} else if (yourInitSum === dealerSum) {
		message = "Tie!";
		tieSound.play();
	}

	document.getElementById("your-sum").innerText = yourInitSum;
	document.getElementById("your-sum").innerText = `${reduceAce(yourInitSum, yourAceCount)}`;
	document.getElementById("dealer-sum").innerText = dealerSum;
	document.getElementById("dealer-message").innerText = message;
	document.getElementById("dealer-message").style.color = messageColor;
}

// if the card is NaN, we want to define whether it's an ace or face cards
function getValue(card) {
	let data = card.split("-");
	let value = data[0];

	if (isNaN(value)) {
		//A J Q K
		if (value == "A") {
			return 11;
		}
		return 10;
	}
	return parseInt(value);
}

// we want to check here if we have an ace on our hand
function checkAce(card) {
	if (card[0] == "A") {
		return 1;
	}
	return 0;
}

// if we have an ace on our hand, we want to know whether its value will will be subtracted from our initial total or not
function reduceAce(yourInitSum, yourAceCount) {
	while (yourInitSum > 21 && yourAceCount > 0) {
		yourInitSum -= 10;
		yourAceCount -= 1;
	}
	return yourInitSum;
}

// reset game
function deal() {
	document.location.reload();
}
