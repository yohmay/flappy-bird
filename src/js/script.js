function createElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Barrier(reverse = false) {
  this.element = createElement("div", "barrier");

  const border = createElement("div", "border");
  const body = createElement("div", "body");
  this.element.appendChild(reverse ? body : border);
  this.element.appendChild(reverse ? border : body);

  this.setHeight = (height) => (body.style.height = `${height}px`);
}

class PairOfBarriers {
  constructor(height, opening, x) {
    this.element = createElement("div", "pair-of-barriers");

    this.upper = new Barrier(true);
    this.lower = new Barrier(false);

    this.element.appendChild(this.upper.element);
    this.element.appendChild(this.lower.element);

    this.randomizeOpening = () => {
      const upperHeight = Math.random() * (height - opening);
      const lowerHeight = height - opening - upperHeight;
      this.upper.setHeight(upperHeight);
      this.lower.setHeight(lowerHeight);
    };

    this.getX = () => parseInt(this.element.style.left.split("px")[0]);
    this.setX = (x) => (this.element.style.left = `${x}px`);
    this.getWidth = () => this.element.clientWidth;

    this.randomizeOpening();
    this.setX(x);
  }
}

class Barriers {
  constructor(height, width, opening, spacing, notifyScore) {
    this.pairs = [
      new PairOfBarriers(height, opening, width),
      new PairOfBarriers(height, opening, width + spacing),
      new PairOfBarriers(height, opening, width + spacing * 2),
      new PairOfBarriers(height, opening, width + spacing * 3),
    ];

    const displacement = 3;
    this.animate = () => {
      this.pairs.forEach((pair) => {
        pair.setX(pair.getX() - displacement);

        if (pair.getX() < -pair.getWidth()) {
          pair.setX(pair.getX() + spacing * this.pairs.length);
          pair.randomizeOpening();
        }

        const middle = width / 2;
        const crossedMiddle =
          pair.getX() + displacement >= middle && pair.getX() < middle;
        if (crossedMiddle) notifyScore();
      });
    };
  }
}

class Bird {
  constructor(gameHeight) {
    let flying = false;

    this.element = createElement("img", "bird");
    this.element.src = "images/bird.png";

    this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
    this.setY = (y) => (this.element.style.bottom = `${y}px`);

    window.onkeydown = (e) => (flying = true);
    window.onkeyup = (e) => (flying = false);

    this.animate = () => {
      const newY = this.getY() + (flying ? 9 : -5);
      const maxHeight = gameHeight - this.element.clientHeight;

      if (newY <= 0) {
        this.setY(0);
      } else if (newY >= maxHeight) {
        this.setY(maxHeight);
      } else {
        this.setY(newY);
      }
    };

    this.setY(gameHeight / 2);
  }
}

function ScoreDisplay() {
  this.element = createElement("span", "score");
  this.updateScore = (score) => {
    this.element.innerHTML = score;
  };
  this.updateScore(0);
}

function areOverlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function hasCollided(bird, barriers) {
  let collided = false;
  barriers.pairs.forEach((pairOfBarriers) => {
    if (!collided) {
      const upper = pairOfBarriers.upper.element;
      const lower = pairOfBarriers.lower.element;
      collided =
        areOverlapping(bird.element, upper) ||
        areOverlapping(bird.element, lower);
    }
  });
  return collided;
}

function FlappyBirdGame() {
  let score = 0;

  const gameArea = document.querySelector(".flappy-game");
  const gameHeight = gameArea.clientHeight;
  const gameWidth = gameArea.clientWidth;

  const scoreDisplay = new ScoreDisplay();
  const barriers = new Barriers(gameHeight, gameWidth, 400, 400, () =>
    scoreDisplay.updateScore(++score)
  );
  const bird = new Bird(gameHeight);

  gameArea.appendChild(scoreDisplay.element);
  gameArea.appendChild(bird.element);
  barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));

  this.start = () => {
    const timer = setInterval(() => {
      barriers.animate();
      bird.animate();

      if (hasCollided(bird, barriers)) {
        clearInterval(timer);
      }
    }, 15);
  };
}

new FlappyBirdGame().start();