import Phaser from "phaser";

class Titlescreen extends Phaser {
    preload() {
        this.load.image("background", "../assets/background.png");
    }

    create() {
        this.add.image(400, 300, "background");
    }
}