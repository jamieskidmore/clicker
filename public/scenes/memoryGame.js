// Global scope variable to ensure there is only ever one instance of StateHandler class
let stateHandlerInstance = null;
// Global scope variable to ensure there is only ever one instance of EventDispatcher class
let eventDispatcherInstance = null;

class MemoryGameScene extends Phaser.Scene {
  #justRunOnceYouLittleShit = false;
  #gameIsStarted = false;
  #WIDTH = 800;
  #HEIGHT = 600;
  #CARD_KEYS = [];
  #PRESET_POSITIONS = [];
  #gameTimeLimit = 20;
  #score = 0;
  #currentDeck = [[], []];
  #currentlySelected = [];
  #currentlySolved = 0;

  constructor() {
    super("MemoryGameScene");
  }

  preload() {
    const assetNameArray = [
      "background",
      "darkBlueAlienCard",
      "greenAlienCard",
      "lightBlueAlienCard",
      "pinkAlienCard",
      "venusCard",
      "cardBack",
      "arrowIcon",
    ];
    assetNameArray.forEach((asset) => {
      this.sys.load.image(asset, `assets/${asset}.png`);
    });

    // Deck
    this.#CARD_KEYS = [
      "darkBlueAlienCard",
      "greenAlienCard",
      "lightBlueAlienCard",
      "pinkAlienCard",
      "venusCard",
      "darkBlueAlienCard",
      "greenAlienCard",
      "lightBlueAlienCard",
      "pinkAlienCard",
      "venusCard",
    ];
    this.#PRESET_POSITIONS = [
      [this.#WIDTH / 9.4, this.#HEIGHT / 3],
      [this.#WIDTH / 3.3, this.#HEIGHT / 3],
      [this.#WIDTH / 2, this.#HEIGHT / 3],
      [this.#WIDTH / 1.43, this.#HEIGHT / 3],
      [this.#WIDTH / 1.115, this.#HEIGHT / 3],
      [this.#WIDTH / 9.4, this.#HEIGHT / 1.4],
      [this.#WIDTH / 3.3, this.#HEIGHT / 1.4],
      [this.#WIDTH / 2, this.#HEIGHT / 1.4],
      [this.#WIDTH / 1.43, this.#HEIGHT / 1.4],
      [this.#WIDTH / 1.115, this.#HEIGHT / 1.4],
    ];
  }

  create() {
    this.#currentDeck = [[], []];
    this.#currentlySelected = [];
    this.#currentlySolved = 0;
    this.#score = 0;
    this.#gameIsStarted = true;
    this.#currentlySolved = 0;
    this.sys.cardBacks = this.sys.add.group();
    this.sys.cardFaces = this.sys.add.group();

    this.#renderBackground();
    this.createDeck();
    this.createCardBacks();
    this.addCardBackEventListeners();
    this.representDeck(this.sys.cardFaces.children.entries);
    this.renderTimer();
    this.createTimerEvent();
    this.renderScore();
    this.addEventListeners();
  }

  update() {
    const emitter = EventDispatcher.getInstance();
    /**
     * Listener waits till deck is solved to refresh the available deck
     */
    emitter.addListener("deckSolved", () => {
      if (!this.#justRunOnceYouLittleShit) {
        this.sys.cardFaces.children.entries = [];
        this.sys.cardBacks.children.entries = [];
        this.createDeck();
        this.createCardBacks();
        this.addCardBackEventListeners();
        this.representDeck(this.sys.cardFaces.children.entries);

        this.#justRunOnceYouLittleShit = true;
      }
    });

    emitter.addListener("gameOver", () => {
      emitter.destroy();
      if (this.#gameIsStarted) {
        this.gameOverText = this.add.text(
          this.sys.game.config.width / 2,
          this.sys.game.config.height / 2,
          "Game Over"
        );
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setScale(2);
        this.gameOverText.depth = 2;

        this.sys.myTime = this.#gameTimeLimit;
        this.#gameIsStarted = false;

        setTimeout(() => {
          this.goBackToHomeScreen();
        }, 2500);
      }
    });
  }

  #renderBackground() {
    this.sys.add.sprite(this.#WIDTH / 2, this.#HEIGHT / 2, "background");
  }

  // Deck methods

  /**
   * Function randomly indexes ASSET_VALUES
   * @returns {String} texture name
   */
  #getRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * this.#CARD_KEYS.length);
    const cardRetrieved = this.#CARD_KEYS[randomIndex];
    this.#CARD_KEYS.splice(randomIndex, 1);
    if (this.#CARD_KEYS.length === 0) {
      this.#CARD_KEYS = [
        "darkBlueAlienCard",
        "greenAlienCard",
        "lightBlueAlienCard",
        "pinkAlienCard",
        "venusCard",
        "darkBlueAlienCard",
        "greenAlienCard",
        "lightBlueAlienCard",
        "pinkAlienCard",
        "venusCard",
      ];
    }
    return cardRetrieved;
  };

  /**
   * Function generates Sprite object for pre-loaded assets
   * @param {[Number, Number]} cardPosition - coordinates for card
   * @param {String} textureName  - asset name for card
   * @returns {Sprite} Sprite class object for newly generated asset
   */
  #createSprite = (cardPosition, textureName) => {
    const card = this.sys.add.sprite(
      cardPosition[0],
      cardPosition[1],
      textureName
    );
    card.setScale(0.15);
    return card;
  };

  /**
   * Function creates a random card at the card position
   * @param {[Number, Number]} cardPosition - tuple of card's coordinates
   * @returns {Sprite} Sprite class object for the card
   */
  #createCardFace = (cardPosition) => {
    const textureType = this.#getRandomCard();
    return this.#createSprite(cardPosition, textureType);
  };

  /**
   * Function generates card back at each preset card position
   */
  createCardBacks = () => {
    this.#PRESET_POSITIONS.forEach((cardPosition) => {
      const card = this.#createSprite(cardPosition, "cardBack");
      card.setInteractive();
      this.sys.cardBacks.add(card);
    });
  };

  /**
   * Function creates a deck by generating random card at preset position
   */
  createDeck = () => {
    this.#PRESET_POSITIONS.forEach((cardPosition) => {
      const card = this.#createCardFace(cardPosition);
      this.sys.cardFaces.add(card);
    });
  };

