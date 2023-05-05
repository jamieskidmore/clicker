const gameScene = new Phaser.Scene("Game");

const endPoint = -15;
const speed = 120;
const startingScore = 50;
const gameTimeLimit = 15;
const gameEndDelay = 2000;

let gameIsStarted;
let gameOver;
let time;
let score;
let scoreDeduction;
let centerOfGravityLocation;
let cursors;
let shipVelocity;

gameScene.preload = function () {
  this.load.image("background", "assets/background.png");
  this.load.image("startingPoint", "assets/startingPoint.png");
  this.load.image("ship", "assets/player3.png");
  this.load.image("meteorite", "assets/meteorite.png");
  this.load.image("star", "assets/star.png");
  this.load.image("comet", "assets/comet.png");
  this.load.image("blackHole", "assets/board.png");
  this.load.image("arrow", "assets/arrowIcon.png");
  this.load.image("startButton", "assets/startButton.png");
};

gameScene.create = function () {
  // Create background and position it in the middle of the Scene
  const bg = this.add.sprite(0, 0, "background");
  bg.setPosition(
    this.sys.game.config.width / 2,
    this.sys.game.config.height / 2
  );

  // Initialize score as 0 in the top left corner
  this.scoreText = this.add.text(0, 0, `Score: ${startingScore}`);

  // Initialize game timer as 60 seconds in the top right corner
  this.timer = this.add.text(710, 0, `Timer: ${gameTimeLimit}`);
  this.timer.depth = 1;

  this.meteorites = this.physics.add.group();

  this.stars = this.physics.add.group();

  this.comets = this.physics.add.group();

  this.blackHoles = this.physics.add.group();

  this.hpDisplay = this.add.group();

  // Add event to decrease the game timer every second
  this.timerEvent = this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: () => {
      countdown(this.timer, 60); // pass the timer object and gameTimeLimit as parameters
    },
    callbackScope: this,
  });

  // Add events to spawn objects
  this.meteoriteSpawnerEvent = createEvent(this, 150, () => {
    spawn(this, "meteorite", "meteorites", 4, 800);
  });
  this.cometSpawnerEvent = createEvent(this, 1200, () => {
    spawn(this, "comet", "comets", 10, 800);
  });
  this.starSpawnerEvent = createEvent(this, 150, () => {
    spawn(this, "star", "stars", -4, 0);
  });
  this.blackHoleSpawnerEvent = createEvent(this, 3000, () => {
    spawn(this, "blackHole", "blackHoles", -4, 0, 0.2);
  });

  // Create start button
  // placeStartButton();

  // Create the planet where the ship spawns
  this.startingPoint = this.add.sprite(400, 530, "startingPoint");
  this.startingPoint.setScale(4);
  this.startingPoint.depth = 1;

  // Create the ship that the player controls
  placeShip(this);
  initializeValues(this, this.ship);

  // Create hp icons in the bottom left corner

  // Create arrow pad
  this.upArrow = this.add.sprite(755, 530, "arrow");
  this.rightArrow = this.add.sprite(785, 560, "arrow");
  this.leftArrow = this.add.sprite(725, 560, "arrow");
  this.downArrow = this.add.sprite(755, 590, "arrow");
  this.rightArrow.angle = 90;
  this.leftArrow.angle = -90;
  this.downArrow.angle = 180;
  this.arrowPad = [];
  this.arrowPad.push(this.upArrow);
  this.arrowPad.push(this.downArrow);
  this.arrowPad.push(this.leftArrow);
  this.arrowPad.push(this.rightArrow);
  this.arrowPad.forEach((arrow) => {
    arrow.setScale(3);
    arrow.setInteractive();
  });

  // Decrease score and destroy meteorite upon ship-metoerite collision
  this.physics.add.collider(this.ship, this.meteorites, (ship, meteorite) => {
    meteorite.destroy();
    scoreDeduction += 2;
    updateScore(this.scoreText);
    displayTip(
      this,
      meteorite.x + 40,
      meteorite.y,
      "meteorMessage",
      "-2 points from meteor"
    );
  });

  // Slow down ship upon comet-ship collision
  this.physics.add.collider(this.ship, this.comets, (ship, comet) => {
    comet.destroy();
    slowDownShip(ship);
    displayTip(
      this,
      comet.x,
      comet.y - 60,
      "cometHPMessage",
      "-1 HP from comet"
    );
    displayTip(
      this,
      comet.x,
      comet.y - 30,
      "cometSpeedMessage",
      "Comets slow down the ship"
    );
  });

  // Increase score upon star-ship collision
  this.physics.add.collider(this.ship, this.stars, (ship, star) => {
    star.destroy();
    scoreDeduction -= 1;
    updateScore(this.scoreText);
    displayTip(this, star.x - 180, star.y, "starMessage", "+1 point from star");
  });

  this.physics.add.collider(
    this.ship,
    this.blackHoles,
    function (ship, blackHole) {
      blackHole.fixed = true;
      blackHole.moves = false;
      blackHole.body.enable = false;
      createCenterOfGravity(blackHole);
    }
  );

  // Assign cursor keys (up, down, left, right) object to cursors variable
  cursors = this.input.keyboard.createCursorKeys();
};

