// Enum для статусов задачи
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Active"] = "ACTIVE";
    TaskStatus["Completed"] = "COMPLETED";
})(TaskStatus || (TaskStatus = {}));
// Класс, реализующий интерфейс Task
var TaskItem = /** @class */ (function () {
    function TaskItem(id, title, description, dueDate, isCompleted) {
        if (isCompleted === void 0) { isCompleted = false; }
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.isCompleted = isCompleted;
    }
    // Метод для отметки задачи как выполненной
    TaskItem.prototype.markAsCompleted = function () {
        this.isCompleted = true;
        console.log("\u0417\u0430\u0434\u0430\u0447\u0430 \"".concat(this.title, "\" \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u0430 \u043A\u0430\u043A \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u0430\u044F"));
    };
    // Метод для отметки задачи как активной
    TaskItem.prototype.markAsActive = function () {
        this.isCompleted = false;
        console.log("\u0417\u0430\u0434\u0430\u0447\u0430 \"".concat(this.title, "\" \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u0430 \u043A\u0430\u043A \u0430\u043A\u0442\u0438\u0432\u043D\u0430\u044F"));
    };
    // Метод для переключения статуса выполнения
    TaskItem.prototype.toggleCompletion = function () {
        this.isCompleted = !this.isCompleted;
        var status = this.isCompleted ? "выполнена" : "активна";
        console.log("\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u0434\u0430\u0447\u0438 \"".concat(this.title, "\" \u0438\u0437\u043C\u0435\u043D\u0435\u043D: ").concat(status));
    };
    // Метод для получения количества дней до выполнения
    TaskItem.prototype.getDaysRemaining = function () {
        var today = new Date();
        var dueDate = new Date(this.dueDate);
        var diffTime = dueDate.getTime() - today.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    // Дополнительный метод для получения форматированной даты
    TaskItem.prototype.getFormattedDueDate = function () {
        return this.dueDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    // Дополнительный метод для получения информации о задаче
    TaskItem.prototype.getTaskInfo = function () {
        var status = this.isCompleted ? "Выполнена" : "Активна";
        var daysRemaining = this.getDaysRemaining();
        var daysText = daysRemaining > 0 ? "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0434\u043D\u0435\u0439: ".concat(daysRemaining) :
            daysRemaining === 0 ? "Срок сегодня" : "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E \u043D\u0430 ".concat(Math.abs(daysRemaining), " \u0434\u043D\u0435\u0439");
        return "\u0417\u0430\u0434\u0430\u0447\u0430: ".concat(this.title, "\n\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435: ").concat(this.description, "\n\u0421\u0442\u0430\u0442\u0443\u0441: ").concat(status, "\n\u0421\u0440\u043E\u043A: ").concat(this.getFormattedDueDate(), "\n").concat(daysText);
    };
    return TaskItem;
}());
// Класс для управления списком задач
var TaskManager = /** @class */ (function () {
    function TaskManager() {
        this.tasks = [];
        this.currentFilter = 'all';
    }
    // Метод для добавления новой задачи
    TaskManager.prototype.addTask = function (title, description, dueDate) {
        var newTask = new TaskItem(Date.now(), // Генерируем ID на основе текущего времени
        title, description, dueDate);
        this.tasks.push(newTask);
        console.log("\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u043D\u043E\u0432\u0430\u044F \u0437\u0430\u0434\u0430\u0447\u0430: \"".concat(title, "\""));
        this.renderTasks();
    };
    // Метод для удаления задачи
    TaskManager.prototype.deleteTask = function (id) {
        var taskIndex = this.tasks.findIndex(function (task) { return task.id === id; });
        if (taskIndex !== -1) {
            var taskTitle = this.tasks[taskIndex].title;
            this.tasks.splice(taskIndex, 1);
            console.log("\u0417\u0430\u0434\u0430\u0447\u0430 \"".concat(taskTitle, "\" \u0443\u0434\u0430\u043B\u0435\u043D\u0430"));
            this.renderTasks();
        }
    };
    // Метод для получения задачи по ID
    TaskManager.prototype.getTaskById = function (id) {
        return this.tasks.find(function (task) { return task.id === id; });
    };
    // Метод для получения всех задач
    TaskManager.prototype.getAllTasks = function () {
        return this.tasks;
    };
    // Метод для получения активных задач
    TaskManager.prototype.getActiveTasks = function () {
        return this.tasks.filter(function (task) { return !task.isCompleted; });
    };
    // Метод для получения выполненных задач
    TaskManager.prototype.getCompletedTasks = function () {
        return this.tasks.filter(function (task) { return task.isCompleted; });
    };
    // Метод для фильтрации задач
    TaskManager.prototype.setFilter = function (filter) {
        this.currentFilter = filter;
        this.renderTasks();
    };
    // Метод для обновления статистики
    TaskManager.prototype.updateStats = function () {
        var totalTasks = this.tasks.length;
        var activeTasks = this.getActiveTasks().length;
        var completedTasks = this.getCompletedTasks().length;
        var totalTasksElement = document.getElementById('totalTasks');
        var activeTasksElement = document.getElementById('activeTasks');
        var completedTasksElement = document.getElementById('completedTasks');
        if (totalTasksElement)
            totalTasksElement.textContent = totalTasks.toString();
        if (activeTasksElement)
            activeTasksElement.textContent = activeTasks.toString();
        if (completedTasksElement)
            completedTasksElement.textContent = completedTasks.toString();
    };
    // Метод для отображения задач в DOM
    TaskManager.prototype.renderTasks = function () {
        var tasksListElement = document.getElementById('tasksList');
        var noTasksMessage = document.getElementById('noTasksMessage');
        if (!tasksListElement || !noTasksMessage)
            return;
        // Очищаем список задач
        tasksListElement.innerHTML = '';
        // Получаем задачи в зависимости от фильтра
        var tasksToShow;
        switch (this.currentFilter) {
            case 'active':
                tasksToShow = this.getActiveTasks();
                break;
            case 'completed':
                tasksToShow = this.getCompletedTasks();
                break;
            default:
                tasksToShow = this.getAllTasks();
        }
        // Обновляем статистику
        this.updateStats();
        // Если задач нет, показываем сообщение
        if (tasksToShow.length === 0) {
            noTasksMessage.style.display = 'block';
            return;
        }
        noTasksMessage.style.display = 'none';
        // Отображаем задачи
        tasksToShow.forEach(function (task) {
            var taskElement = document.createElement('div');
            taskElement.className = "task-item ".concat(task.isCompleted ? 'completed' : '');
            taskElement.innerHTML = "\n                <div class=\"task-header\">\n                    <h3 class=\"task-title\">".concat(task.title, "</h3>\n                    <div class=\"task-due-date\">\n                        <i class=\"far fa-calendar-alt\"></i> ").concat(task.getFormattedDueDate(), "\n                    </div>\n                </div>\n                <p class=\"task-description\">").concat(task.description, "</p>\n                <div class=\"task-actions\">\n                    ").concat(task.isCompleted ?
                "<button class=\"btn-action btn-undo\" data-id=\"".concat(task.id, "\">\n                            <i class=\"fas fa-undo\"></i> \u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0432 \u0440\u0430\u0431\u043E\u0442\u0443\n                        </button>") :
                "<button class=\"btn-action btn-complete\" data-id=\"".concat(task.id, "\">\n                            <i class=\"fas fa-check\"></i> \u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C\n                        </button>"), "\n                    <button class=\"btn-action btn-delete\" data-id=\"").concat(task.id, "\">\n                        <i class=\"fas fa-trash\"></i> \u0423\u0434\u0430\u043B\u0438\u0442\u044C\n                    </button>\n                </div>\n            ");
            tasksListElement.appendChild(taskElement);
        });
        // Добавляем обработчики событий для кнопок
        this.addTaskEventListeners();
    };
    // Метод для добавления обработчиков событий
    TaskManager.prototype.addTaskEventListeners = function () {
        var _this = this;
        // Обработчики для кнопок "Выполнить"
        document.querySelectorAll('.btn-complete').forEach(function (button) {
            button.addEventListener('click', function (e) {
                var taskId = Number(e.currentTarget.getAttribute('data-id'));
                var task = _this.getTaskById(taskId);
                if (task) {
                    task.markAsCompleted();
                    _this.renderTasks();
                }
            });
        });
        // Обработчики для кнопок "Вернуть в работу"
        document.querySelectorAll('.btn-undo').forEach(function (button) {
            button.addEventListener('click', function (e) {
                var taskId = Number(e.currentTarget.getAttribute('data-id'));
                var task = _this.getTaskById(taskId);
                if (task) {
                    task.markAsActive();
                    _this.renderTasks();
                }
            });
        });
        // Обработчики для кнопок "Удалить"
        document.querySelectorAll('.btn-delete').forEach(function (button) {
            button.addEventListener('click', function (e) {
                var taskId = Number(e.currentTarget.getAttribute('data-id'));
                _this.deleteTask(taskId);
            });
        });
    };
    // Метод для инициализации менеджера задач
    TaskManager.prototype.initialize = function () {
        var _this = this;
        // Добавляем тестовые задачи
        this.addTask("Изучить TypeScript", "Освоить базовые типы, интерфейсы и классы в TypeScript", new Date(new Date().setDate(new Date().getDate() + 7)));
        this.addTask("Сделать практическую работу", "Выполнить практическую работу по TypeScript, вариант 10", new Date(new Date().setDate(new Date().getDate() + 3)));
        this.addTask("Настроить проект", "Настроить TypeScript компиляцию и создать файловую структуру", new Date());
        // Помечаем одну задачу как выполненную
        var firstTask = this.tasks[0];
        if (firstTask) {
            firstTask.markAsCompleted();
        }
        // Инициализируем рендеринг задач
        this.renderTasks();
        // Добавляем обработчики событий для фильтров
        document.querySelectorAll('.btn-filter').forEach(function (button) {
            button.addEventListener('click', function (e) {
                var filter = e.currentTarget.getAttribute('data-filter');
                if (filter) {
                    // Удаляем активный класс у всех кнопок
                    document.querySelectorAll('.btn-filter').forEach(function (btn) {
                        btn.classList.remove('active');
                    });
                    // Добавляем активный класс текущей кнопке
                    e.currentTarget.classList.add('active');
                    // Устанавливаем фильтр
                    _this.setFilter(filter);
                }
            });
        });
    };
    return TaskManager;
}());
// Инициализация приложения
document.addEventListener('DOMContentLoaded', function () {
    // Создаем экземпляр менеджера задач
    var taskManager = new TaskManager();
    // Инициализируем менеджер задач
    taskManager.initialize();
    // Обработчик формы для добавления новой задачи
    var taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // Получаем значения из формы
            var titleInput = document.getElementById('title');
            var descriptionInput = document.getElementById('description');
            var dueDateInput = document.getElementById('dueDate');
            var title = titleInput.value.trim();
            var description = descriptionInput.value.trim();
            var dueDate = new Date(dueDateInput.value);
            // Валидация
            if (!title || !dueDateInput.value) {
                alert('Пожалуйста, заполните обязательные поля: название задачи и срок выполнения');
                return;
            }
            if (dueDate < new Date()) {
                if (!confirm('Выбранная дата уже прошла. Все равно добавить задачу?')) {
                    return;
                }
            }
            // Добавляем задачу
            taskManager.addTask(title, description, dueDate);
            // Сбрасываем форму
            taskForm.reset();
            // Устанавливаем минимальную дату как сегодняшнюю
            var today = new Date().toISOString().split('T')[0];
            dueDateInput.min = today;
        });
    }
    // Устанавливаем минимальную дату как сегодняшнюю для поля срока выполнения
    var dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        var today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
        // Устанавливаем значение по умолчанию (через 3 дня)
        var defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        dueDateInput.value = defaultDate.toISOString().split('T')[0];
    }
    // Логирование информации о типах TypeScript (для демонстрации)
    console.log("=== ДЕМОНСТРАЦИЯ ТИПОВ TypeScript ===");
    // Базовые типы
    var userName = "Иван";
    var userAge = 25;
    var isActive = true;
    var hobbies = ["чтение", "программирование", "спорт"];
    var userTuple = ["Иван", 25];
    console.log("Базовые типы:");
    console.log("userName (string): ".concat(userName));
    console.log("userAge (number): ".concat(userAge));
    console.log("isActive (boolean): ".concat(isActive));
    console.log("hobbies (string[]): ".concat(hobbies.join(", ")));
    console.log("userTuple (tuple): [".concat(userTuple[0], ", ").concat(userTuple[1], "]"));
    // Enum
    var UserRole;
    (function (UserRole) {
        UserRole["Admin"] = "ADMIN";
        UserRole["User"] = "USER";
        UserRole["Moderator"] = "MODERATOR";
    })(UserRole || (UserRole = {}));
    console.log("\nEnum UserRole.Admin: ".concat(UserRole.Admin));
});
