
/* =========================
   1. FIND HTML ELEMENTS
========================= */

const timerDisplay = document.getElementById("timer");

const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const resetButton = document.getElementById("reset-btn");

const themeButton = document.getElementById("theme-toggle");
const sessionsDisplay = document.getElementById("sessions");
const minutesDisplay = document.getElementById("minutes");


const goalProgress = document.getElementById("goal-progress");
const progressBar = document.getElementById("progress-bar");

const DAILY_GOAL = 60;


/* =========================
   2. POMODORO CLOCK SETTINGS
========================= */

const timerMode = document.getElementById("timer-mode");
const currentTimeDisplay = document.getElementById("current-time");
const sessionStartDisplay = document.getElementById("session-start");
const sessionFinishDisplay = document.getElementById("session-finish");

const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");
const progressArc = document.getElementById("progress-arc");
const skipButton = document.getElementById("skip-btn");

const FOCUS_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;
const LONG_BREAK_EVERY = 4;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 98;

let remainingSeconds = FOCUS_DURATION;
let timerInterval = null;
let endTime = null;
let sessionStartTime = null;
let sessionDuration = FOCUS_DURATION;
let sessionType = "focus";
let completedFocusSessions = 0;

/* =========================
   3. REAL CLOCK HANDS
========================= */

function updateRealClock() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const secondAngle = (seconds + milliseconds / 1000) * 6;
    const minuteAngle = (minutes + seconds / 60) * 6;
    const hourAngle = ((hours % 12) + minutes / 60) * 30;

    hourHand.style.transform = `rotate(${hourAngle}deg)`;
    minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    secondHand.style.transform = `rotate(${secondAngle}deg)`;

    currentTimeDisplay.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

/* =========================
   4. SESSION DISPLAY
========================= */

function updateSessionDisplay() {
    const elapsedSeconds = sessionDuration - remainingSeconds;
    const progress = Math.min(
        1,
        Math.max(0, elapsedSeconds / sessionDuration)
    );

    progressArc.style.strokeDasharray = PROGRESS_CIRCUMFERENCE;
    progressArc.style.strokeDashoffset =
        PROGRESS_CIRCUMFERENCE * (1 - progress);

    if (sessionType === "focus") {
        timerMode.textContent = "Focus Session";
    } else if (sessionType === "shortBreak") {
        timerMode.textContent = "Short Break";
    } else {
        timerMode.textContent = "Long Break";
    }
}

/* =========================
   5. START TIMER
========================= */

function startTimer() {
    if (timerInterval !== null || remainingSeconds <= 0) return;

    const now = Date.now();

    if (sessionStartTime === null) {
        sessionStartTime = now;
        sessionStartDisplay.textContent =
            new Date(now).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
    }

    endTime = now + remainingSeconds * 1000;

    sessionFinishDisplay.textContent =
        new Date(endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    pauseButton.textContent = "Pause";

    timerInterval = setInterval(() => {
        remainingSeconds = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
        );

        updateSessionDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            endTime = null;

            if (sessionType === "focus") {
                completedSessions += 1;
                focusedMinutes += Math.round(sessionDuration / 60);
                completedFocusSessions += 1;
                updateStatsDisplay();
            }

            alert(
                sessionType === "focus"
                    ? "Focus session complete! Time for a break."
                    : "Break complete! Ready to focus again?"
            );

            startNextSession();
        }
    }, 250);
}

/* =========================
   6. PAUSE AND RESUME
========================= */

function togglePause() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;

        remainingSeconds = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
        );

        endTime = null;
        pauseButton.textContent = "Resume";
        updateSessionDisplay();
    } else {
        startTimer();
    }
}

/* =========================
   7. RESET TIMER
========================= */

function resetTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }

    timerInterval = null;
    endTime = null;
    sessionStartTime = null;
    sessionDuration = getSessionDuration();
    remainingSeconds = sessionDuration;

    sessionStartDisplay.textContent = "Not started";
    sessionFinishDisplay.textContent = "--:--";
    pauseButton.textContent = "Pause";

    updateSessionDisplay();
}

/* =========================
   8. POMODORO CYCLE
========================= */

function getSessionDuration() {
    if (sessionType === "focus") return FOCUS_DURATION;
    if (sessionType === "shortBreak") return SHORT_BREAK_DURATION;
    return LONG_BREAK_DURATION;
}

function startNextSession() {
    if (sessionType === "focus") {
        sessionType =
            completedFocusSessions % LONG_BREAK_EVERY === 0
                ? "longBreak"
                : "shortBreak";
    } else {
        sessionType = "focus";
    }

    sessionDuration = getSessionDuration();
    remainingSeconds = sessionDuration;
    sessionStartTime = null;
    endTime = null;

    sessionStartDisplay.textContent = "Not started";
    sessionFinishDisplay.textContent = "--:--";
    pauseButton.textContent = "Pause";

    updateSessionDisplay();
}

function skipSession() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    endTime = null;
    startNextSession();
}

/* =========================
   9. CONNECT TIMER BUTTONS
========================= */

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", togglePause);
resetButton.addEventListener("click", resetTimer);
skipButton.addEventListener("click", skipSession);

/* INITIAL CLOCK DISPLAY */

updateRealClock();
setInterval(updateRealClock, 250);

updateSessionDisplay();


/* =========================
   10. SWITCH THEMES
========================= */

function toggleTheme() {
    const isLightTheme = document.body.classList.toggle("light");

    if (isLightTheme) {
        themeButton.textContent = "Dark Theme";
    } else {
        themeButton.textContent = "Light Theme";
    }
}


/* =========================
   11. CONNECT BUTTONS
========================= */

startButton.addEventListener("click", startTimer);

pauseButton.addEventListener("click", togglePause);

resetButton.addEventListener("click", resetTimer);

themeButton.addEventListener("click", toggleTheme);


/* LOAD SAVED STATISTICS */

completedSessions = Number(
    localStorage.getItem("completedSessions") || 0
);

focusedMinutes = Number(
    localStorage.getItem("focusedMinutes") || 0
);

/* =========================
   12. INITIAL DISPLAY
========================= */
function updateStatsDisplay() {
    sessionsDisplay.textContent = completedSessions;
    minutesDisplay.textContent = focusedMinutes;

    const progress = Math.min(100, (focusedMinutes / DAILY_GOAL) * 100);
    goalProgress.textContent = focusedMinutes;
    progressBar.style.width = `${progress}%`;

    localStorage.setItem("completedSessions", completedSessions);
    localStorage.setItem("focusedMinutes", focusedMinutes);
}

updateSessionDisplay();
updateStatsDisplay();

themeButton.textContent = "Light Theme";



/* =========================
   13. STUDY TASK LIST
========================= */

const taskInput = document.getElementById("task-input");
const addTaskButton = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const item = document.createElement("li");

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("span");
        text.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, deleteButton);
        taskList.appendChild(item);
    });
}

function addTask() {
    const text = taskInput.value.trim();

    if (!text) return;

    tasks.push({
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

renderTasks();