  /**
   * Function creates an event listener on cardBacks hiding cardFaces to reveal them when clicked
   */
  addCardBackEventListeners = () => {
    const allCardBacks = this.sys.cardBacks.children.entries;

    /**
     * Converts user click into custom event
     */
    this.sys.cardBacks.getChildren().forEach((cardBack) => {
      cardBack.on("pointerdown", function () {
        let cardIndex = allCardBacks.indexOf(cardBack);
        if (cardIndex > 4) {
          cardIndex = cardIndex - 5;
        }
        let cardRow = null;
        if (cardBack.y === 200) {
          cardRow = 0;
        } else {
          cardRow = 1;
        }
        this.emitter = EventDispatcher.getInstance();
        this.emitter.emit("userClicksCardBack", {
          cardBack,
          cardIndex,
          cardRow,
        });
      });
    });

    this.emitter = EventDispatcher.getInstance();

    /**
     * Listener toggles cardBack visibility on flipCard event
     */
    this.emitter.addListener("flipCard", (event) => {
      event.cardBack.visible = false;
    });

    /**
     * Listener makes all cardBacks visible on resetDeck event
     */
    this.emitter.addListener("resetDeck", () => {
      this.sys.cardBacks.children.entries.forEach((cardBack) => {
        if (cardBack !== null) {
          cardBack.visible = true;
        }
      });
    });

    /**
     * Listener destroys matching cards whilst maintaining array length
     */
    this.emitter.addListener("handleMatch", (event) => {
      const card1BackIndex = this.sys.cardBacks.children.entries.indexOf(
        event.card1Back
      );
      const card1Index = this.sys.cardFaces.children.entries.indexOf(
        event.card1
      );
      const card2BackIndex = this.sys.cardBacks.children.entries.indexOf(
        event.card2Back
      );
      const card2Index = this.sys.cardFaces.children.entries.indexOf(
        event.card2
      );

      this.sys.cardFaces.children.entries[card1Index] = null;
      event.card1.destroy();
      this.sys.cardFaces.children.entries[card2Index] = null;
      event.card2.destroy();
      this.sys.cardBacks.children.entries[card1BackIndex] = null;
      event.card1Back.destroy();
      this.sys.cardBacks.children.entries[card2BackIndex] = null;
      event.card2Back.destroy();
    });
  };

