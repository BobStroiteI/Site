const questions = [
    {
        text: "А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.",
        answers: ["Пол деревни, за раз", "Полдеревни, зараз", "Пол-деревни, за раз"],
        correct: [1],
        explanation: "Правильно! Раздельно существительное будет писаться в случае наличия дополнительного слова между существительным и частицей. Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом."
    },
    {
        text: "А эти слова как пишутся?",
        answers: ["Капуччино и эспрессо", "Каппуччино и экспресо", "Капучино и эспрессо"],
        correct: [2],
        explanation: "Конечно! По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо»."
    },
    {
        text: "Как нужно писать?",
        answers: ["Черезчур", "Черес-чур", "Чересчур"],
        correct: [2],
        explanation: "Да! Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур»."
    },
    {
        text: "Где допущена ошибка?",
        answers: ["Аккордеон", "Белиберда", "Эпелепсия"],
        correct: [2],
        explanation: "Верно! Это слово пишется так: «эпИлепсия»."
    },
    {
        text: "В каких предложениях слово «одевать» употреблено правильно с точки зрения литературной нормы?",
        answers: [
            "Мама одевает ребёнка перед прогулкой.",
            "Он одевает пальто и выходит на улицу.",
            "Стилист одевает клиента перед фотосессией.",
            "Она одевает шапку и бежит на работу"
        ],
        correct: [0, 2],
        explanation: "Правильно! Глагол «одевать» — переходный: он употребляется, когда кто-то одевает кого-то другого (ребёнка, клиента)."
    }
];

const area = document.getElementById("area");
const endMessage = document.getElementById("end-message");
const stats = document.getElementById("stats");

const STEP_DELAY = 400;
const MOVE_TIME = 800;
const SELECT_PAUSE = 2000;
const READ_PAUSE = 2000;

let queue = shuffle(questions.map((q, i) => i));
let number = 0;
let score = 0;
let locked = false;
let finished = false;


console.log(queue);





function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function showNext() {
    if (queue.length === 0) {
        finish();
        return;
    }

    const q = questions[queue.pop()];
    number++;

    const col = document.createElement("div");
    col.className = "col";

    const qBlock = document.createElement("div");
    qBlock.className = "q-block";
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = number + ".";
    const qText = document.createElement("span");
    qText.textContent = q.text;
    const marker = document.createElement("span");
    marker.className = "marker";
    qBlock.append(num, qText, marker);

    const answersBox = document.createElement("div");
    answersBox.className = "answers";

    const order = shuffle(q.answers.map((a, i) => i));
    order.forEach(function (idx) {
        const block = document.createElement("div");
        block.className = "a-block";
        block.textContent = q.answers[idx];
        block.dataset.index = idx;
        block.addEventListener("click", function () {
            onAnswer(q, col, block, marker, answersBox);
        });
        answersBox.append(block);

    });

    col.append(qBlock, answersBox);
    col._question = q;
    area.append(col);
    locked = false;
}

function onAnswer(q, col, chosen, marker, answersBox) {
    if (locked) return;
    locked = true;

    chosen.classList.add("selected");
    const blocks = Array.from(answersBox.children);
    blocks.forEach(function (b) {
        b.classList.add("locked");
    });

    setTimeout(function () {
        const isCorrect = q.correct.includes(Number(chosen.dataset.index));

        if (isCorrect) {
            score++;
            marker.textContent = "✔";
            marker.className = "marker ok";

            chosen.classList.add("big");
            const expl = document.createElement("div");
            expl.className = "explanation";
            expl.textContent = q.explanation;
            chosen.append(expl);

            const others = blocks.filter(function (b) {
                return b !== chosen;
            });
            moveDown(others);

            const t = others.length * STEP_DELAY + MOVE_TIME + READ_PAUSE;
            setTimeout(function () {
                chosen.classList.add("hide");
                setTimeout(showNext, MOVE_TIME);
            }, t);
        } else {
            marker.textContent = "✖";
            marker.className = "marker fail";

            moveDown(blocks);
            setTimeout(showNext, blocks.length * STEP_DELAY + MOVE_TIME);
        }
    }, SELECT_PAUSE);
}

function moveDown(blocks) {
    blocks.forEach(function (b, i) {
        b.style.transitionDelay = (i * STEP_DELAY) / 1000 + "s";
        b.classList.add("down");
    });
}

function finish() {
    finished = true;
    stats.textContent = "Правильных ответов: " + score + " из " + questions.length;
    endMessage.classList.remove("hidden");

    const cols = area.querySelectorAll(".col");
    cols.forEach(function (col) {
        const qBlock = col.querySelector(".q-block");
        qBlock.classList.add("clickable");
        qBlock.addEventListener("click", function () {
            showCorrect(col);
        });
    });
}

function showCorrect(col) {
    if (!finished) return;

    const hadReview = col.querySelector(".review");
    area.querySelectorAll(".review").forEach(function (r) {
        r.remove();
    });
    if (hadReview) return;

    const q = col._question;
    const box = col.querySelector(".answers");
    q.correct.forEach(function (idx) {
        const block = document.createElement("div");
        block.className = "a-block review";
        block.textContent = q.answers[idx];
        box.append(block);
    });
}

showNext();
