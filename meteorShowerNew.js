class MeteorShowerScene extends Phaser.Scene {
  // universal variables
  WIDTH = this.sys.game.config.width;
  HEIGHT = this.sys.game.config.height;
  shipSpeed = 240;
  timeLimit = 30;
  endingDelay = 2000;

  constructor() {
    super("MeteorShowerScene");
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.image("startingPoint", "assets/mercury.png");
    this.load.image("ship", "assets/player3.png");
    this.load.image("meteorite", "assets/meteorite.png");
    this.load.image("star", "assets/star.png");
    this.load.image("comet", "assets/comet.png");
    this.load.image("blackHole", "assets/board.png");
  }

  create() {
    console.log(WIDTH);
  }

  update() {}
}