  // Timer

  renderTimer = () => {
    this.sys.timer = this.sys.add.text(
      660,
      10,
      `Timer: ${this.#gameTimeLimit}`
    );
    this.sys.timer.depth = 1;
    this.sys.timer.setScale(1.4);
    this.sys.myTime = this.#gameTimeLimit;
  };

  createTimerEvent = () => {
    this.sys.timerEvent = this.sys.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.#countdown(this.sys.timer);
      },
      callbackScope: this,
    });
  };

  #countdown = (timer) => {
    if (this.#gameIsStarted && this.sys.myTime > 0) {
      this.sys.myTime--;
    }
    timer.setText(`Timer: ${this.sys.myTime}`);
    if (this.sys.myTime === 0) {
      this.emitter = EventDispatcher.getInstance();
      this.emitter.emit("gameOver");
    }
  };

  // Score

  renderScore = () => {
    this.sys.scoreText = this.sys.add.text(20, 10, `Score: ${this.#score}`);
    this.sys.scoreText.setScale(1.4);
  };

  addEventListeners = () => {
    this.emitter = EventDispatcher.getInstance();
    this.emitter.addListener("handleMatch", () => {
      this.#score++;
      this.sys.scoreText.setText(`Score: ${this.#score}`);
    });
    this.emitter.addListener(
      "userClicksCardBack",
      this.#handleUserClicksCardBack
    );
  };

  // State

  /**
   * Function updates the currentDeck property so that it matches the current rendering of the deck
   * @param {[Sprite]} allCards - Array of all cardFace sprites
   */
  representDeck = (allCards) => {
    allCards.map((card) => {
      if (card.y === 200) {
        this.#currentDeck[0].push(card);
      } else {
        this.#currentDeck[1].push(card);
      }
    });
    this.#currentDeck.forEach((row) => {
      row.sort((a, b) => a.x - b.x);
    });
  };

  /**
   * Function retrieves data from event and determines how to interpret the user click event
   * @param {Event} event - Event generated by user clicking a card back
   */
  #handleUserClicksCardBack = (event) => {
    this.emitter = EventDispatcher.getInstance();

    const currentCardFace = this.#currentDeck[event.cardRow][event.cardIndex];

    if (this.#currentlySelected.length === 2) {
      this.#currentlySelected = [];
      this.emitter.emit("resetDeck");
    }

    this.#currentlySelected.push([currentCardFace, event.cardBack]);

    if (this.#currentlySelected.length === 2) {
      const card1 = this.#currentlySelected[0][0];
      const card1Back = this.#currentlySelected[0][1];
      const card2 = this.#currentlySelected[1][0];
      const card2Back = this.#currentlySelected[1][1];

      if (card1.texture.key === card2.texture.key) {
        this.#currentlySolved++;
        setTimeout(() => {
          this.emitter.emit("handleMatch", {
            card1,
            card1Back,
            card2,
            card2Back,
          });
        }, 250);
      }
    }
    this.emitter.emit("flipCard", { cardBack: event.cardBack });

    if (this.#currentlySolved === 5) {
      this.#justRunOnceYouLittleShit = false;
      this.#currentDeck.shift();
      this.#currentDeck.shift();
      this.#currentDeck.unshift([]);
      this.#currentDeck.unshift([]);
      this.#currentlySelected = [];
      this.#currentlySolved = 0;
      this.emitter.emit("deckSolved");
    }
  };
  displayBackButton() {
    const backButton = {
      button: this.add.sprite(15, 30, "arrowIcon").setScale(3).setInteractive(),
      text: this.add.text(25, 25, "Return to board"),
    };
    backButton.button.angle = -90;
    return backButton;
  }

  goBackToHomeScreen() {
    this.scene.start("Game");
  }
}

/**
 * Singleton class handles the dispatching of custom events
 */
class EventDispatcher extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }

  static getInstance = () => {
    if (eventDispatcherInstance === null) {
      eventDispatcherInstance = new EventDispatcher();
    }
    return eventDispatcherInstance;
  };
}

/**
 * Singleton class handles the updating of game state representation
 */
class StateHandler {
  static getInstance = () => {
    if (stateHandlerInstance === null) {
      stateHandlerInstance = new StateHandler();
    }
    return stateHandlerInstance;
  };
}
