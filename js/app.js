// Основной скрипт приложения MathBuilder (веб-версия)

const { t, ACTIVITIES, setLang } = window.MathBuilderTranslations;

let currentActivityId = null;
let currentTaskIndex = 0;

// Элементы DOM
const screens = {
    loader: document.getElementById('loader'),
    lobby: document.getElementById('lobby'),
    activity: document.getElementById('activity'),
};

const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-item');
const langButtons = document.querySelectorAll('.lang-btn, .lang-option');
const lessonsGrid = document.getElementById('lessons-grid');

// Инициализация
function init() {
    // Симуляция загрузки
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        const fill = document.getElementById('progress-fill');
        if (fill) fill.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                screens.loader.classList.remove('active');
                screens.loader.classList.add('hidden');
                screens.lobby.classList.remove('hidden');
                screens.lobby.classList.add('active');
                renderLessons();
            }, 500);
        }
    }, 150);

    // Навигация по разделам
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const section = item.dataset.section;
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById('section-' + section).classList.add('active');
        });
    });

    // Переключатель языка
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLang(lang);
            // Обновить активную кнопку
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Перерисовать уроки если мы в лобби
            if (screens.lobby.classList.contains('active')) {
                renderLessons();
            }
            // Перезагрузить активную активность если открыта
            if (screens.activity.classList.contains('active') && currentActivityId) {
                loadActivity(currentActivityId, currentTaskIndex);
            }
        });
    });

    // Кнопка настроек в лобби
    document.getElementById('btn-settings').addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('section-settings').classList.add('active');
        // Найти и активировать nav item для настроек
        navItems.forEach(n => { if (n.dataset.section === 'settings') n.classList.add('active'); });
    });

    // Кнопка назад из активности
    document.getElementById('btn-back-to-lobby').addEventListener('click', () => {
        screens.activity.classList.remove('active');
        screens.activity.classList.add('hidden');
        screens.lobby.classList.remove('hidden');
        screens.lobby.classList.add('active');
    });
}

// Рендеринг списка уроков
function renderLessons() {
    lessonsGrid.innerHTML = '';
    ACTIVITIES.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.dataset.id = activity.id;
        card.innerHTML = `
            <div class="theme-icon">${activity.theme}</div>
            <h3>${t(activity.nameRefId, activity.id)}</h3>
            <p>${activity.themeRu}</p>
            <div class="lesson-footer">
                <span class="tasks-count">${activity.tasks} ${currentLang === 'ru' ? 'задания' : 'tasks'}</span>
                <span>▶</span>
            </div>
        `;
        card.addEventListener('click', () => loadActivity(activity.id, 0));
        lessonsGrid.appendChild(card);
    });
}

// Загрузка активности
function loadActivity(activityId, taskIndex) {
    currentActivityId = activityId;
    currentTaskIndex = taskIndex;

    screens.lobby.classList.remove('active');
    screens.lobby.classList.add('hidden');
    screens.activity.classList.remove('hidden');
    screens.activity.classList.add('active');

    const activity = ACTIVITIES.find(a => a.id === activityId);
    document.getElementById('activity-title').textContent = t(activity.nameRefId, activityId);

    renderTask(taskIndex);
}

// Рендеринг конкретного задания
function renderTask(taskIndex) {
    const strings = ACTIVITY_STRINGS[currentActivityId];
    if (!strings) return;

    // В этой упрощенной версии показываем все строки активности как список заданий
    const dialogueText = document.getElementById('dialogue-text');
    const dialogueImage = document.getElementById('dialogue-image');
    const taskCounter = document.getElementById('task-counter');
    const answerFields = document.getElementById('answer-fields');

    const refIds = Object.keys(strings).map(Number).sort((a, b) => a - b);
    const currentRefId = refIds[taskIndex] || refIds[0];

    dialogueText.textContent = t(currentRefId, currentActivityId);
    dialogueImage.textContent = '📋';
    taskCounter.textContent = `Задание ${taskIndex + 1} из ${refIds.length}`;

    answerFields.innerHTML = '';
    // Покажем поле ввода для числовых ответов
    const inputContainer = document.createElement('div');
    inputContainer.style.padding = '1rem';
    inputContainer.style.border = '1px solid var(--border)';
    inputContainer.style.borderRadius = '8px';
    inputContainer.innerHTML = `
        <label style="display:block; margin-bottom:0.5rem; font-size:0.9rem; color:var(--text-secondary);">Ответ:</label>
        <input type="number" placeholder="Введите число" style="width:100%; padding:0.5rem; border:1px solid var(--border); border-radius:4px;">
        <button style="margin-top:0.5rem; padding:0.5rem 1rem; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;">Проверить</button>
    `;
    answerFields.appendChild(inputContainer);
}

// Запуск
document.addEventListener('DOMContentLoaded', init);
