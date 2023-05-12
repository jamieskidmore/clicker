const allQuestions = require('./questions.json');
const util = require('./util');

let chosenQuestions = [];

const getNewQuestions = (amount = 5) => {
    const questions = [];
    const questionClone = structuredClone(allQuestions).questions;

    for (let i = 0; i < amount; i++) {
        const chosenIndex = util.getRandomInt(questionClone.length - 1);
        const questionObject = questionClone[chosenIndex];
        questions.push(questionObject);
        questionClone.splice(chosenIndex, 1);
    }

    util.shuffleArray(questions);
    chosenQuestions = questions;
    return questions;
};

const getChosenQuestions = () => {
    return chosenQuestions;
};

module.exports = { getNewQuestions, getChosenQuestions, };