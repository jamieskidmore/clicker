const gameScene = new Phaser.Scene("Game");

const endPoint = -15;
const startingScore = 50;

let gameOver = false;
let timer;
let gameTimeLimit = 15;
let score;
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
  this.load.image("arrow", "assets/arrowIcon.png");
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
  this.meteoriteSpawnerEvent = createEvent(150, () => {
    spawn("meteorite", "meteorites", 800);
  });
  this.cometSpawnerEvent = createEvent(500, () => {
    spawn("comet", "comets", 800);
  });
  this.starSpawnerEvent = createEvent(150, () => {
    spawn("star", "stars", 0);
  });
  this.blackHoleSpawnerEvent = createEvent(3000, () => {
    spawn("blackHole", "blackHoles", 0, 0.2);
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
  handleShipMovementOnClick();

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
  const meteorites = this.meteorites.getChildren();
  const comets = this.comets.getChildren();
  const stars = this.stars.getChildren();
  const blackHoles = this.blackHoles.getChildren();
  const ship = this.ship;

  const spriteGroups = [meteorites, comets, stars];

  if (this.ship.y < endPoint || gameTimeLimit === 0 || ship.hp < 1) {
    displayGameOver();
    spriteGroups.push(blackHoles);
    destroyAll(spriteGroups);
    ship.destroy();
  } else {
    handleShipMovementWithKeys();
  }

  moveSprites();

  updateHp();

  if (centerOfGravityLocation) {
    // Check if black hole was struck
    // Stop comets from spawning
    comets.forEach((comet) => comet.destroy());
    // Stop more blackholes from spawning
    blackHoles.forEach((blackHole) => {
      if (blackHole.x < centerOfGravityLocation.x) {
        blackHole.destroy();
      }
    });
    handleBlackHoleCollision(ship, spriteGroups, centerOfGravityLocation);
  }
};

/**
 * Triggers specfied callback on given time interval
 * @param {number} delay time interval
 * @param {callback} callback function that gets called
 */
const createEvent = function (delay, callback) {
  const event = gameScene.time.addEvent({
    delay: delay,
    loop: true,
    callback: callback,
    callbackScope: this,
  });
};

/**
 * Handles movement for all sprites
 */
const moveSprites = function () {
  gameScene.meteorites.getChildren().forEach((meteorite) => {
    moveSprite(meteorite, 4);
  });

  gameScene.comets.getChildren().forEach((comet) => {
    moveSprite(comet, 10);
  });

  gameScene.stars.getChildren().forEach((star) => {
    moveSprite(star, -4);
  });

  gameScene.blackHoles.getChildren().forEach((blackHole) => {
    if (!blackHole.fixed) {
      moveSprite(blackHole, -4);
    }
  });
};

/**
 * Moves ship and changes its angle on arrow key press
 */
const handleShipMovementWithKeys = function () {
  const shipAngle = gameScene.ship.angle;
  const shipSpeed = gameScene.ship.speed;
  const shipWidth = gameScene.ship.width;
  const gameWidth = gameScene.sys.game.config.width;
  if (cursors.right.isDown) {
    moveShipRight(gameWidth, shipWidth, shipSpeed, shipAngle);
  }
  if (cursors.left.isDown) {
    moveShipLeft(shipWidth, shipSpeed, shipAngle);
  }
  if (cursors.up.isDown) {
    moveShipUp(shipSpeed);
  }
  if (cursors.down.isDown) {
    moveShipDown(shipSpeed);
  }
};

const handleShipMovementOnClick = function () {
  const shipAngle = gameScene.ship.angle;
  const shipSpeed = gameScene.ship.speed * 3;
  const shipWidth = gameScene.ship.width;
  const gameWidth = gameScene.sys.game.config.width;
  gameScene.upArrow.on("pointerup", () => {
    console.log("running");
    moveShipUp(shipSpeed);
  });
  gameScene.downArrow.on("pointerup", () => {
    moveShipDown(shipSpeed);
  });
  gameScene.leftArrow.on("pointerup", () => {
    moveShipLeft(shipWidth, shipSpeed, shipAngle);
  });
  gameScene.rightArrow.on("pointerup", () => {
    moveShipRight(gameWidth, shipWidth, shipSpeed, shipAngle);
  });
};

const moveShipRight = function (gameWidth, shipWidth, shipSpeed, shipAngle) {
  if (gameScene.ship.x < gameWidth - shipWidth / 2) {
    gameScene.ship.x += shipSpeed;
    if (shipAngle === 180 || shipAngle === -135 || shipAngle === 135) {
      gameScene.ship.angle = 135;
    } else {
      gameScene.ship.angle = 45;
    }
  }
};

const moveShipLeft = function (shipWidth, shipSpeed, shipAngle) {
  if (gameScene.ship.x > 0 + shipWidth / 2) {
    gameScene.ship.x -= shipSpeed;
    if (shipAngle === 180 || shipAngle === -135 || shipAngle === 135) {
      gameScene.ship.angle = -135;
    } else {
      gameScene.ship.angle = -45;
    }
  }
};

const moveShipUp = function (shipSpeed) {
  gameScene.ship.y -= shipSpeed;
  gameScene.ship.angle = 0;
};

const moveShipDown = function (shipSpeed) {
  if (!gameOver && gameScene.ship.y < 470) {
    gameScene.ship.y += shipSpeed;
    gameScene.ship.angle = 180;
  }
};

/**
 * Updates bottom-left HP icons when HP decreases
 */
const updateHp = function () {
  const hpOnScreen = gameScene.hpDisplay.getChildren().length;
  if (hpOnScreen > gameScene.ship.hp) {
    let usedHp = gameScene.hpDisplay.getChildren()[hpOnScreen - 1];
    usedHp.destroy();
  }
};

/**
 * Calculates score and updates text
 */
const updateScore = function () {
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
const spawn = function (spriteName, group, startX, scale) {
  const sprite = gameScene.add.sprite(
    startX,
    Phaser.Math.Between(0, 600),
    `${spriteName}`
  );
  if (scale) {
    sprite.setScale(scale);
  }
  gameScene[group].add(sprite);
};

/**
 * Moves sprite across gameScene
 * @param {Sprite} sprite Phaser Sprite class
 * @param {number} distance Number of pixels to move (pos. value for left, neg. value for right)
 */
const moveSprite = function (sprite, distance) {
  let newX = sprite.x - distance;
  sprite.x = newX;
  if (sprite.x === 0) {
    sprite.destroy();
  }
};

/**
 * Halves ship speed and reduces HP by 1
 */
const slowDownShip = function () {
  gameScene.ship.speed /= 2;
  gameScene.ship.hp -= 1;
};

/**
 * Defines point where all sprites will be drawn towards as xy coordinates of struck black hole
 * @param {Sprite} blackHole black hole sprite that the ship collided with
 */
const createCenterOfGravity = function (blackHole) {
  let x = blackHole.x;
  let y = blackHole.y;

  centerOfGravityLocation = { x, y };
};

/**
 * Calls the pullToCenter function on each sprite on the screen
 * @param {Sprite} ship ship sprite
 * @param {Group[]} spriteGroups array of all groups of sprites
 * @param {{x: number, y: number}} centerOfGravity xy coordinates that sprites are pulled towards
 */
const handleBlackHoleCollision = function (
  ship,
  spriteGroups,
  centerOfGravity
) {
  if (!gameOver) {
    ship.depth = -1;
    pullToCenter(ship, centerOfGravity);
    spriteGroups.forEach((group) => {
      group.forEach((sprite) => {
        pullToCenter(sprite, centerOfGravity);
      });
    });
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

/**
 * Displays game over text on the screen
 */
const displayGameOver = function () {
  gameOver = true;
  const gameOverText = gameScene.add.text(
    gameScene.sys.game.config.width / 2,
    gameScene.sys.game.config.height / 2,
    "Game Over"
  );
  gameOverText.setOrigin(0.5);
  gameOverText.setScale(2);
};

/**
 * Destroys every sprite in each group
 * @param {Group[]} groups
 */
const destroyAll = function (groups) {
  groups.forEach((group) => {
    group.forEach((sprite) => {
      sprite.destroy();
    });
  });
};

/**
 * Decreases the timer by 1 every second
 */
const countdown = function () {
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
