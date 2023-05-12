# Tech Stack

| Name | Link | Version |
| ---- | ---- | ------- |
| Typescript |  https://www.typescriptlang.org/ | 5.0.2 |
| JEST | https://jestjs.io/ | 29.5 |
| Phaser | https://phaser.io/ | 3.55.2 |
| EJS | https://ejs.co/ | 3.1.9 |
| Prisma | https://www.prisma.io/ | 4.12.0 |
| PassportJs | https://www.passportjs.org/ | 0.6.0 |
| ExpressJs | https://expressjs.com/ | 4.18.2 |
| Nodemon | https://nodemon.io/ | 2.0.22 |

**Typescript:** Create a object oriented, class based structure for the game mechanic logic and source code.

**JEST:** Testing logical functionality to ensure the codebase works as intended.

**Phaser:** API for browser games that will be used to handle animations and sound

**EJS:** Templating framework used for rendering user specific/state derived information.

**Prisma:** ORM will be used with SQLite to create an easy to use and manipulate database structure for information storage.

**PassportJs:** Library will be used to handle authentication and authorization for server routes.

**ExpressJs:** Library will be used to instantiate and run the server hosting the game.

**Nodemon:** Library will be used in development in order to view changes made in development easily and efficiently.

<br>

# Unit Testing

## Dice Rolls - Mohammad Fakih A01298047

In this section I used unit testing and TDD methodology to define the boundaries of what a potential total roll can be. I also created test logic around how the dice values could be retrieved for when rolled dice are rendered.

To do this I first created the function signatures for my mock functionality in diceRoll.js. Then in diceRoll.test.js I stipulated the requirements that each function would need to meet to achieve its purpose.

From there I fleshed out my function signatures into full functions and ran them through my tests to confirm the logic was sound.

## True or False - Tony Paik A00567207

In this section, I used TDD methodology to develop and test the True or False mini game. The mini game presents a question to the player and asks them to answer true or false. If the player answers correctly, they earn one point, and the game moves on to the next question. If the player answers incorrectly, the game ends and their final score is displayed.

First, I defined the function signatures for the game logic in minigame.js. Then, in minigame.test.js, I wrote a series of tests to verify that the game behaves as expected.

For the trueOrFalseMiniGame function, I wrote tests to ensure that the function returns a boolean value based on the user's answer and the correct answer to the question. I also added tests to verify that the function throws an error if the user's answer is not a boolean value.

For the updatePoints function, I wrote tests to ensure that the function correctly updates the player's points based on whether they answered the question correctly or incorrectly. I also added tests to verify that the function correctly handles negative point values and throws an error if the current points value is not a number.

By following this TDD process, I was able to develop a robust and reliable True or False mini game that meets the requirements of the project.

## Event Listener - Jamie Skidmore A01330539

In this section, I used TDD to develop a way for players to send emotes by pressing key bindings.

I wrote tests for the mockKeyupEventHandler function to verify that the correct emote is retrieved from the database when users press specific keys. I also tested to make sure that this function returns falsy when users press keys are that not associated with emotes.

The tests passing shows that the Emote class succesfully creates new emote objects including a keycode as a key-value pair. As well, the mockKeyupEventHandler works to find an emote based on the keycode, and return the emote type.

To simplify running the jest tests, I created the mockKeyupEventHandler function instead of mocking an event listener with jest. However, once we have created the DOM, the logic in mockKeyupEventHandler can be applied to a real event listener for a keyup event, and subject to further testing.
