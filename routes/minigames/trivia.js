const router = require('express').Router();
const path = require('path');
const questionsHandler = require("../../util/questionsHandler.js");

router.get("/getQuestions", (req, res) => {
    const chosenQuestions = questionsHandler.getNewQuestions();
    res.send(JSON.stringify(chosenQuestions)).status(200);
});

router.post("/submitAnswer", (req, res) => {
    const { question, answer, } = req.body;
    const foundQuestion = questionsHandler.getChosenQuestions().find((questionObject) => questionObject.question === question);

    if (foundQuestion) {
        if (foundQuestion.correctAnswer === answer) {
            res.send(true).status(200);
        } else {
            res.send(false).status(200);
        }
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;