gameScene.update = function () {
  this.startButton.on(
    "pointerup",
    () => {
      this.startButton.destroy();
      gameIsStarted = true;
    },
    this
  );

  const spriteGroups = [
    this.meteorites.getChildren(),
    this.comets.getChildren(),
    this.stars.getChildren(),
    this.blackHoles.getChildren(),
  ];
  moveOrDestroySprites(spriteGroups);

  moveOrStopShip(this.ship);

  updateHp(this);
  // this.ship.setVelocityX(shipVelocity.x);
  // this.ship.setVelocityY(shipVelocity.y);

  if (gameIsStarted) {
    handleBlackHoleCollision(
      this.meteorites,
      this.comets,
      this.stars,
      this.blackHoles,
      this.ship
    );

    if (time === 0 || this.ship.hp === 0) {
      gameIsStarted = false;
      displayGameOver(this);
      displayFinalScore(this);
      resetGame(this, this.ship);
    } else if (this.ship.body) {
      handleShipMovementWithKeys(this.ship, this.input.activePointer.isDown);
      handleShipMovementOnClick(
        this.ship,
        this.upArrow,
        this.downArrow,
        this.leftArrow,
        this.rightArrow
      );
    }
  }
};

const placeStartButton = function (thisScene) {
  if (thisScene.startButton) {
    if (!thisScene.startButton.scene) {
      thisScene.startButton = thisScene.add
        .sprite(
          thisScene.sys.game.config.width / 2,
          thisScene.sys.game.config.height / 2,
          "startButton"
        )
        .setInteractive();
    }
  } else {
    thisScene.startButton = thisScene.add
      .sprite(
        thisScene.sys.game.config.width / 2,
        thisScene.sys.game.config.height / 2,
        "startButton"
      )
      .setInteractive();
  }
};

const initializeValues = function (thisScene, ship) {
  console.log("initializing");
  centerOfGravityLocation = null;
  time = gameTimeLimit;
  scoreDeduction = 0;
  updateScore(thisScene.scoreText);
  shipVelocity = { x: 0, y: 0 };
  score = startingScore;
  thisScene.ship.depth = 2;
  ship.speed = speed;
  setHp(ship, 4);
  placeStartButton(thisScene);
};

const placeShip = function (thisScene) {
  thisScene.ship = thisScene.physics.add.sprite(400, 475, "ship");
  thisScene.ship.depth = 2;
  thisScene.ship.hp = 4;
};

const resetShipPosition = function (ship) {
  stopShip();
  ship.angle = 0;
  ship.x = 400;
  ship.y = 475;
  ship.depth = -1;
};

const setHp = function (ship, hp) {
  const numberOfHp = hp;
  ship.hp = numberOfHp;
};

const displayHp = function (thisScene, ship, hpDisplay, i) {
  let hpToAdd = thisScene.add.sprite(ship.width / 2 + i * 30, 580, "ship");
  hpDisplay.add(hpToAdd);
};

const updateHp = function (thisScene) {
  if (thisScene.hpDisplay.getChildren()) {
    thisScene.hpDisplay.getChildren().forEach((hpIcon) => {
      hpIcon.destroy();
    });
  }
  const shipHp = thisScene.ship.hp;
  for (let i = 0; i < shipHp; i++) {
    displayHp(thisScene, thisScene.ship, thisScene.hpDisplay, i);
  }
};

