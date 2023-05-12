// create a new scene
let gameScene = new Phaser.Scene("Game");

// initialize variables

// Load assets
gameScene.preload = function () {
  // load images
  this.load.image("background", "assets/background.png");
  this.load.image("finalcompleteboard", "assets/finalcompleteboard.png");
  this.load.image("earth", "assets/earth.png");
  this.load.image("sun", "assets/sun.png");
  this.load.image("mercury", "assets/mercury.png");
  this.load.image("venus", "assets/venus.png");
  this.load.image("mars", "assets/mars.png");
  this.load.image("jupiter", "assets/jupiter.png");
  this.load.image("saturn", "assets/saturn.png");
  this.load.image("uranus", "assets/uranus.png");
  this.load.image("neptune", "assets/neptune.png");
  this.load.image("star", "assets/star.png");
  // this.load.image("meteorite", "assets/meteorite.png");
  // this.load.image("satellite", "assets/satellite.png");
  // this.load.image("startButton", "assets/startButton.png");
};

// called once after the preload ends
gameScene.create = function () {
  // create bg sprite
  this.add
    .sprite(0, 0, "background")
    .setScale(2.5, 1.75)
    .setPosition(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2
    );

  // create inner board
  this.add
    .sprite(0, 0, "finalcompleteboard")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2
    );

  // Create sun and make it interactive
  let sun = this.add
    .sprite(0, 0, "sun")
    .setScale(2.25, 2.25)
    .setPosition(
      this.sys.game.config.width / 2 - 290,
      this.sys.game.config.height / 2 + 10
    )
    .setInteractive();
  sun.on("pointerdown", this.onSunClick, this);

  // Add text box for the sun
  let sunText = this.add.text(
    sun.x - sun.width / 2 - 45,
    sun.y - sun.height / 2 + 70,
    "Meteor Shower!",
    {
      fontSize: "18px",
      fill: "#ffffff",
    }
  );

  // create star1
  let star1 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 255,
      this.sys.game.config.height / 2 - 75
    );

  // create star2
  let star2 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 235,
      this.sys.game.config.height / 2 - 95
    );

  // create mercury
  this.add
    .sprite(0, 0, "mercury")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2 - 200,
      this.sys.game.config.height / 2 - 115
    );

  // create star3
  let star3 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 165,
      this.sys.game.config.height / 2 - 133
    );

  // create star4
  let star4 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 140,
      this.sys.game.config.height / 2 - 142
    );

  // create venus
  this.add
    .sprite(0, 0, "venus")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2 - 95,
      this.sys.game.config.height / 2 - 155
    );

  // create star5
  let star5 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 50,
      this.sys.game.config.height / 2 - 160
    );

  // create star6
  let star6 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 22,
      this.sys.game.config.height / 2 - 163
    );

  // Create earth and make it interactive
  let earth = this.add
    .sprite(0, 0, "earth")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2 + 35,
      this.sys.game.config.height / 2 - 170
    )
    .setInteractive();
  earth.on("pointerdown", this.onEarthClick, this);

  // Add text box for the earth
  let earthText = this.add.text(
    earth.x - earth.width / 2 - 35,
    earth.y - earth.height / 2 + 50,
    "Typing Game!",
    {
      fontSize: "18px",
      fill: "#ffffff",
    }
  );

  // create star7
  let star7 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 95,
      this.sys.game.config.height / 2 - 157
    );

  // create star8
  let star8 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 125,
      this.sys.game.config.height / 2 - 151
    );

  // create mars
  this.add
    .sprite(0, 0, "mars")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2 + 185,
      this.sys.game.config.height / 2 - 140
    );

  // create star9
  let star9 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 240,
      this.sys.game.config.height / 2 - 108
    );

  // create star10
  let star10 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 265,
      this.sys.game.config.height / 2 - 90
    );

  // Create jupiter and make it interactive
  let jupiter = this.add
    .sprite(0, 0, "jupiter")
    .setScale(1.3, 1.3)
    .setPosition(
      this.sys.game.config.width / 2 + 305,
      this.sys.game.config.height / 2 - 25
    )
    .setInteractive();
  jupiter.on("pointerdown", this.onJupiterClick, this);

  // Add text box for the jupiter
  let jupiterText = this.add.text(
    jupiter.x - jupiter.width / 2 - 30,
    jupiter.y - jupiter.height / 2 + 85,
    "Space Trivia!",
    {
      fontSize: "18px",
      fill: "#ffffff",
    }
  );

  // create star11
  let star11 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 290,
      this.sys.game.config.height / 2 + 45
    );

  // create star12
  let star12 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 272,
      this.sys.game.config.height / 2 + 67
    );

  // create saturn
  this.add
    .sprite(0, 0, "saturn")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2 + 215,
      this.sys.game.config.height / 2 + 110
    );

  let star13 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 110,
      this.sys.game.config.height / 2 + 137
    );

  // create star14
  let star14 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 + 80,
      this.sys.game.config.height / 2 + 142
    );

  // Create neptune and make it interactive
  let neptune = this.add
    .sprite(0, 0, "neptune")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2 + 10,
      this.sys.game.config.height / 2 + 150
    )
    .setInteractive();
  neptune.on("pointerdown", this.onNeptuneClick, this);

  // Add text box for the neptune
  let neptuneText = this.add.text(
    neptune.x - neptune.width / 2 - 40,
    neptune.y - neptune.height / 2 + 60,
    "Card Matching!",
    {
      fontSize: "18px",
      fill: "#ffffff",
    }
  );

  // create star15
  let star15 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 60,
      this.sys.game.config.height / 2 + 142
    );

  // create star16
  let star16 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 90,
      this.sys.game.config.height / 2 + 137
    );

  // create uranus
  this.add
    .sprite(0, 0, "uranus")
    .setScale(1.5, 1.5)
    .setPosition(
      this.sys.game.config.width / 2 - 155,
      this.sys.game.config.height / 2 + 120
    );

  // create star17
  let star17 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 215,
      this.sys.game.config.height / 2 + 90
    );

  // create star18
  let star18 = this.add
    .sprite(0, 0, "star")
    .setScale(1, 1)
    .setPosition(
      this.sys.game.config.width / 2 - 240,
      this.sys.game.config.height / 2 + 73
    );
};

gameScene.onSunClick = function () {
  // window.location.href =
  //   "https://jamieskidmore.github.io/meteorShowerMinigame/";
  this.scene.start("MeteorShowerScene");
};

gameScene.onEarthClick = function () {
  // window.location.href = "http://hypfgqkmxo.us16.qoddiapp.com/";
  this.scene.start("WordScene");
};

gameScene.onJupiterClick = function () {
  this.scene.start("TriviaScene");
};

gameScene.onNeptuneClick = function () {
  // window.location.href = "https://qubeqode.github.io/phaserMemoryGame/";
  this.scene.start("MemoryGameScene");
};

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [
    gameScene,
    TriviaScene,
    MeteorShowerScene,
    WordScene,
    MemoryGameScene,
  ],
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
