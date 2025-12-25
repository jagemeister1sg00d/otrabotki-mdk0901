// Enum для статусов задачи
enum TaskStatus {
    Active = "ACTIVE",
    Completed = "COMPLETED"
}

// Интерфейс Task согласно индивидуальному заданию (вариант 10)
interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: Date;
    isCompleted: boolean;
    
    // Методы для отметки выполнения
    markAsCompleted(): void;
    markAsActive(): void;
    toggleCompletion(): void;
    getDaysRemaining(): number;
}

// Класс, реализующий интерфейс Task
class TaskItem implements Task {
    id: number;
    title: string;
    description: string;
    dueDate: Date;
    isCompleted: boolean;

    constructor(id: number, title: string, description: string, dueDate: Date, isCompleted: boolean = false) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.isCompleted = isCompleted;
    }

    // Метод для отметки задачи как выполненной
    markAsCompleted(): void {
        this.isCompleted = true;
        console.log(`Задача "${this.title}" отмечена как выполненная`);
    }

    // Метод для отметки задачи как активной
    markAsActive(): void {
        this.isCompleted = false;
        console.log(`Задача "${this.title}" отмечена как активная`);
    }

    // Метод для переключения статуса выполнения
    toggleCompletion(): void {
        this.isCompleted = !this.isCompleted;
        const status = this.isCompleted ? "выполнена" : "активна";
        console.log(`Статус задачи "${this.title}" изменен: ${status}`);
    }

    // Метод для получения количества дней до выполнения
    getDaysRemaining(): number {
        const today = new Date();
        const dueDate = new Date(this.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Дополнительный метод для получения форматированной даты
    getFormattedDueDate(): string {
        return this.dueDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Дополнительный метод для получения информации о задаче
    getTaskInfo(): string {
        const status = this.isCompleted ? "Выполнена" : "Активна";
        const daysRemaining = this.getDaysRemaining();
        const daysText = daysRemaining > 0 ? `Осталось дней: ${daysRemaining}` : 
                        daysRemaining === 0 ? "Срок сегодня" : `Просрочено на ${Math.abs(daysRemaining)} дней`;
        
        return `Задача: ${this.title}\nОписание: ${this.description}\nСтатус: ${status}\nСрок: ${this.getFormattedDueDate()}\n${daysText}`;
    }
}

// Класс для управления списком задач
class TaskManager {
    private tasks: TaskItem[] = [];
    private currentFilter: string = 'all';

    // Метод для добавления новой задачи
    addTask(title: string, description: string, dueDate: Date): void {
        const newTask = new TaskItem(
            Date.now(), // Генерируем ID на основе текущего времени
            title,
            description,
            dueDate
        );
        this.tasks.push(newTask);
        console.log(`Добавлена новая задача: "${title}"`);
        this.renderTasks();
    }

    // Метод для удаления задачи
    deleteTask(id: number): void {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const taskTitle = this.tasks[taskIndex].title;
            this.tasks.splice(taskIndex, 1);
            console.log(`Задача "${taskTitle}" удалена`);
            this.renderTasks();
        }
    }

    // Метод для получения задачи по ID
    getTaskById(id: number): TaskItem | undefined {
        return this.tasks.find(task => task.id === id);
    }

    // Метод для получения всех задач
    getAllTasks(): TaskItem[] {
        return this.tasks;
    }

    // Метод для получения активных задач
    getActiveTasks(): TaskItem[] {
        return this.tasks.filter(task => !task.isCompleted);
    }

    // Метод для получения выполненных задач
    getCompletedTasks(): TaskItem[] {
        return this.tasks.filter(task => task.isCompleted);
    }

    // Метод для фильтрации задач
    setFilter(filter: string): void {
        this.currentFilter = filter;
        this.renderTasks();
    }

    // Метод для обновления статистики
    updateStats(): void {
        const totalTasks = this.tasks.length;
        const activeTasks = this.getActiveTasks().length;
        const completedTasks = this.getCompletedTasks().length;

        const totalTasksElement = document.getElementById('totalTasks');
        const activeTasksElement = document.getElementById('activeTasks');
        const completedTasksElement = document.getElementById('completedTasks');

        if (totalTasksElement) totalTasksElement.textContent = totalTasks.toString();
        if (activeTasksElement) activeTasksElement.textContent = activeTasks.toString();
        if (completedTasksElement) completedTasksElement.textContent = completedTasks.toString();
    }

    // Метод для отображения задач в DOM
    renderTasks(): void {
        const tasksListElement = document.getElementById('tasksList');
        const noTasksMessage = document.getElementById('noTasksMessage');
        
        if (!tasksListElement || !noTasksMessage) return;

        // Очищаем список задач
        tasksListElement.innerHTML = '';

        // Получаем задачи в зависимости от фильтра
        let tasksToShow: TaskItem[];
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
        tasksToShow.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-due-date">
                        <i class="far fa-calendar-alt"></i> ${task.getFormattedDueDate()}
                    </div>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-actions">
                    ${task.isCompleted ? 
                        `<button class="btn-action btn-undo" data-id="${task.id}">
                            <i class="fas fa-undo"></i> Вернуть в работу
                        </button>` : 
                        `<button class="btn-action btn-complete" data-id="${task.id}">
                            <i class="fas fa-check"></i> Выполнить
                        </button>`}
                    <button class="btn-action btn-delete" data-id="${task.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            `;
            
            tasksListElement.appendChild(taskElement);
        });

        // Добавляем обработчики событий для кнопок
        this.addTaskEventListeners();
    }

    // Метод для добавления обработчиков событий
    private addTaskEventListeners(): void {
        // Обработчики для кнопок "Выполнить"
        document.querySelectorAll('.btn-complete').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
                const task = this.getTaskById(taskId);
                if (task) {
                    task.markAsCompleted();
                    this.renderTasks();
                }
            });
        });

        // Обработчики для кнопок "Вернуть в работу"
        document.querySelectorAll('.btn-undo').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
                const task = this.getTaskById(taskId);
                if (task) {
                    task.markAsActive();
                    this.renderTasks();
                }
            });
        });

        // Обработчики для кнопок "Удалить"
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
                this.deleteTask(taskId);
            });
        });
    }

    // Метод для инициализации менеджера задач
    initialize(): void {
        // Добавляем тестовые задачи
        this.addTask(
            "Изучить TypeScript", 
            "Освоить базовые типы, интерфейсы и классы в TypeScript", 
            new Date(new Date().setDate(new Date().getDate() + 7))
        );
        
        this.addTask(
            "Сделать практическую работу", 
            "Выполнить практическую работу по TypeScript, вариант 10", 
            new Date(new Date().setDate(new Date().getDate() + 3))
        );
        
        this.addTask(
            "Настроить проект", 
            "Настроить TypeScript компиляцию и создать файловую структуру", 
            new Date()
        );

        // Помечаем одну задачу как выполненную
        const firstTask = this.tasks[0];
        if (firstTask) {
            firstTask.markAsCompleted();
        }

        // Инициализируем рендеринг задач
        this.renderTasks();

        // Добавляем обработчики событий для фильтров
        document.querySelectorAll('.btn-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = (e.currentTarget as HTMLElement).getAttribute('data-filter');
                if (filter) {
                    // Удаляем активный класс у всех кнопок
                    document.querySelectorAll('.btn-filter').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Добавляем активный класс текущей кнопке
                    (e.currentTarget as HTMLElement).classList.add('active');
                    
                    // Устанавливаем фильтр
                    this.setFilter(filter);
                }
            });
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляр менеджера задач
    const taskManager = new TaskManager();
    
    // Инициализируем менеджер задач
    taskManager.initialize();

    // Обработчик формы для добавления новой задачи
    const taskForm = document.getElementById('taskForm') as HTMLFormElement;
    
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Получаем значения из формы
            const titleInput = document.getElementById('title') as HTMLInputElement;
            const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
            const dueDateInput = document.getElementById('dueDate') as HTMLInputElement;
            
            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const dueDate = new Date(dueDateInput.value);
            
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
            const today = new Date().toISOString().split('T')[0];
            dueDateInput.min = today;
        });
    }
    
    // Устанавливаем минимальную дату как сегодняшнюю для поля срока выполнения
    const dueDateInput = document.getElementById('dueDate') as HTMLInputElement;
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
        
        // Устанавливаем значение по умолчанию (через 3 дня)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        dueDateInput.value = defaultDate.toISOString().split('T')[0];
    }

    // Логирование информации о типах TypeScript (для демонстрации)
    console.log("=== ДЕМОНСТРАЦИЯ ТИПОВ TypeScript ===");
    
    // Базовые типы
    let userName: string = "Иван";
    let userAge: number = 25;
    let isActive: boolean = true;
    let hobbies: string[] = ["чтение", "программирование", "спорт"];
    let userTuple: [string, number] = ["Иван", 25];
    
    console.log("Базовые типы:");
    console.log(`userName (string): ${userName}`);
    console.log(`userAge (number): ${userAge}`);
    console.log(`isActive (boolean): ${isActive}`);
    console.log(`hobbies (string[]): ${hobbies.join(", ")}`);
    console.log(`userTuple (tuple): [${userTuple[0]}, ${userTuple[1]}]`);
    
    // Enum
    enum UserRole {
        Admin = "ADMIN",
        User = "USER",
        Moderator = "MODERATOR"
    }
    
    console.log(`\nEnum UserRole.Admin: ${UserRole.Admin}`);
});