const createEvent = function (thisScene, delay, callback) {
  const event = thisScene.time.addEvent({
    delay: delay,
    loop: true,
    callback: callback,
    callbackScope: this,
  });
};

/**
 * Handles movement for all sprites
 */
const moveOrDestroySprites = function (spriteGroups) {
  if (spriteGroups) {
    spriteGroups.forEach((group) => {
      group.forEach((sprite) => {
        moveSprite(sprite, sprite.moveDistance);
        if (!gameIsStarted) {
          sprite.destroy();
        }
      });
    });
  }
};

const moveOrStopShip = function (ship) {
  const buffer = ship.width / 2;
  if (ship.x <= 0 + buffer) {
    stopShip();
    ship.x += 1;
  } else if (ship.x >= 800 - buffer) {
    stopShip();
    ship.x -= 1;
  } else if (ship.y <= 0 + buffer) {
    stopShip();
    ship.y += 1;
  } else if (ship.y >= 490) {
    stopShip();
    ship.y -= 1;
  }
  ship.setVelocityX(shipVelocity.x);
  ship.setVelocityY(shipVelocity.y);
};

/**
 * Moves ship and changes its angle on arrow key press
 */
const handleShipMovementWithKeys = function (ship, mouseIsDown) {
  const shipAngle = ship.angle;
  const speed = ship.speed;
  if (cursors.right.isDown) {
    moveShipRight(ship, speed, shipAngle);
  } else if (cursors.left.isDown) {
    moveShipLeft(ship, speed, shipAngle);
  } else if (cursors.up.isDown) {
    moveShipUp(ship, speed);
  } else if (cursors.down.isDown) {
    moveShipDown(ship, speed);
  } else if (
    cursors.right.isUp &&
    cursors.left.isUp &&
    cursors.up.isUp &&
    !mouseIsDown
  ) {
    stopShip();
  }
};

/**
 * Moves ship and changes its angle on clicking keypad
 */
const handleShipMovementOnClick = function (
  ship,
  clickUp,
  clickDown,
  clickLeft,
  clickRight
) {
  handleArrowButton(ship, clickUp, moveShipUp);
  handleArrowButton(ship, clickDown, moveShipDown);
  handleArrowButton(ship, clickLeft, moveShipLeft);
  handleArrowButton(ship, clickRight, moveShipRight);
};

const handleArrowButton = function (ship, arrow, moveFunction) {
  arrow
    .on("pointerdown", function () {
      moveFunction(ship, ship.speed, ship.angle);
    })
    .on("pointerup", function () {
      stopShip();
    });
};

const moveShipRight = function (ship, speed, shipAngle) {
  shipVelocity.x = speed;
  if (shipAngle === 180 || shipAngle === -135 || shipAngle === 135) {
    ship.angle = 135;
  } else {
    ship.angle = 45;
  }
};

const moveShipLeft = function (ship, speed, shipAngle) {
  shipVelocity.x = -speed;
  if (shipAngle === 180 || shipAngle === -135 || shipAngle === 135) {
    ship.angle = -135;
  } else {
    ship.angle = -45;
  }
};

const moveShipUp = function (ship, speed) {
  shipVelocity.y = -speed;
  ship.angle = 0;
};

const moveShipDown = function (ship, speed) {
  shipVelocity.y = speed;
  ship.angle = 180;
};

const stopShip = function () {
  shipVelocity.x = 0;
  shipVelocity.y = 0;
};

/**
 * Calculates score and updates text
 */
const updateScore = function (scoreText) {
  score = startingScore - scoreDeduction;
  scoreText.setText(`Score: ${score}`);
};

/**
 * Spaws sprite in gameScene
 * @param {string} spriteName name of preloaded sprite
 * @param {string} group name for the group of sprites
 * @param {number} startX x coordinate where sprite spawns
 * @param {number} scale optional multiplier for sprite size
 */
const spawn = function (
  thisScene,
  spriteName,
  group,
  moveDistance,
  startX,
  scale
) {
  if (gameIsStarted) {
    const sprite = thisScene.add.sprite(
      startX,
      Phaser.Math.Between(0, 600),
      `${spriteName}`
    );
    sprite.moveDistance = moveDistance;
    thisScene[group].add(sprite);
    if (scale) {
      sprite.setScale(scale);
    }
  }
};

