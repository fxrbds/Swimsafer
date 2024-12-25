
let TEST = {};
const QUESTIONS_PER_SECTION = 5;

function loadTest(divQuestions, divResults, divAlert) {

    showAlert(divAlert, 'info', 'Loading questions...')
    $.getJSON("data/swimsafer_questions.json", function () {

    })
    .done(function (data) {
        arrHTML = [];
        TEST = JSON.parse(JSON.stringify(data));

        data.sections.forEach((section, sectionIndex) => {
            arrHTML.push(
                '<h2>', section.label, '</h2>',
                '<ol type="1">'
            );

            // randomize questions
            let questions = shuffleArray(section.items.map((item, i) => i));
            questions.forEach((questionIndex, i) => {

                if(i < QUESTIONS_PER_SECTION) {

                    arrHTML.push(
                        '<li class="mb-3" data-type="question" data-section="' + sectionIndex + '" data-question="' + questionIndex + '">',
                        section.items[questionIndex].question
                    )
                    answers = section.items[questionIndex].answers.map((answer, i) => i);
                    if(section.items[questionIndex].keepLastAnswer) {
                        // the last answer needs to be kept last
                        answers = shuffleArray(answers.slice(0, answers.length - 1));
                        answers.push(section.items[questionIndex].answers.length - 1);
                    }
                    else {
                        answers = shuffleArray(answers);
                    }
                    answers.forEach((answerIndex) => {
                        let tmpID = createRandomString(10);
                        arrHTML.push(
                            '<div class="form-check">',
                            '<input class="form-check-input" type="radio" name="opt-' + sectionIndex + '-' + questionIndex + '" id="opt' + tmpID + '" data-type="answer" data-answer="' + answerIndex + '">',
                            '<label class="form-check-label" for="opt' + tmpID + '">',
                            section.items[questionIndex].answers[answerIndex].answer,
                            '</label>',
                            '</div>'
                        );
                    });
                    arrHTML.push(
                        '</li>'
                    );
                }
            });
            arrHTML.push(
                '</ol>'
            );
        });
        arrHTML.push(
            '<button type="button" id="cmdSubmitTest" class="btn btn-primary btn-lg">Submit Answers</button>'
        );

        divQuestions.html(arrHTML.join(''));
        $('#cmdSubmitTest').on('click', function() {
            markTest(divQuestions, divResults, divAlert);
        })
        divQuestions.show();
        divAlert.hide();
    })
    .fail(function () {
        showAlert(divAlert, 'danger', 'Failed loading questions');
    });
}

function markTest(divQuestions, divResults, divAlert) {
    arrHTML = [];
    let numQuestions = 0;
    let numCorrect = 0;

    TEST.sections.forEach((section, sectionIndex) => {
        arrHTML.push(
            '<h2>', section.label, '</h2>',
            '<ol type="1">'
        );
        $('[data-type="question"][data-section="' + sectionIndex + '"]').each(function() {
            let elem = $(this);
            let questionIndex = elem.data('question');

            arrHTML.push(
                '<li class="mb-3">',
                section.items[questionIndex].question,
                '<ol type="a">'
            )
            elem.find('input[data-type="answer"]').each(function() {

                let elemAnswer = $(this);
                let answerIndex = elemAnswer.data('answer');
                let isCorrect = TEST.sections[sectionIndex].items[questionIndex].answers[answerIndex].isCorrect;

                if(isCorrect && elemAnswer.is(':checked')) {
                    numCorrect++;
                    arrHTML.push(
                        '<li class="fw-bold text-success">'
                    );
                }
                else if(!isCorrect && elemAnswer.is(':checked')) {
                    arrHTML.push(
                        '<li class="text-danger">'
                    );
                }
                else if(isCorrect) {
                    arrHTML.push(
                        '<li class="fw-bold">'
                    );
                }
                else {
                    arrHTML.push(
                        '<li>'
                    );
                }
                arrHTML.push(
                    TEST.sections[sectionIndex].items[questionIndex].answers[answerIndex].answer
                );
                arrHTML.push(
                    '</li>'
                );
            });
            arrHTML.push(
                '</ol>',
                '</li>'
            );
    
            numQuestions++;
        });
        arrHTML.push(
            '</ol>'
        );
    });

    let passed = false;
    if(numCorrect / numQuestions >= 14/15) {
        passed = true;
    }

    arrHTML.unshift(
        '<div class="card ' + (passed ? 'border-success' : 'border-danger') + ' mb-3">',
        '<div class="card-header ' + (passed ? 'text-bg-success' : 'text-bg-danger') + '">Result: ' + (passed ? 'PASSED' : 'FAILED') + '</div>',
        '<div class="card-body fs-3">',
        '<p>',
        'Your score:',
        '<br>',
        '<span class="fs-1 fw-bold">' + (10 * numCorrect / numQuestions).toFixed(2) + '</span>',
        '<br>',
        numCorrect + ' / ' + numQuestions,
        '</p>',
        '<button type="button" id="cmdRetakeTest" class="btn btn-primary btn-lg">Retake Test</button>',
        '</div>',
        '</div>'
    );

    divQuestions.hide();
    divResults.html(arrHTML.join(''));
    $('#cmdRetakeTest').on('click', function() {
        divResults.hide();
        loadTest(divQuestions, divResults, divAlert);
        return false;
    });
    divResults.show();
    $('html, body').scrollTop(0);
    divAlert.hide();
}

function showAlert(divAlert, alertType, msg) {
    if (msg) {
        divAlert.removeClass('alert-info alert-success alert-danger alert-warning').addClass('alert-' + alertType);
        divAlert.html(msg);
        divAlert.show();
    }
    else {
        divAlert.hide();
    }
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function shuffleArray(array) {
    let newArray = JSON.parse(JSON.stringify(array));
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [newArray[currentIndex], newArray[randomIndex]] = [
            newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
}

function createRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
