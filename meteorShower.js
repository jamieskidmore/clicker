const gameScene = new Phaser.Scene("Game");

const endPoint = -15;
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
  this.load.image("star", "assets/star.png");
  this.load.image("comet", "assets/comet.png");
};

let cursors;

gameScene.create = function () {
  // Create background and position it in the middle of the Scene
  const bg = this.add.sprite(0, 0, "background");
  bg.setPosition(
    this.sys.game.config.width / 2,
    this.sys.game.config.height / 2
  );

  // Initialize score as 0 in the top left corner
  scoreText = this.add.text(0, 0, "Score: 0");

  // Initialize game timer as 60 seconds in the top right corner
  timer = this.add.text(710, 0, `Timer: ${gameTimeLimit}`);
  timer.depth = 1;

  // Create a group for all meteorites
  this.meteorites = this.physics.add.group();

  this.stars = this.physics.add.group();

  this.comets = this.physics.add.group();

  this.hpDisplay = this.add.group();

  // Add event to decrease the game timer every second
  this.timerEvent = this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: countdown,
    callbackScope: this,
  });

  // Add event to spawn meteorites
  this.meteoriteSpawnerEvent = this.time.addEvent({
    delay: 150,
    loop: true,
    callback: spawnMeteorite,
    callbackScope: this,
  });

  // Add event to spawn comets
  this.cometSpawnerEvent = this.time.addEvent({
    delay: 700,
    loop: true,
    callback: spawnComet,
    callbackScope: this,
  });

  // Add event to spawn stars
  this.starSpawnerEvent = this.time.addEvent({
    delay: 150,
    loop: true,
    callback: spawnStar,
    callbackScope: this,
  });

  // Create the planet where the ship spawns
  this.startingPoint = this.add.sprite(400, 530, "startingPoint");
  this.startingPoint.setScale(4);
  this.startingPoint.depth = 1;

  // Create the ship that the player controls
  this.ship = this.physics.add.sprite(400, 475, "ship");
  this.ship.depth = 2;
  this.ship.speed = 3;
  this.ship.hp = 4;

  // Create hp icons in the bottom left corner
  for (let i = 0; i < this.ship.hp; i++) {
    let hp = this.add.sprite(this.ship.width / 2 + i * 30, 580, "ship");
    this.hpDisplay.add(hp);
  }

  // Decrease score and destroy meteorite upon ship-metoerite collision
  this.physics.add.collider(
    this.ship,
    this.meteorites,
    function (ship, meteorite) {
      meteorite.destroy();
      scoreDeduction += 5;
      updateScore(ship.y);
    }
  );

  // Slow down ship upon comet-ship collision
  this.physics.add.collider(this.ship, this.comets, function (ship, comet) {
    comet.destroy();
    slowDownShip();
  });

  // Increase score upon star-ship collision
  this.physics.add.collider(this.ship, this.stars, function (ship, star) {
    star.destroy();
    scoreDeduction -= 5;
    updateScore(ship.y);
  });

  // Assign cursor keys (up, down, left, right) object to cursors variable
  cursors = this.input.keyboard.createCursorKeys();
};

gameScene.update = function () {
  console.log(this.ship.y);
  if (
    this.ship.y < endPoint ||
    gameTimeLimit === 0 ||
    gameScene.ship.hp === 0
  ) {
    displayGameOver();
  }

  moveObjects();

  if (!gameOver) {
    handleShipMovement();
  } else {
    destroyAll();
  }

  const hpOnScreen = this.hpDisplay.getChildren().length;
  console.log(hpOnScreen);
  console.log(this.ship.hp);
  if (hpOnScreen > this.ship.hp) {
    let usedHp = this.hpDisplay.getChildren()[hpOnScreen - 1];
    usedHp.destroy();
  }
};

moveObjects = function () {
  gameScene.meteorites.getChildren().forEach((meteorite) => {
    moveLeft(meteorite);
  });

  gameScene.comets.getChildren().forEach((comet) => {
    moveLeftFast(comet);
  });

  gameScene.stars.getChildren().forEach((star) => {
    moveRight(star);
  });
};

handleShipMovement = function () {
  let shipAngle = gameScene.ship.angle;
  let shipX = gameScene.ship.x;
  let shipY = gameScene.ship.y;
  let shipSpeed = gameScene.ship.speed;
  let shipWidth = gameScene.ship.width;
  let gameWidth = gameScene.sys.game.config.width;
  if (cursors.right.isDown) {
    if (shipX < gameWidth - shipWidth / 2) {
      gameScene.ship.x += shipSpeed;
      if (shipAngle === 180 || shipAngle === -135 || shipAngle === 135) {
        gameScene.ship.angle = 135;
      } else {
        gameScene.ship.angle = 45;
      }
    }
  }
  if (cursors.left.isDown) {
    if (shipX > 0 + shipWidth / 2) {
      gameScene.ship.x -= shipSpeed;
      if (shipAngle === 180 || shipAngle === -135 || shipAngle === 135) {
        gameScene.ship.angle = -135;
      } else {
        gameScene.ship.angle = -45;
      }
    }
  }
  if (cursors.up.isDown) {
    gameScene.ship.y -= shipSpeed;
    gameScene.ship.angle = 0;
  }
  if (cursors.down.isDown) {
    if (shipY < 470) {
      gameScene.ship.y += shipSpeed;
      gameScene.ship.angle = 180;
    }
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

spawnComet = function () {
  if (!gameOver) {
    const comet = gameScene.add.sprite(
      800,
      Phaser.Math.Between(0, 600),
      "comet"
    );

    this.comets.add(comet);
  }
};

spawnStar = function () {
  if (!gameOver) {
    const star = gameScene.add.sprite(0, Phaser.Math.Between(0, 600), "star");

    this.stars.add(star);
  }
};

moveLeft = function (object) {
  let newX = object.x - 4;
  object.x = newX;
  if (object.x === 0) {
    object.destroy();
  }
};

moveLeftFast = function (object) {
  let newX = object.x - 20;
  object.x = newX;
  if (object.x === 0) {
    object.destroy();
  }
};

moveRight = function (object) {
  let newX = object.x + 4;
  object.x = newX;
  if (object.x === 800) {
    object.destroy();
  }
};

slowDownShip = function () {
  gameScene.ship.speed /= 2;
  gameScene.ship.hp -= 1;
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

destroyAll = function () {
  gameScene.meteorites.getChildren().forEach((meteorite) => {
    meteorite.destroy();
  });
  gameScene.comets.getChildren().forEach((comet) => {
    comet.destroy();
  });
  gameScene.stars.getChildren().forEach((star) => {
    star.destroy();
  });
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