/**
 * Moves sprite across gameScene
 * @param {Sprite} sprite Phaser Sprite class
 * @param {number} distance Number of pixels to move (pos. value for left, neg. value for right)
 */
const moveSprite = function (sprite, moveDistance) {
  let newX = sprite.x - moveDistance;
  sprite.x = newX;
  if (sprite.x === 0) {
    sprite.destroy();
  }
};

/**
 * Halves ship speed and reduces HP by 1
 */
const slowDownShip = function (ship) {
  ship.speed /= 2;
  ship.hp -= 1;
};

/**
 * Defines point where all sprites will be drawn towards as xy coordinates of struck black hole
 * @param {Sprite} blackHole black hole sprite that the ship collided with
 */
const createCenterOfGravity = function (blackHole) {
  const x = blackHole.x;
  const y = blackHole.y;

  centerOfGravityLocation = { x, y };
};

const handleBlackHoleCollision = function (
  meteorites,
  comets,
  stars,
  blackHoles,
  ship
) {
  if (centerOfGravityLocation) {
    // Check if black hole was struck
    // Stop comets from spawning
    comets.getChildren().forEach((comet) => comet.destroy());

    // Stop more blackholes from spawning
    blackHoles.getChildren().forEach((blackHole) => {
      if (blackHole.x !== centerOfGravityLocation.x) {
        blackHole.destroy();
      }
    });
    const spriteGroups = [
      meteorites.getChildren(),
      comets.getChildren(),
      stars.getChildren(),
    ];
    if (gameIsStarted) {
      ship.depth = -1;
      pullToCenter(ship, centerOfGravityLocation);
      spriteGroups.forEach((group) => {
        group.forEach((sprite) => {
          pullToCenter(sprite, centerOfGravityLocation);
        });
      });
    }
  }
};

/**
 * Moves sprite towards the center of gravity
 * @param {Sprite} sprite phaser sprite
 * @param {{x: number, y: number}} centerOfGravity xy coordinates that sprites are pulled towards
 */
const pullToCenter = function (sprite, centerOfGravity) {
  const angle = Phaser.Math.Angle.Between(
    sprite.x,
    sprite.y,
    centerOfGravity.x,
    centerOfGravity.y
  );
  const velocity = 10;
  sprite.x += velocity * Math.cos(angle);
  sprite.y += velocity * Math.sin(angle);
};

const displayTip = function (thisScene, x, y, messageName, messageContent) {
  if (!thisScene[`${messageName}`]) {
    thisScene[`${messageName}`] = thisScene.add.text(x, y, messageContent);
  }
  thisScene[`${messageName}`].depth = 2;
  setTimeout(() => {
    thisScene[`${messageName}`].setText("");
  }, 4000);
};

/**
 * Displays game over text on the screen
 */
const displayGameOver = function (thisScene) {
  if (!thisScene.gameOverText) {
    thisScene.gameOverText = thisScene.add.text(
      thisScene.sys.game.config.width / 2,
      thisScene.sys.game.config.height / 2,
      "Game Over"
    );
  }
  thisScene.gameOverText.setOrigin(0.5);
  thisScene.gameOverText.setScale(2);
  thisScene.gameOverText.setText("Game Over");
  setTimeout(() => {
    thisScene.gameOverText.setText("");
  }, gameEndDelay);
};

const displayFinalScore = function (thisScene) {
  if (!thisScene.finalScoreText) {
    thisScene.finalScoreText = thisScene.add.text(
      thisScene.sys.game.config.width / 2,
      thisScene.sys.game.config.height / 2 + 30,
      `Final score: ${score}`
    );
  }
  thisScene.finalScoreText.setText(`Final score: ${score}`);
  thisScene.finalScoreText.setOrigin(0.5);
  thisScene.finalScoreText.setScale(2);
  setTimeout(() => {
    thisScene.finalScoreText.setText("");
  }, gameEndDelay);
};

/**
 * Decreases the timer by 1 every second
 */
const countdown = function (timer) {
  if (gameIsStarted && time > 0) {
    time--;
  }
  timer.setText(`Timer: ${time}`);
};

const resetGame = function (thisScene, ship) {
  resetShipPosition(ship);
  setTimeout(() => {
    initializeValues(thisScene, ship);
  }, gameEndDelay);
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
