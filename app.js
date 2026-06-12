let quizData = {};
let currentTopic = "";
let currentTopicData = null;
let currentLevel = 1;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;

/* Splash */

window.addEventListener("load", async () => {

    setTimeout(() => {
        document.getElementById("splash").style.display = "none";
        document.getElementById("app").classList.remove("hidden");
    }, 1500);

    loadSavedName();

    await loadQuizData();

    loadHistory();
});

/* Load Quiz JSON */

async function loadQuizData() {

    try {

        const response = await fetch("quizzes/index.json");

        const data = await response.json();

        quizData = data.topics;

        showUpdateDates();

    } catch (e) {

        console.error(e);
        alert("Quiz index could not be loaded.");

    }
}

/* Update Dates */

function showUpdateDates() {
    // disabled for now
}

function showScreen(screenId) {

    const screens = [
        "nameSection",
        "topicSection",
        "quizSection",
        "resultSection",
        "historySection"
    ];

    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });

    const active = document.getElementById(screenId);

    if (active) {
        active.classList.remove("hidden");
        active.classList.add("fade");
    }

    // 🔥 ALWAYS UPDATE HISTORY WHEN MENU IS SHOWN
    if (screenId === "topicSection") {
        loadHistory();
        document.getElementById("historySection").classList.remove("hidden");
    }
}

/* Name */

function saveName() {

    const name = document.getElementById("userName").value.trim();

    if (!name) {
        alert("Enter your name.");
        return;
    }

    localStorage.setItem("userName", name);

    document.getElementById("welcome").textContent =
        "Welcome, " + name + "!";

    showScreen("topicSection");
}

function loadSavedName() {

    const name = localStorage.getItem("userName");

    if (name) {

        document.getElementById("userName").value = name;

        document.getElementById("welcome").textContent =
            "Welcome, " + name + "!";

        showScreen("topicSection");

    } else {

        showScreen("nameSection");
    }
}

/* Start Topic */

async function loadTopic(topic) {

    const data = await loadQuizFile(topic);

    currentTopicData = data[topic];

    currentTopic = topic;
    currentLevel = 1;

    currentQuestions =
        currentTopicData.levels["1"].questions;

    currentIndex = 0;
    score = 0;

    document.getElementById("topicTitle").textContent =
        topic.toUpperCase() + " - Level 1";

    showScreen("quizSection");

    showQuestion();
}

async function loadQuizFile(topic) {

    const response = await fetch(`quizzes/${topic}.json`);

    if (!response.ok) {
        alert("Quiz file not found: " + topic);
        return null;
    }

    return await response.json();
}

/* Show Question */

function showQuestion() {

    selectedAnswer = null;

    const q = currentQuestions[currentIndex];

    if (!q || !q.q) {
        alert("Question error!");
        return;
    }

    document.getElementById("question").textContent = q.q;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach((option, index) => {

        const btn = document.createElement("button");
        btn.className = "optionBtn";
        btn.textContent = option;

        btn.onclick = () => {

            selectedAnswer = index;

            document.querySelectorAll(".optionBtn")
                .forEach(b => b.classList.remove("selected"));

            btn.classList.add("selected");
        };

        optionsDiv.appendChild(btn);
    });

    document.getElementById("progress").textContent =
        `Question ${currentIndex + 1} of ${currentQuestions.length}`;
}

/* Next Question */

function nextQuestion() {

    if (selectedAnswer === null) {

        alert("Select an answer.");
        return;
    }

    const q = currentQuestions[currentIndex];

    if (selectedAnswer === q.answer)
        score++;

    currentIndex++;

    if (currentIndex >= currentQuestions.length) {

        finishQuiz();

    } else {

        showQuestion();
    }
}

/* Finish */

function finishQuiz() {

    const total = currentQuestions.length;

    const percent = (score / total) * 100;

    // Save result
    saveResult();

    if (percent >= 100) {

        currentLevel++;

        const nextLevel =
            currentTopicData.levels[String(currentLevel)];
        
        if (nextLevel) {

            alert("Level " + (currentLevel - 1) +
                  " Completed! Next Level Unlocked");

            currentQuestions = nextLevel.questions;
            currentIndex = 0;
            score = 0;

            document.getElementById("topicTitle").textContent =
                currentTopic.toUpperCase() +
                " - Level " + currentLevel;

            showScreen("quizSection");
            showQuestion();

            return;
        }
    }

    // End result screen
    showScreen("resultSection");

    document.getElementById("scoreText").textContent =
        `Level ${currentLevel} Score: ${score} / ${total}`;
}

/* Save Result */

function saveResult() {

    const name =
        localStorage.getItem("userName") || "Unknown";

    const now = new Date();

    const result = {

        name: name,

        topic: currentTopic,

        score: `${score}/${currentQuestions.length}`,

        date: now.toLocaleDateString(),

        time: now.toLocaleTimeString()

    };

    const history =
        JSON.parse(
            localStorage.getItem("quizHistory")
        ) || [];

    history.unshift(result);

    localStorage.setItem(
        "quizHistory",
        JSON.stringify(history)
    );

    loadHistory();
}

/* History */

function loadHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("quizHistory")
        ) || [];

    const box =
        document.getElementById("historyList");

    if (history.length === 0) {

        box.innerHTML =
            "No Results Yet";

        return;
    }

    box.innerHTML = "";

    history.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "historyItem";

        div.innerHTML = `
            <strong>${item.name}</strong>
            Topic: ${item.topic}<br>
            Score: ${item.score}<br>
            Date: ${item.date}<br>
            Time: ${item.time}
        `;

        box.appendChild(div);
    });
}

function clearResults() {

    const confirmDelete = confirm(
        "Are you sure you want to delete all results?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem("quizHistory");

    loadHistory();

    alert("All results cleared!");
}

/* Share */

function shareResult() {

    const name =
        localStorage.getItem("userName") || "Unknown";

    const text =
`📘 WeeklyEnglish Pro

Name: ${name}
Topic: ${currentTopic}
Score: ${score}/${currentQuestions.length}
`;

    if (navigator.share) {

        navigator.share({
            title: "Quiz Result",
            text: text
        });

    } else {

        alert(text);
    }
}

/* Home */

function goHome() {

    showScreen("topicSection");

    loadHistory();

    document.getElementById("historySection").classList.remove("hidden");
}

if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations()
        .then(regs => {
            regs.forEach(reg => reg.update());
        });
}
