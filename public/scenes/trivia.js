class TriviaScene extends Phaser.Scene {
  gameStarted;
  gameOver;
  scoreText;
  score;
  timer;
  timerEvent;
  gameTimeLimit;
  questions;
  resultText;
  resultTween;
  questionLayout;
  question;
  allAnswers;

  constructor() {
    super("TriviaScene");
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.image("startButton", "assets/startButton.png");
    this.load.image("questionLayout", "assets/questionLayout.png");
    this.load.image("titlescreen", "assets/titlescreen.png");
    this.load.image("arrow", "assets/arrowIcon.png");
    // this.load.image("", "assets/.png");
  }

  create() {
    this.gameOver = false;
    this.timerEvent = false;
    this.gameTimeLimit = 30;
    this.score = 0;
    this.questions = [];
    this.resultText = false;
    this.add
      .sprite(0, 0, "background")
      .setPosition(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2
      );
    this.scoreText = this.add.text(0, 0, `Score: ${this.score}`);
    this.timer = this.add.text(700, 0, `Timer: ${this.gameTimeLimit}`);
    this.timer.depth = 1;

    // const startButton = this.add
    //   .sprite(
    //     this.sys.game.config.width / 2,
    //     this.sys.game.config.height / 2,
    //     "startButton"
    //   )
    //   .setInteractive();

    // startButton.once("pointerdown", async () => {
    if (!this.timerEvent) {
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true,
      });
    }
    // startButton.setVisible(false);

    this.startGame();
    // });
  }

  updateScore() {
    this.scoreText.text = `Score: ${this.score}`;
  }

  async getQuestions() {
    try {
      const response = await fetch("/trivia/getQuestions");

      if (response.ok) {
        const body = await response.json();

        if (body) {
          this.questions = body;
        }
      } else {
        console.warn("Failed to get questions");
      }
    } catch (error) {
      console.warn(error);
    }
  }

  nextQuestion(question, allAnswers, index) {
    if (this.questions.length > 0) {
      question.text = this.questions[index].question;
      for (let i = 0; i < this.allAnswers.length; i++) {
        const answer = this.allAnswers[i];
        answer.text = this.questions[index].answers[i];
      }
    } else {
      console.warn("No questions in array");
    }
  }

  drawResult(isCorrect) {
    if (!this.resultText) {
      this.resultText = this.add.text(
        this.sys.game.config.width / 1.5,
        this.sys.game.config.height / 2,
        "Hey",
        {
          fontFamily: "Bruno Ace SC",
          fill: "#ffffff",
          fontSize: "25px",
          stroke: "#000000",
          strokeThickness: 5,
        }
      );
      this.resultText.setAlpha(0);
    }

    if (isCorrect) {
      this.resultText.setFill("#7ff525");
      this.resultText.text = "Correct";
    } else {
      this.resultText.setFill("#bf0d34");
      this.resultText.text = "Incorrect";
    }

    if (this.resultTween) {
      if (this.resultTween.isPlaying) {
        this.resultTween.stop();
      }
      this.resultTween.destroy();
    }

    this.resultTween = this.add.tween({
      targets: this.resultText,
      ease: "Sine.easeInOut",
      duration: 2000,
      delay: 0,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0,
      },
    });
  }

  async submitAnswer(question, answer) {
    try {
      const response = await fetch("/trivia/submitAnswer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer }),
      });

      if (response.ok) {
        const isCorrect = await response.json();
        if (isCorrect) {
          this.score++;
          this.updateScore();
        }
        this.drawResult(isCorrect);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  updateTimer() {
    if (this.gameTimeLimit > 0) {
      this.gameTimeLimit -= 1;
      this.timer.setText(`Timer: ${this.gameTimeLimit}`);
    } else {
      this.endGame();
    }
  }

  endGame() {
    if (!this.gameOver) {
      this.gameOver = true;
      this.gameStarted = false;
      this.timerEvent.destroy();
      this.add.text(
        this.sys.game.config.width / 4,
        this.sys.game.config.height / 2,
        "Finished!",
        {
          fontFamily: "Bruno Ace SC",
          fill: "#ffffff",
          fontSize: "75px",
          stroke: "#000000",
          strokeThickness: 5,
          align: "center",
        }
      );
      this.questionLayout.destroy();
      for (const answer of this.allAnswers) {
        answer.destroy();
      }
      this.question.destroy();
      setTimeout(() => {
        this.goBackToHomeScreen();
      }, 2500);
    }
  }

  async startGame() {
    if (this.gameOver) {
      console.warn("Game is already over or there are no questions");
      return;
    }
    this.gameOver = false;
    this.gameStarted = true;
    // this.timerEvent = false;
    // this.gameTimeLimit = 30;
    // this.score = 0;
    // this.questions = [];
    await this.getQuestions();

    const questionStyle = {
      fontFamily: "Bruno Ace SC",
      fill: "#ffffff",
      fontSize: "25px",
      wordWrap: { width: 650 },
      fixedWidth: 650,
      align: "top_center",
    };
    const answerStyle = {
      fontFamily: "Bruno Ace SC",
      fill: "#ffffff",
      fontSize: "25px",
      wordWrap: { width: 550 },
      fixedWidth: 550,
      align: "center",
    };

    this.questionLayout = this.add.image(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      "questionLayout"
    );
    this.questionLayout.setScale(2, 2);
    this.question = this.add.text(
      this.sys.game.config.width / 8,
      this.sys.game.config.height / 8,
      "This is the question asasd asd d d as sa",
      questionStyle
    );
    const answerOne = this.add
      .text(
        this.sys.game.config.width / 6.5,
        this.sys.game.config.height / 2.6,
        "This is an answer askjdabjk",
        answerStyle
      )
      .setInteractive();
    const answerTwo = this.add
      .text(
        this.sys.game.config.width / 6.5,
        this.sys.game.config.height / 1.85,
        "This is an answer askjdabjk",
        answerStyle
      )
      .setInteractive();
    const answerThree = this.add
      .text(
        this.sys.game.config.width / 6.5,
        this.sys.game.config.height / 1.44,
        "This is an answer askjdabjk",
        answerStyle
      )
      .setInteractive();
    const answerFour = this.add
      .text(
        this.sys.game.config.width / 6.5,
        this.sys.game.config.height / 1.18,
        "This is an answer askjdabjk",
        answerStyle
      )
      .setInteractive();
    this.allAnswers = [answerOne, answerTwo, answerThree, answerFour];
    let questionIndex = 0;

    this.nextQuestion(this.question, this.allAnswers, 0);

    answerOne.addListener("pointerdown", async () => {
      this.submitAnswer(this.question.text, answerOne.text);
      if (questionIndex < 4) {
        questionIndex++;
        this.nextQuestion(this.question, this.allAnswers, questionIndex);
      } else {
        this.endGame();
      }
    });
    answerTwo.addListener("pointerdown", async () => {
      this.submitAnswer(this.question.text, answerTwo.text);
      if (questionIndex < 4) {
        questionIndex++;
        this.nextQuestion(this.question, this.allAnswers, questionIndex);
      } else {
        this.endGame();
      }
    });
    answerThree.addListener("pointerdown", async () => {
      this.submitAnswer(this.question.text, answerThree.text);
      if (questionIndex < 4) {
        questionIndex++;
        this.nextQuestion(this.question, this.allAnswers, questionIndex);
      } else {
        this.endGame();
      }
    });
    answerFour.addListener("pointerdown", async () => {
      this.submitAnswer(this.question.text, answerFour.text);
      if (questionIndex < 4) {
        questionIndex++;
        this.nextQuestion(this.question, this.allAnswers, questionIndex);
      } else {
        this.endGame();
      }
    });
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
}
