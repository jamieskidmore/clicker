const gameScene = new Phaser.Scene("Game");

const endPoint = -15;
const startingScore = 50;

let gameOver = false;
let timer;
let gameTimeLimit = 15;
let scoreText;
let scoreDeduction = 0;
let centerOfGravityLocation;
let cursors;

gameScene.preload = function () {
  this.load.image("background", "assets/background.png");
  this.load.image("startingPoint", "assets/startingPoint.png");
  this.load.image("ship", "assets/player3.png");
  this.load.image("meteorite", "assets/meteorite.png");
  this.load.image("star", "assets/star.png");
  this.load.image("comet", "assets/comet.png");
  this.load.image("blackHole", "assets/board.png");
};

gameScene.create = function () {
  // Create background and position it in the middle of the Scene
  const bg = this.add.sprite(0, 0, "background");
  bg.setPosition(
    this.sys.game.config.width / 2,
    this.sys.game.config.height / 2
  );

  // Initialize score as 0 in the top left corner
  scoreText = this.add.text(0, 0, `Score: ${startingScore}`);

  // Initialize game timer as 60 seconds in the top right corner
  timer = this.add.text(710, 0, `Timer: ${gameTimeLimit}`);
  timer.depth = 1;

  this.meteorites = this.physics.add.group();

  this.stars = this.physics.add.group();

  this.comets = this.physics.add.group();

  this.blackHoles = this.physics.add.group();

  this.hpDisplay = this.add.group();

  // Add event to decrease the game timer every second
  this.timerEvent = this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: countdown,
    callbackScope: this,
  });

  // Add events to spawn objects
  this.meteoriteSpawnerEvent = createEvent(150, spawnMeteorite);
  this.cometSpawnerEvent = createEvent(500, spawnComet);
  this.starSpawnerEvent = createEvent(150, spawnStar);
  this.blackHoleSpawnerEvent = createEvent(3000, spawnBlackHole);

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
      scoreDeduction += 2;
      updateScore();
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
    scoreDeduction -= 1;
    updateScore();
  });

  this.physics.add.collider(
    this.ship,
    this.blackHoles,
    function (ship, blackHole) {
      blackHole.fixed = true;
      createCenterOfGravity(blackHole);
    }
  );

  // Assign cursor keys (up, down, left, right) object to cursors variable
  cursors = this.input.keyboard.createCursorKeys();
};

gameScene.update = function () {
  if (this.ship.y < endPoint || gameTimeLimit === 0 || gameScene.ship.hp < 1) {
    displayGameOver();
    destroyAll();
  } else {
    handleShipMovement();
  }

  moveObjects();

  updateHp();

  if (centerOfGravityLocation) {
    let meteorites = this.meteorites.getChildren();
    let comets = this.comets.getChildren();
    let stars = this.stars.getChildren();
    meteorites.forEach((meteorite) => {
      moveToCenterOfGravity(meteorite, centerOfGravityLocation);
    });
    comets.forEach((comet) => {
      moveToCenterOfGravity(comet, centerOfGravityLocation);
      // destory the comets that are to the left of the black hole because there was a bug where they weren't being sucked in
      if (comet.x < centerOfGravityLocation.x) {
        comet.destroy();
      }
    });
    stars.forEach((star) => {
      moveToCenterOfGravity(star, centerOfGravityLocation);
    });
    moveToCenterOfGravity(this.ship, centerOfGravityLocation);
    this.ship.depth = -1;
  }
};

createEvent = function (delay, callback) {
  const event = gameScene.time.addEvent({
    delay: delay,
    loop: true,
    callback: callback,
    callbackScope: this,
  });
  return event;
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

  gameScene.blackHoles.getChildren().forEach((blackHole) => {
    console.log(blackHole.fixed);
    if (!blackHole.fixed) moveRight(blackHole);
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

updateHp = function () {
  const hpOnScreen = gameScene.hpDisplay.getChildren().length;
  if (hpOnScreen > gameScene.ship.hp) {
    let usedHp = gameScene.hpDisplay.getChildren()[hpOnScreen - 1];
    usedHp.destroy();
  }
};

updateScore = function () {
  let score = startingScore - scoreDeduction;
  scoreText.setText(`Score: ${score}`);
};

spawnMeteorite = function () {
  if (!gameOver) {
    const meteorite = gameScene.add.sprite(
      800,
      Phaser.Math.Between(0, 600),
      "meteorite"
    );

    gameScene.meteorites.add(meteorite);
  }
};

spawnComet = function () {
  if (!gameOver && !centerOfGravityLocation) {
    const comet = gameScene.add.sprite(
      800,
      Phaser.Math.Between(0, 600),
      "comet"
    );

    gameScene.comets.add(comet);
  }
};

spawnStar = function () {
  if (!gameOver) {
    const star = gameScene.add.sprite(0, Phaser.Math.Between(0, 600), "star");

    gameScene.stars.add(star);
  }
};

spawnBlackHole = function () {
  if (!gameOver && !centerOfGravityLocation) {
    const blackHole = gameScene.add.sprite(
      0,
      Phaser.Math.Between(0, 600),
      "blackHole"
    );
    blackHole.setScale(0.2);
    gameScene.blackHoles.add(blackHole);
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
  let newX = object.x - 10;
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

createCenterOfGravity = function (blackHole) {
  let x = blackHole.x;
  let y = blackHole.y;

  centerOfGravityLocation = { x, y };
};

moveToCenterOfGravity = function (object, centerOfGravity) {
  if (!gameOver) {
    const angle = Phaser.Math.Angle.Between(
      object.x,
      object.y,
      centerOfGravity.x,
      centerOfGravity.y
    );
    const velocity = 10;
    object.x += velocity * Math.cos(angle);
    object.y += velocity * Math.sin(angle);
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
  gameScene.blackHoles.getChildren().forEach((blackHole) => {
    blackHole.destroy();
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
