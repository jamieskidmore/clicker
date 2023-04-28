const gameScene = new Phaser.Scene("Game");

const endPoint = -25;
const scoreFactor = 10;

let gameOver = false;
let timer;
let gameTimeLimit = 15;
let scoreText;
let scoreDeduction = 0;

gameScene.preload = function () {
  this.load.image("background", "assets/background.png");
  this.load.image("startingPoint", "assets/startingPoint.png");
  this.load.image("ship", "assets/player3.png");
  this.load.image("meteorite", "assets/meteorite.png");
};
gameScene.create = function () {
  const bg = this.add.sprite(0, 0, "background");
  bg.setPosition(
    this.sys.game.config.width / 2,
    this.sys.game.config.height / 2
  );

  scoreText = this.add.text(0, 0, "Score: 0");

  timer = this.add.text(710, 0, `Timer: ${gameTimeLimit}`);
  timer.depth = 1;

  this.meteorites = this.physics.add.group();

  this.meteoriteSpawnerEvent = this.time.addEvent({
    delay: 150,
    loop: true,
    callback: spawnMeteorite,
    callbackScope: this,
  });

  this.timerEvent = this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: countdown,
    callbackScope: this,
  });

  this.startingPoint = this.add.sprite(400, 530, "startingPoint");
  this.startingPoint.setScale(4);
  this.startingPoint.depth = 1;

  this.ship = this.physics.add.sprite(400, 475, "ship");
  this.ship.depth = 2;
  this.input.on("pointerdown", moveShipUp, this);

  this.physics.add.collider(
    this.ship,
    this.meteorites,
    function (ship, meteorite) {
      meteorite.destroy();
      scoreDeduction += 5;
      updateScore(ship.y);
    }
  );
};

gameScene.update = function () {
  this.meteorites.getChildren().forEach((meteorite) => {
    moveMeteoriteLeft(meteorite);
  });
  if (this.ship.y == endPoint || gameTimeLimit === 0) {
    displayGameOver();
  }
};

moveShipUp = function () {
  if (!gameOver) {
    this.ship.y -= 10;
    updateScore(this.ship.y);
  }
};

updateScore = function (shipPosition) {
  let score = Math.floor((475 - shipPosition) / scoreFactor);
  score -= scoreDeduction;
  scoreText.setText(`Score: ${score}`);
};

spawnMeteorite = function () {
  if (!gameOver) {
    const meteorite = gameScene.add.sprite(
      800,
      Phaser.Math.Between(0, 600),
      "meteorite"
    );

    this.meteorites.add(meteorite);
  }
};

moveMeteoriteLeft = function (meteorite) {
  let newX = meteorite.x - 4;
  meteorite.x = newX;
  if (meteorite.x === 0) {
    meteorite.destroy();
  }
};

displayGameOver = function () {
  gameOver = true;
  const gameOverText = gameScene.add.text(
    gameScene.sys.game.config.width / 2,
    gameScene.sys.game.config.height / 2,
    "Game Over"
  );
  gameOverText.setOrigin(0.5);
  gameOverText.setScale(2);
};

countdown = function () {
  if (gameTimeLimit > 0) {
    gameTimeLimit--;
  }
  timer.setText(`Timer: ${gameTimeLimit}`);
};

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: gameScene,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
