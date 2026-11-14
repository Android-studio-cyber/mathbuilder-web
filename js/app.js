/* ============================================================
   MathBuilder — веб-версия, основной скрипт
   Всё внутри IIFE: не конфликтует с глобальными именами
   из translations.js (t, ACTIVITIES, currentLang и т.д.)
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Внешние данные ---------- */

    var TR = window.MathBuilderTranslations || {};
    var DATA = window.MB_DATA || {};
    var IMG = window.MB_IMAGES || {};
    var ACTIVITIES = TR.ACTIVITIES || [];
    var ACT = TR.ACTIVITY_STRINGS || {};
    var MAIN = TR.MAIN_STRINGS || {};

    /* ---------- Тексты интерфейса ---------- */

    var UI = {
        ru: {
            loading: 'Загрузка…',
            navLessons: 'Уроки',
            navBuilder: 'Конструктор',
            navResources: 'Ресурсы',
            navSettings: 'Настройки',
            lobbyTitle: 'Лобби уроков',
            lobbySubtitle: 'Выберите активность, чтобы начать занятие',
            filterAll: 'Все темы',
            themeAnimals: 'Животные и насекомые',
            themeOutdoors: 'На улице',
            themeSports: 'Спорт',
            themeFood: 'Еда',
            open: 'Открыть',
            completed: 'Выполнено',
            lesson: 'Урок',
            task: 'Задание',
            of: 'из',
            prev: 'Назад',
            repeat: 'Повтор',
            next: 'Далее',
            done: 'Готово',
            doneShort: 'Выполнено',
            listen: 'Прослушать',
            reference: 'Образец',
            answerLabel: 'Ответ',
            answerHint: 'Введите числа в поля и нажмите «Далее»',
            noReference: 'Для этого задания нет картинки-образца. Постройте модель по описанию из задания.',
            noAnswers: 'Это задание выполняется из кирпичиков. Постройте модель, обсудите её с учителем и нажмите «Готово».',
            noDialogue: 'Задание без текста.',
            markedDone: 'Задание отмечено выполненным',
            unmarkedDone: 'Отметка снята',
            allDone: 'Все задания активности выполнены!',
            lastTask: 'Это последнее задание в активности',
            speakUnsupported: 'Озвучивание не поддерживается браузером',
            builderTitle: 'Конструктор',
            builderSubtitle: 'Свободная игра с кирпичиками',
            builderHead: '3D-конструктор появится в следующей версии',
            builderText: 'В оригинальном приложении этот раздел — пустая пластина и полная палитра кирпичиков для свободного строительства. Перенос 3D-движка в браузер — следующий этап работы.',
            builderNote: 'А пока все 155 заданий с картинками и полями ответов уже доступны в разделе «Уроки».',
            builderCta: 'Перейти к урокам',
            resourcesTitle: 'Образовательные ресурсы',
            resourcesSubtitle: 'Материалы к урокам MoreToMath Curriculum Pack 1–2',
            res1Title: 'План урока',
            res1Text: 'Пошаговый план занятия: цель, материалы, ход урока и вопросы для обсуждения.',
            res2Title: 'Раздаточный материал',
            res2Text: 'Рабочие листы для учеников: построение моделей, запись чисел и сравнение результатов.',
            res3Title: 'Наборы кирпичиков',
            res3Text: 'Каждое задание рассчитано на набор LEGO MoreToMath: пластины, кирпичи и фигурки персонажей.',
            resNote: 'PDF-материалы входят в комплект MoreToMath Curriculum Pack 1–2 и распространяются вместе с набором LEGO Education.',
            settingsTitle: 'Настройки',
            settingsSubtitle: 'Язык, прогресс и сведения о приложении',
            settingLang: 'Язык приложения',
            settingLangDesc: 'Переключение применяется сразу, перезапуск не нужен',
            settingProgress: 'Прогресс',
            settingReset: 'Сбросить прогресс',
            settingAbout: 'О приложении',
            settingAboutDesc: 'Веб-версия MathBuilder: 16 активностей, 155 заданий, русская и английская локализация.',
            resetConfirm: 'Сбросить весь прогресс и ответы? Это действие нельзя отменить.',
            resetDone: 'Прогресс сброшен',
            saved: 'Сохранено',
            progressLine: function (d, t, a, n) {
                return d + ' из ' + t + ' заданий · ' + a + ' из ' + n + ' активностей завершено';
            }
        },
        en: {
            loading: 'Loading…',
            navLessons: 'Lessons',
            navBuilder: 'Builder',
            navResources: 'Resources',
            navSettings: 'Settings',
            lobbyTitle: 'Lesson Lobby',
            lobbySubtitle: 'Choose an activity to start the lesson',
            filterAll: 'All themes',
            themeAnimals: 'Animals and insects',
            themeOutdoors: 'Outdoors',
            themeSports: 'Sports',
            themeFood: 'Food',
            open: 'Open',
            completed: 'Completed',
            lesson: 'Lesson',
            task: 'Task',
            of: 'of',
            prev: 'Previous',
            repeat: 'Repeat',
            next: 'Next',
            done: 'Done',
            doneShort: 'Completed',
            listen: 'Listen',
            reference: 'Reference',
            answerLabel: 'Answer',
            answerHint: 'Type the numbers into the fields and press “Next”',
            noReference: 'There is no reference picture for this task. Build the model described in the task.',
            noAnswers: 'This task is done with bricks. Build the model, discuss it with your teacher and press “Done”.',
            noDialogue: 'This task has no text.',
            markedDone: 'Task marked as completed',
            unmarkedDone: 'Mark removed',
            allDone: 'All tasks in this activity are completed!',
            lastTask: 'This is the last task in the activity',
            speakUnsupported: 'Speech is not supported by this browser',
            builderTitle: 'Builder',
            builderSubtitle: 'Free play with bricks',
            builderHead: 'The 3D builder is coming in the next version',
            builderText: 'In the original app this section is an empty baseplate and the full brick palette for free building. Porting the 3D engine to the browser is the next step.',
            builderNote: 'Meanwhile all 155 tasks with pictures and answer fields are already available in the Lessons section.',
            builderCta: 'Go to lessons',
            resourcesTitle: 'Educational Resources',
            resourcesSubtitle: 'Materials for MoreToMath Curriculum Pack 1–2 lessons',
            res1Title: 'Lesson plan',
            res1Text: 'A step-by-step plan: goal, materials, lesson flow and discussion questions.',
            res2Title: 'Student handout',
            res2Text: 'Worksheets for students: building models, writing numbers and comparing results.',
            res3Title: 'Brick sets',
            res3Text: 'Every task is designed for a LEGO MoreToMath set: baseplates, bricks and character figures.',
            resNote: 'PDF materials are part of the MoreToMath Curriculum Pack 1–2 and come with the LEGO Education set.',
            settingsTitle: 'Settings',
            settingsSubtitle: 'Language, progress and app information',
            settingLang: 'App language',
            settingLangDesc: 'The change applies immediately, no restart needed',
            settingProgress: 'Progress',
            settingReset: 'Reset progress',
            settingAbout: 'About',
            settingAboutDesc: 'Web version of MathBuilder: 16 activities, 155 tasks, Russian and English localization.',
            resetConfirm: 'Reset all progress and answers? This cannot be undone.',
            resetDone: 'Progress has been reset',
            saved: 'Saved',
            progressLine: function (d, t, a, n) {
                return d + ' of ' + t + ' tasks · ' + a + ' of ' + n + ' activities completed';
            }
        }
    };

    /* ---------- Константы ---------- */

    var THEME_OF = {};
    (function () {
        for (var i = 1; i <= 16; i++) {
            THEME_OF[String(i)] = i <= 4 ? 'animals' : i <= 8 ? 'outdoors' : i <= 12 ? 'sports' : 'food';
        }
    })();

    var THEME_KEYS = ['animals', 'outdoors', 'sports', 'food'];

    var STORAGE = {
        lang: 'mb.lang',
        answers: 'mb.answers.v2',
        done: 'mb.done.v2'
    };

    /* ---------- Состояние ---------- */

    var lang = 'ru';
    var answers = {};
    var doneMap = {};
    var state = { activityId: null, taskIndex: 0, filter: 'all', section: 'lessons' };
    var tasksCache = {};
    var toastTimer = null;
    var progressShown = 0;
    var lobbyShown = false;
    var speaking = false;

    var el = {};

    /* ---------- Утилиты ---------- */

    function byId(id) {
        return document.getElementById(id);
    }

    function safeParse(raw, fallback) {
        try {
            var v = JSON.parse(raw);
            return v && typeof v === 'object' ? v : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function readStore(key, fallback) {
        try {
            var raw = window.localStorage.getItem(key);
            return raw ? safeParse(raw, fallback) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeStore(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            /* приватный режим — просто работаем без сохранения */
        }
    }

    function ui(key) {
        var table = UI[lang] || UI.ru;
        var value = table[key];
        if (value === undefined) value = UI.ru[key];
        return value === undefined ? key : value;
    }

    function tr(ref, actId) {
        if (ref === null || ref === undefined) return '';
        var entry = null;
        if (actId && ACT[actId] && ACT[actId][ref]) {
            entry = ACT[actId][ref];
        } else if (MAIN[ref]) {
            entry = MAIN[ref];
        }
        if (!entry) return '';
        return entry[lang] || entry.ru || entry.en || '';
    }

    function actName(id) {
        var entry = ACT[id] && ACT[id][1];
        if (!entry) return '#' + id;
        return entry[lang] || entry.ru || entry.en || ('#' + id);
    }

    function themeLabel(themeKey) {
        var map = {
            animals: 'themeAnimals',
            outdoors: 'themeOutdoors',
            sports: 'themeSports',
            food: 'themeFood'
        };
        return ui(map[themeKey] || 'filterAll');
    }

    function pluralRu(n, forms) {
        var n10 = n % 10;
        var n100 = n % 100;
        if (n10 === 1 && n100 !== 11) return forms[0];
        if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
        return forms[2];
    }

    function tasksLabel(n) {
        if (lang === 'en') return n + (n === 1 ? ' task' : ' tasks');
        return n + ' ' + pluralRu(n, ['задание', 'задания', 'заданий']);
    }

    function toast(message) {
        var node = el.toast;
        if (!node) return;
        node.textContent = message;
        node.classList.add('is-visible');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            node.classList.remove('is-visible');
        }, 2200);
    }

    function setProgress(percent) {
        var fill = el.progressFill;
        if (!fill) return;
        if (percent < progressShown) percent = progressShown;
        progressShown = Math.min(100, Math.max(0, percent));
        fill.style.width = progressShown + '%';
    }

    /* ---------- Задания ---------- */

    function tasksOf(activityId) {
        if (tasksCache[activityId]) return tasksCache[activityId];
        var list = [];
        var activity = DATA[activityId];
        if (activity && activity.lessons) {
            activity.lessons.forEach(function (lesson, lessonIndex) {
                (lesson.tasks || []).forEach(function (task, taskIndex) {
                    list.push({ task: task, lesson: lessonIndex, index: taskIndex });
                });
            });
        }
        tasksCache[activityId] = list;
        return list;
    }

    function taskKey(activityId, lessonIndex, taskIndex) {
        return activityId + ':' + lessonIndex + ':' + taskIndex;
    }

    function currentEntry() {
        var list = tasksOf(state.activityId);
        return list[state.taskIndex] || null;
    }

    function currentKey() {
        var entry = currentEntry();
        if (!entry) return null;
        return taskKey(state.activityId, entry.lesson, entry.index);
    }

    function isTaskDone(key) {
        return !!doneMap[key];
    }

    function doneCount(activityId) {
        var list = tasksOf(activityId);
        var count = 0;
        for (var i = 0; i < list.length; i++) {
            var key = taskKey(activityId, list[i].lesson, list[i].index);
            if (doneMap[key]) count++;
        }
        return count;
    }

    function totalStats() {
        var total = 0;
        var done = 0;
        var activitiesDone = 0;
        for (var i = 0; i < ACTIVITIES.length; i++) {
            var id = ACTIVITIES[i].id;
            var list = tasksOf(id);
            total += list.length;
            var dc = doneCount(id);
            done += dc;
            if (list.length && dc === list.length) activitiesDone++;
        }
        return { total: total, done: done, activities: activitiesDone, activitiesTotal: ACTIVITIES.length };
    }

    function allInputsFilled(key, entry) {
        var groups = entry.task.answers || [];
        var inputs = 0;
        var filled = 0;
        for (var g = 0; g < groups.length; g++) {
            for (var i = 0; i < groups[g].length; i++) {
                if (groups[g][i].t !== 'input') continue;
                inputs++;
                var value = (answers[key] || [])[inputs - 1];
                if (value !== undefined && String(value).trim() !== '') filled++;
            }
        }
        return inputs > 0 && filled === inputs;
    }

    /* ---------- Экраны и разделы ---------- */

    function showScreen(name) {
        if (!el.loader || !el.lobby || !el.activity) return;
        el.loader.classList.remove('is-active');
        el.lobby.classList.toggle('is-active', name === 'lobby');
        el.activity.classList.toggle('is-active', name === 'activity');
        document.body.scrollTop = 0;
    }

    function showSection(section) {
        state.section = section;
        var sections = document.querySelectorAll('.section');
        for (var i = 0; i < sections.length; i++) {
            sections[i].classList.toggle('is-active', sections[i].id === 'section-' + section);
        }
        var items = document.querySelectorAll('.nav-item');
        for (var j = 0; j < items.length; j++) {
            items[j].classList.toggle('is-active', items[j].getAttribute('data-section') === section);
        }
        if (el.content) el.content.scrollTop = 0;
    }

    /* ---------- Лобби ---------- */

    function renderChips() {
        var box = el.themeChips;
        if (!box) return;
        box.innerHTML = '';
        var options = [{ key: 'all', label: ui('filterAll') }];
        THEME_KEYS.forEach(function (key) {
            options.push({ key: key, label: themeLabel(key) });
        });

        options.forEach(function (opt) {
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chip' + (state.filter === opt.key ? ' is-active' : '');
            chip.textContent = opt.label;
            chip.setAttribute('data-filter', opt.key);
            chip.addEventListener('click', function () {
                state.filter = opt.key;
                renderChips();
                renderActivityGrid();
            });
            box.appendChild(chip);
        });
    }

    function renderActivityGrid() {
        var grid = el.activityGrid;
        if (!grid) return;
        grid.innerHTML = '';

        var visible = ACTIVITIES.filter(function (activity) {
            if (state.filter === 'all') return true;
            return THEME_OF[activity.id] === state.filter;
        });

        visible.forEach(function (activity) {
            grid.appendChild(createActivityCard(activity));
        });
    }

    function createActivityCard(activity) {
        var id = activity.id;
        var list = tasksOf(id);
        var total = list.length;
        var done = doneCount(id);
        var percent = total ? Math.round((done / total) * 100) : 0;
        var meta = DATA[id] || {};
        var cover = IMG[meta.cover];

        var card = document.createElement('article');
        card.className = 'activity-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-id', id);
        card.setAttribute('aria-label', actName(id) + ' — ' + tasksLabel(total));

        var coverBox = document.createElement('div');
        coverBox.className = 'card-cover';
        if (cover) {
            var img = document.createElement('img');
            img.src = cover;
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            coverBox.appendChild(img);
        } else {
            var fallback = document.createElement('div');
            fallback.className = 'card-cover-fallback';
            fallback.textContent = activity.theme || '🧱';
            coverBox.appendChild(fallback);
        }

        var themeBadge = document.createElement('span');
        themeBadge.className = 'card-badge';
        themeBadge.textContent = themeLabel(THEME_OF[id]);
        coverBox.appendChild(themeBadge);

        if (total && done === total) {
            var doneBadge = document.createElement('span');
            doneBadge.className = 'card-badge done';
            doneBadge.textContent = '✓ ' + ui('completed');
            coverBox.appendChild(doneBadge);
        }

        var body = document.createElement('div');
        body.className = 'card-body';

        var title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = actName(id);

        var metaRow = document.createElement('div');
        metaRow.className = 'card-meta';
        var left = document.createElement('span');
        left.textContent = tasksLabel(total);
        var right = document.createElement('span');
        right.textContent = done + ' / ' + total;
        metaRow.appendChild(left);
        metaRow.appendChild(right);

        var bar = document.createElement('div');
        bar.className = 'card-progress';
        var fill = document.createElement('span');
        fill.style.width = percent + '%';
        if (percent === 100) fill.className = 'full';
        bar.appendChild(fill);

        body.appendChild(title);
        body.appendChild(metaRow);
        body.appendChild(bar);

        card.appendChild(coverBox);
        card.appendChild(body);

        card.addEventListener('click', function () {
            openActivity(id, 0);
        });
        card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openActivity(id, 0);
            }
        });

        return card;
    }

    function renderLobby() {
        renderChips();
        renderActivityGrid();
    }

    /* ---------- Активность ---------- */

    function openActivity(id, taskIndex) {
        var list = tasksOf(id);
        if (!list.length) return;
        state.activityId = id;
        state.taskIndex = Math.min(Math.max(taskIndex || 0, 0), list.length - 1);
        stopSpeaking();
        showScreen('activity');
        renderActivity();
    }

    function renderActivity() {
        var id = state.activityId;
        var list = tasksOf(id);
        var entry = list[state.taskIndex];
        if (!entry) {
            showScreen('lobby');
            renderLobby();
            return;
        }

        var task = entry.task;
        var key = taskKey(id, entry.lesson, entry.index);

        /* Шапка */
        el.activityTitle.textContent = actName(id);
        el.activitySub.textContent = ui('lesson') + ' ' + (entry.lesson + 1) + ' · ' +
            ui('task') + ' ' + (state.taskIndex + 1) + ' ' + ui('of') + ' ' + list.length;

        /* Диалог */
        el.dialogueAvatar.innerHTML = '';
        var avatarUrl = IMG[task.img];
        if (avatarUrl) {
            var avatarImg = document.createElement('img');
            avatarImg.src = avatarUrl;
            avatarImg.alt = '';
            el.dialogueAvatar.appendChild(avatarImg);
        } else {
            el.dialogueAvatar.textContent = '💬';
        }
        el.dialogueText.textContent = tr(task.dialogue, id) || ui('noDialogue');

        /* Образец */
        el.referenceImages.innerHTML = '';
        var overlays = (task.overlay || []).filter(function (item) {
            return item && IMG[item.ref];
        });
        if (overlays.length) {
            overlays.forEach(function (item) {
                var thumb = document.createElement('button');
                thumb.type = 'button';
                thumb.className = 'reference-thumb';
                thumb.title = ui('reference');
                var img = document.createElement('img');
                img.src = IMG[item.ref];
                img.alt = '';
                img.loading = 'lazy';
                thumb.appendChild(img);
                thumb.addEventListener('click', function () {
                    openImage(IMG[item.ref]);
                });
                el.referenceImages.appendChild(thumb);
            });
        } else {
            var empty = document.createElement('p');
            empty.className = 'reference-empty';
            empty.textContent = ui('noReference');
            el.referenceImages.appendChild(empty);
        }

        /* Поля ответа */
        renderAnswers(task, key);

        /* Кнопки */
        el.btnPrev.disabled = state.taskIndex === 0;
        el.btnNext.disabled = state.taskIndex >= list.length - 1;
        renderDoneButton();
        updateActivityProgress();
        renderSettingsSummary();
    }

    function renderAnswers(task, key) {
        var box = el.answerGroups;
        box.innerHTML = '';
        var groups = task.answers || [];

        if (el.answerHint) el.answerHint.classList.toggle('is-hidden', !groups.length);

        if (!groups.length) {
            var empty = document.createElement('div');
            empty.className = 'answer-empty';
            var icon = document.createElement('div');
            icon.className = 'big';
            icon.textContent = '🧱';
            var text = document.createElement('p');
            text.textContent = ui('noAnswers');
            empty.appendChild(icon);
            empty.appendChild(text);
            box.appendChild(empty);
            return;
        }

        var inputIndex = 0;
        var saved = answers[key] || [];

        groups.forEach(function (group) {
            var row = document.createElement('div');
            row.className = 'answer-group';

            group.forEach(function (item) {
                if (item.t === 'input') {
                    var index = inputIndex++;
                    var input = document.createElement('input');
                    input.className = 'answer-input';
                    input.type = 'text';
                    input.inputMode = 'decimal';
                    input.autocomplete = 'off';
                    input.setAttribute('aria-label', ui('answerLabel') + ' ' + (index + 1));
                    input.value = saved[index] === undefined ? '' : saved[index];
                    input.addEventListener('input', function () {
                        var arr = answers[key] || (answers[key] = []);
                        arr[index] = input.value;
                        writeStore(STORAGE.answers, answers);
                    });
                    input.addEventListener('keydown', function (event) {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            goNext();
                        }
                    });
                    row.appendChild(input);
                } else if (item.t === 'label') {
                    var label = document.createElement('span');
                    label.className = 'answer-label';
                    label.textContent = tr(item.ref, state.activityId);
                    row.appendChild(label);
                } else if (item.t === 'img') {
                    var url = IMG[item.ref];
                    if (!url) return;
                    var icon = document.createElement('img');
                    icon.className = 'answer-icon';
                    icon.src = url;
                    icon.alt = '';
                    icon.loading = 'lazy';
                    row.appendChild(icon);
                }
            });

            box.appendChild(row);
        });
    }

    function renderDoneButton() {
        var key = currentKey();
        var isDone = key ? isTaskDone(key) : false;
        el.btnDone.classList.toggle('is-done', isDone);
        var label = el.btnDone.querySelector('[data-i18n]');
        if (label) label.textContent = isDone ? ui('doneShort') : ui('done');
        el.btnDone.setAttribute('aria-pressed', isDone ? 'true' : 'false');
    }

    function updateActivityProgress() {
        if (!state.activityId) return;
        var list = tasksOf(state.activityId);
        var done = doneCount(state.activityId);
        var percent = list.length ? Math.round((done / list.length) * 100) : 0;
        if (el.activityProgressFill) el.activityProgressFill.style.width = percent + '%';
    }

    function goPrev() {
        if (state.taskIndex <= 0) return;
        state.taskIndex--;
        stopSpeaking();
        renderActivity();
    }

    function goNext() {
        var list = tasksOf(state.activityId);
        if (state.taskIndex >= list.length - 1) {
            var entry = currentEntry();
            if (entry && isTaskDone(currentKey())) {
                toast(ui('allDone'));
            } else {
                toast(ui('lastTask'));
            }
            return;
        }
        var entry = currentEntry();
        var key = currentKey();
        if (entry && !isTaskDone(key) && allInputsFilled(key, entry)) {
            doneMap[key] = true;
            writeStore(STORAGE.done, doneMap);
        }
        state.taskIndex++;
        stopSpeaking();
        renderActivity();
    }

    function toggleDone() {
        var key = currentKey();
        if (!key) return;
        doneMap[key] = !doneMap[key];
        if (!doneMap[key]) delete doneMap[key];
        writeStore(STORAGE.done, doneMap);
        renderDoneButton();
        updateActivityProgress();
        renderSettingsSummary();
        toast(doneMap[key] ? ui('markedDone') : ui('unmarkedDone'));
    }

    /* ---------- Озвучивание ---------- */

    function speakCurrent() {
        var entry = currentEntry();
        if (!entry) return;
        var text = tr(entry.task.dialogue, state.activityId);
        if (!text) return;
        if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
            toast(ui('speakUnsupported'));
            return;
        }
        try {
            window.speechSynthesis.cancel();
            var utterance = new window.SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'en' ? 'en-US' : 'ru-RU';
            utterance.rate = 0.95;
            utterance.onstart = function () {
                speaking = true;
                el.btnSpeak.classList.add('speaking');
            };
            utterance.onend = utterance.onerror = function () {
                speaking = false;
                el.btnSpeak.classList.remove('speaking');
            };
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            toast(ui('speakUnsupported'));
        }
    }

    function stopSpeaking() {
        if (speaking && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) { /* ignore */ }
        }
        speaking = false;
        if (el.btnSpeak) el.btnSpeak.classList.remove('speaking');
    }

    /* ---------- Картинка ---------- */

    function openImage(src) {
        if (!src || !el.modal) return;
        el.modalImg.src = src;
        el.modal.classList.add('is-open');
    }

    function closeImage() {
        if (!el.modal) return;
        el.modal.classList.remove('is-open');
        el.modalImg.src = '';
    }

    /* ---------- Настройки ---------- */

    function renderSettingsSummary() {
        if (!el.progressSummary) return;
        var stats = totalStats();
        el.progressSummary.textContent = ui('progressLine')(stats.done, stats.total, stats.activities, stats.activitiesTotal);
    }

    function resetProgress() {
        if (!window.confirm(ui('resetConfirm'))) return;
        answers = {};
        doneMap = {};
        writeStore(STORAGE.answers, answers);
        writeStore(STORAGE.done, doneMap);
        renderLobby();
        renderSettingsSummary();
        if (state.activityId && el.activity.classList.contains('is-active')) {
            renderActivity();
        }
        toast(ui('resetDone'));
    }

    /* ---------- Язык ---------- */

    function applyStaticTexts() {
        var nodes = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < nodes.length; i++) {
            var key = nodes[i].getAttribute('data-i18n');
            nodes[i].textContent = ui(key);
        }
    }

    function applyLangButtons() {
        var buttons = document.querySelectorAll('.lang-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.toggle('is-active', buttons[i].getAttribute('data-lang') === lang);
        }
    }

    function setLang(next) {
        lang = next === 'en' ? 'en' : 'ru';
        if (typeof TR.setLang === 'function') TR.setLang(lang);
        try {
            window.localStorage.setItem(STORAGE.lang, lang);
        } catch (e) { /* приватный режим — язык не сохранится */ }
        document.documentElement.lang = lang;
        applyStaticTexts();
        applyLangButtons();
        renderLobby();
        renderSettingsSummary();
        if (state.activityId && el.activity.classList.contains('is-active')) {
            renderActivity();
        }
        if (el.loaderText) el.loaderText.textContent = ui('loading');
    }

    function readLang() {
        var stored = null;
        try {
            stored = window.localStorage.getItem(STORAGE.lang);
            if (stored && stored.charAt(0) === '"') stored = safeParse(stored, null);
        } catch (e) {
            stored = null;
        }
        return stored === 'en' ? 'en' : 'ru';
    }

    /* ---------- Загрузка картинок ---------- */

    function preload(urls, timeoutMs) {
        return new Promise(function (resolve) {
            var total = urls.length;
            var loaded = 0;
            var finished = false;

            function finish() {
                if (finished) return;
                finished = true;
                resolve();
            }

            if (!total) {
                setProgress(100);
                finish();
                return;
            }

            var timer = setTimeout(finish, timeoutMs);

            urls.forEach(function (url) {
                var img = new Image();
                img.onload = img.onerror = function () {
                    loaded++;
                    setProgress((loaded / total) * 100);
                    if (loaded >= total) {
                        clearTimeout(timer);
                        finish();
                    }
                };
                img.src = url;
            });
        });
    }

    /* ---------- События ---------- */

    function bindEvents() {
        /* Навигация по разделам */
        var navItems = document.querySelectorAll('.nav-item');
        for (var i = 0; i < navItems.length; i++) {
            (function (item) {
                item.addEventListener('click', function () {
                    showSection(item.getAttribute('data-section'));
                });
            })(navItems[i]);
        }

        var gotoButtons = document.querySelectorAll('[data-goto]');
        for (var g = 0; g < gotoButtons.length; g++) {
            (function (button) {
                button.addEventListener('click', function () {
                    showSection(button.getAttribute('data-goto'));
                });
            })(gotoButtons[g]);
        }

        /* Язык */
        document.addEventListener('click', function (event) {
            var button = event.target.closest ? event.target.closest('.lang-btn') : null;
            if (!button) return;
            var next = button.getAttribute('data-lang');
            if (next && next !== lang) setLang(next);
        });

        /* Активность */
        el.btnBack.addEventListener('click', function () {
            stopSpeaking();
            showScreen('lobby');
            renderLobby();
            renderSettingsSummary();
        });

        el.btnPrev.addEventListener('click', goPrev);
        el.btnNext.addEventListener('click', goNext);
        el.btnRepeat.addEventListener('click', speakCurrent);
        el.btnSpeak.addEventListener('click', speakCurrent);
        el.btnDone.addEventListener('click', toggleDone);

        /* Модальное окно */
        if (el.modalClose) el.modalClose.addEventListener('click', closeImage);
        if (el.modal) {
            el.modal.addEventListener('click', function (event) {
                if (event.target === el.modal) closeImage();
            });
        }

        /* Сброс прогресса */
        if (el.btnReset) el.btnReset.addEventListener('click', resetProgress);

        /* Клавиатура */
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeImage();
                return;
            }
            if (!el.activity.classList.contains('is-active')) return;
            var tag = (event.target && event.target.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrev();
            }
        });
    }

    /* ---------- Запуск ---------- */

    function cacheElements() {
        el.loader = byId('loader');
        el.lobby = byId('lobby');
        el.activity = byId('activity');
        el.progressFill = byId('progress-fill');
        el.content = document.querySelector('.content');
        el.themeChips = byId('theme-chips');
        el.activityGrid = byId('activity-grid');
        el.activityTitle = byId('activity-title');
        el.activitySub = byId('activity-sub');
        el.activityProgressFill = byId('activity-progress-fill');
        el.dialogueAvatar = byId('dialogue-avatar');
        el.dialogueText = byId('dialogue-text');
        el.referenceImages = byId('reference-images');
        el.answerGroups = byId('answer-groups');
        el.answerHint = byId('answer-hint');
        el.btnBack = byId('btn-back');
        el.btnPrev = byId('btn-prev');
        el.btnNext = byId('btn-next');
        el.btnRepeat = byId('btn-repeat');
        el.btnSpeak = byId('btn-speak');
        el.btnDone = byId('btn-done');
        el.btnReset = byId('btn-reset');
        el.progressSummary = byId('progress-summary');
        el.modal = byId('image-modal');
        el.modalImg = byId('modal-img');
        el.modalClose = byId('modal-close');
        el.toast = byId('toast');
        el.loaderText = document.querySelector('.loader-sub');
    }

    function boot() {
        cacheElements();

        lang = readLang();
        if (typeof TR.setLang === 'function') TR.setLang(lang);
        answers = readStore(STORAGE.answers, {});
        doneMap = readStore(STORAGE.done, {});
        if (!answers || typeof answers !== 'object') answers = {};
        if (!doneMap || typeof doneMap !== 'object') doneMap = {};

        document.documentElement.lang = lang;
        applyStaticTexts();
        applyLangButtons();
        bindEvents();
        renderLobby();
        renderSettingsSummary();

        /* Предзагрузка обложек активностей */
        var covers = [];
        ACTIVITIES.forEach(function (activity) {
            var meta = DATA[activity.id];
            var url = meta && IMG[meta.cover];
            if (url) covers.push(url);
        });

        var started = Date.now();
        preload(covers, 2500).then(function () {
            var delay = Math.max(0, 500 - (Date.now() - started));
            setTimeout(showLobby, delay);
        });

        /* Страховка: экран загрузки не должен висеть никогда */
        setTimeout(showLobby, 4000);
    }

    function showLobby() {
        if (lobbyShown) return;
        lobbyShown = true;
        setProgress(100);
        setTimeout(function () {
            showScreen('lobby');
            renderLobby();
        }, 180);
    }

    /* Запуск после загрузки DOM */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            try {
                boot();
            } catch (error) {
                showLobby();
                if (window.console && console.error) console.error(error);
            }
        });
    } else {
        try {
            boot();
        } catch (error) {
            showLobby();
            if (window.console && console.error) console.error(error);
        }
    }
})();
