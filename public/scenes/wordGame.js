class WordScene extends Phaser.Scene {
  // initialize variables
  #timer;
  #planets;
  #scoreText;
  #highestScoreText;
  #score = 0;
  #planetsRemoved = 0;
  #gameTimeLimit;
  #scoreFactor = 1;
  #typedWord = "";
  #timerEventAdded = false;
  #gameStarted = false;
  #gameOver = false;
  #typedWordText;
  #scoreSaved = false;
  #gameOverDisplayed = false;
  #top10ScoresDisplayed = false;

  constructor() {
    super("WordScene");
  }

  preload() {
    // load images
    this.load.image("background", "assets/background.png");
    this.load.image("sun", "assets/sun.png");
    this.load.image("mercury", "assets/mercury.png");
    this.load.image("venus", "assets/venus.png");
    this.load.image("earth", "assets/earth.png");
    this.load.image("mars", "assets/mars.png");
    this.load.image("jupiter", "assets/jupiter.png");
    this.load.image("saturn", "assets/saturn.png");
    this.load.image("uranus", "assets/uranus.png");
    this.load.image("neptune", "assets/neptune.png");
    this.load.image("meteorite", "assets/meteorite.png");
    this.load.image("satellite", "assets/satellite.png");
    this.load.image("startButton", "assets/startButton.png");
    this.load.image("arrow", "assets/arrowIcon.png");
  }

  create() {
    this.#gameTimeLimit = 30;
    this.#gameOver = false;
    this.#timerEventAdded = false;
    const offscreenInput = document.getElementById("offscreen-input");
    offscreenInput.addEventListener("input", (event) => {
      this.#typedWord = event.target.value;
      this.#typedWordText.setText(this.#typedWord);
    });

    offscreenInput.addEventListener("focus", () => {
      if (!this.#gameStarted) {
        offscreenInput.blur();
      }
    });

    this.#highestScoreText = this.add.text(
      this.sys.game.config.width / 2,
      0,
      "Highest Score: 0"
    );
    this.#highestScoreText.setOrigin(0.5, 0);

    this.getHighestScore.call(this);

    // create bg sprite
    this.add
      .sprite(0, 0, "background")
      .setPosition(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2
      );
    this.#scoreText = this.add.text(0, 0, "Score: 0");
    this.#timer = this.add.text(700, 0, `Timer: ${this.#gameTimeLimit}`);
    this.#timer.depth = 1;
    this.#typedWordText = this.add.text(400, 480, "");
    this.#typedWordText.setOrigin(0.5);

    // create satellite
    let satellite = this.add
      .sprite(0, 0, "satellite")
      .setScale(5)
      .setAngle(320)
      .setPosition(400, 550);

    // create meteorite
    let meteorite = this.add
      .sprite(0, 0, "meteorite")
      .setScale(2)
      .setAngle(220)
      .setPosition(400, 430);
    meteorite.visible = false;

    this.#planets = this.add.group();

    // create start button
    // const startButton = this.add
    //   .sprite(
    //     this.sys.game.config.width / 2,
    //     this.sys.game.config.height / 2,
    //     "startButton"
    //   )
    //   .setInteractive();

    // startButton.once("pointerdown", () => {
    this.#gameStarted = true;
    // startButton.setVisible(false);

    offscreenInput.focus();

    if (!this.#timerEventAdded) {
      this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true,
      });
      this.#timerEventAdded = true;
    }
    this.spawnPlanets.call(this);
    // });

    function handleKeyboardInput(event) {
      if (!this.#gameOver && this.#gameStarted) {
        if (event.key === "Enter") {
          checkWord.call(this);
        } else if (event.key === "Backspace") {
          this.#typedWord = this.#typedWord.slice(0, -1);
        } else if (event.key === " ") {
          this.#typedWord += " ";
        } else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
          this.#typedWord += event.key;
        }
        this.#typedWordText.setText(this.#typedWord);
      }
    }

    window.addEventListener("keydown", handleKeyboardInput.bind(this));

    // check if the typed word matches any of the words in the planets
    function checkWord() {
      const targetTextContainer = this.#planets.children.entries.find(
        (textContainer) => {
          const text = textContainer.list && textContainer.list[1];
          return (
            text &&
            text.text &&
            text.text === this.#typedWord.replace(/\s+/g, "")
          );
        }
      );

      if (targetTextContainer) {
        // remove the planet container
        targetTextContainer.destroy();

        // Find and remove the planet associated with the targetTextContainer
        const planet = this.#planets.children.entries.find(
          (planet) =>
            planet.x === targetTextContainer.x &&
            planet.y === targetTextContainer.y
        );
        if (planet) {
          planet.destroy();
        }

        moveMeteorite.call(this, targetTextContainer.x, targetTextContainer.y);

        // update score
        this.#score += 1;
        this.#scoreText.setText(`Score: ${this.#score}`);

        this.#planetsRemoved += 1;
        // every 3 planets removed, increase the falling speed of planets
        if (this.#planetsRemoved % 3 === 0) {
          // increase the falling speed of planets by 30%
          this.#scoreFactor += 0.3;
        }
      }
      const offscreenInput = document.getElementById("offscreen-input");
      offscreenInput.value = "";

      this.#typedWord = "";
    }

    // meteorite animation
    function moveMeteorite(targetX, targetY) {
      // Calculate the angle between the satellite and the target
      let angle = Phaser.Math.Angle.Between(
        satellite.x,
        satellite.y,
        targetX,
        targetY
      );
      // Convert the angle to degrees
      let angleInDegrees = Phaser.Math.RadToDeg(angle);
      // Set the satellite angle
      satellite.setAngle(angleInDegrees + 45); // Update the angle offset to 45 degrees

      // Set the meteorite angle to match the satellite angle
      meteorite.setAngle(angleInDegrees);

      meteorite.visible = true;
      meteorite.setPosition(400, 430);

      this.tweens.add({
        targets: meteorite,
        x: targetX,
        y: targetY,
        duration: 500,
        onComplete: () => {
          meteorite.visible = false;
        },
      });
    }

    this.#highestScoreText = this.add.text(
      this.sys.game.config.width / 2,
      0,
      "Highest Score: 0"
    );
    this.#highestScoreText.setOrigin(0.5, 0); // This will center the text horizontally based on its position
  }

  update() {
    // this is called up to 60 times per second
    const scoreFactor = this.#scoreFactor;
    if (!this.#gameOver && this.#gameStarted) {
      this.#planets.children.iterate(function (planetContainer) {
        // increase falling speed of planets
        planetContainer.y += 0.2 * scoreFactor;
        planetContainer.update(); // Update the text container position
      });
    } else if (this.#gameOver && !this.#scoreSaved) {
      this.#planets.children.iterate(function (planetContainer) {
        // stop the planets from falling
        planetContainer.y = planetContainer.y;
      });
      // saveScore(); // Remove this line to avoid calling saveScore() twice
      this.#scoreSaved = true;
    }
  }
  // send the score to the server
  async saveScore(username, score) {
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, score }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Score saved:", result);
        // Update the highest score after saving the current score
        this.getHighestScore();
      } else {
        console.warn("Unable to save score:", response);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  handleHighScoreName(score) {
    const name = prompt(
      "Congratulations! You have reached the highest score. Please enter your name:"
    );

    if (name) {
      this.saveScore(name, score);
    } else {
      alert("Please enter a valid name to save your high score.");
    }
  }

  // function to update the timer
  updateTimer() {
    if (this.#gameTimeLimit > 0) {
      this.#gameTimeLimit -= 1;
      this.#timer.setText(`Timer: ${this.#gameTimeLimit}`);
    } else {
      this.#gameOver = true;
      this.#planets.clear(true, true); // Remove all planets and text from the scene
      this.time.delayedCall(
        0,
        () => {
          this.gameOverDisplay.call(this);
          setTimeout(() => {
            this.goBackToHomeScreen();
          }, 2500);
        },
        null,
        this
      );
    }
  }

  // function to spawn planets
  spawnPlanets() {
    if (!this.#gameOver) {
      const planetKeys = [
        "sun",
        "mercury",
        "venus",
        "earth",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
      ];

      // planet related variables (scale, random index, random delay, text, text background)
      const scaleFactors = [1.5, 2, 2, 1.5, 1, 0.8, 1, 1, 1];
      const randomIndex = Math.floor(Math.random() * planetKeys.length);
      const randomX = Math.random() * (this.sys.game.config.width - 100) + 50;
      const randomDelay = Math.random() * 1000 + 500;
      const planet = this.#planets.create(
        randomX,
        -50,
        planetKeys[randomIndex]
      );
      planet.setScale(scaleFactors[randomIndex]);
      const textStyle = { font: "16px Arial", fill: "#ffffff" };

      // Randomize capitalization of the text
      const randomizedText = this.randomizeTextCapitalization(
        planetKeys[randomIndex]
      );

      const text = this.add.text(0, 0, randomizedText, textStyle);
      text.setOrigin(0.5, 0.5);
      const textBackground = this.add.graphics();
      textBackground.fillStyle(0x000000, 0.8);
      textBackground.fillRect(
        -text.width / 2 - 2,
        -text.height / 2 - 2,
        text.width + 4,
        text.height + 4
      );

      const textContainer = this.add.container(randomX, -50, [
        textBackground,
        text,
      ]);
      // text z-index
      textContainer.depth = 2;
      this.#planets.add(textContainer);

      // Add an update function to update the text container position
      textContainer.update = function () {
        this.x = planet.x;
        this.y = planet.y;
      };

      this.time.addEvent({
        delay: randomDelay,
        callback: this.spawnPlanets,
        callbackScope: this,
      });
    }
  }

  // Randomize capitalization of a string
  randomizeTextCapitalization(text) {
    let randomizedText = "";

    for (let i = 0; i < text.length; i++) {
      const randomBoolean = Math.random() >= 0.5;
      randomizedText += randomBoolean
        ? text[i].toUpperCase()
        : text[i].toLowerCase();
    }

    return randomizedText;
  }

  // game over display
  gameOverDisplay() {
    if (!this.#gameOverDisplayed) {
      // Add this condition to check if the game over text has been displayed before
      // Display "Game Over" text
      const gameOverText = this.add.text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2 - 50,
        "Game Over",
        { fontSize: "32px", fontStyle: "bold", color: "#FFFFFF" }
      );
      gameOverText.setOrigin(0.5, 0.5);

      // Check if the user achieved the highest score
      this.getHighestScore().then((highestScore) => {
        if (this.#score > highestScore) {
          this.handleHighScoreName(this.#score);
        }
      });

      // Show the top 10 scores
      this.showTop10Scores.call(this);

      this.#gameOverDisplayed = true;
    }
  }

  // reset the game
  // resetGame() {
  //   this.#typedWord = "";
  //   this.#typedWordText.setText("");
  //   this.#score = 0;
  //   this.#scoreText.setText(`Score: ${score}`);
  //   this.#timer.setText(`Timer: ${gameTimeLimit}`);
  //   this.#gameStarted = true;
  //   this.#spawnPlanets.call(this);
  // }

  // get highest score from the server
  async getHighestScore() {
    if (this.getHighestScore.highestScore === undefined) {
      try {
        const response = await fetch("/api/scores");

        if (response.ok) {
          const scores = await response.json();
          const highestScoreEntry = scores[0];
          const highestScore = highestScoreEntry ? highestScoreEntry.score : 0;
          const highestUsername = highestScoreEntry
            ? highestScoreEntry.username
            : "";
          this.#highestScoreText.setText(
            `Highest Score: ${highestScore} by ${highestUsername}`
          );
          getHighestScore.highestScore = highestScore;
        } else {
          console.log("Error getting highest score");
        }
      } catch (error) {
        console.warn(error);
      }
    }

    return this.getHighestScore.highestScore;
  }

  async showTop10Scores() {
    try {
      const response = await fetch("/api/scores/top10");

      if (response.ok) {
        const scores = await response.json();
        let top10ScoresText = "Top 10 Scores:\n";

        scores.forEach((entry, index) => {
          top10ScoresText += `${index + 1}. ${entry.username}: ${
            entry.score
          }\n`;
        });

        const top10ScoresDisplay = this.add.text(
          this.sys.game.config.width / 2,
          this.sys.game.config.height / 2 + 50,
          top10ScoresText,
          { fontSize: "16px", fontStyle: "bold", color: "#FFFFFF" }
        );
        top10ScoresDisplay.setOrigin(0.5, 0.5);
      } else {
        console.log("Error getting top 10 scores");
      }
    } catch (error) {
      console.warn(error);
    }
  }

  displayBackButton() {
    const backButton = {
      button: this.add.sprite(15, 30, "arrow").setScale(3).setInteractive(),
      text: this.add.text(25, 25, "Return to board"),
    };
    backButton.button.angle = -90;
    return backButton;
  }

  goBackToHomeScreen() {
    this.scene.start("Game");
  }

  // getHighestScore()
}
