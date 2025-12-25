// ============================================
// ТИПЫ ДЛЯ МЕДИА МЕНЕДЖЕРА
// ============================================

// Типы событий медиа
type MediaEventType = 
    | 'play' | 'pause' | 'ended' | 'timeupdate' 
    | 'volumechange' | 'ratechange' | 'seeking' | 'seeked'
    | 'waiting' | 'playing' | 'canplay' | 'loadedmetadata'
    | 'loading' | 'loadeddata' | 'error' | 'stalled' 
    | 'suspend' | 'abort' | 'emptied' | 'progress'
    | 'user-action' | 'system';

// Категории событий для фильтрации
type EventCategory = 'all' | 'playback' | 'network' | 'error' | 'user';

// Интерфейс для события медиа
interface MediaEvent {
    id: number;
    type: MediaEventType;
    category: EventCategory;
    timestamp: Date;
    message: string;
    data?: any;
}

// Состояния медиа-плеера
enum MediaState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    READY = 'READY',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    STOPPED = 'STOPPED',
    BUFFERING = 'BUFFERING',
    ENDED = 'ENDED',
    ERROR = 'ERROR'
}

// Типы источников медиа
interface MediaSource {
    id: string;
    name: string;
    url: string;
    type: 'video' | 'audio';
    thumbnail?: string;
}

// Интерфейс для метаданных медиа
interface MediaMetadata {
    duration: number;
    videoWidth: number;
    videoHeight: number;
    audioTracks: any[];
    videoTracks: any[];
    textTracks: any[];
}

// Интерфейс для поискового запроса
interface MediaSearchQuery {
    keyword: string;
    startTime?: number;
    endTime?: number;
    caseSensitive?: boolean;
}

// Интерфейс для результата поиска
interface MediaSearchResult {
    timestamp: number;
    confidence: number;
    context?: string;
}

// ============================================
// КЛАСС МЕДИА МЕНЕДЖЕРА
// ============================================

class MediaManager {
    // Свойства
    private mediaElement: HTMLMediaElement;
    private audioElement: HTMLAudioElement;
    private currentSource: MediaSource;
    private state: MediaState = MediaState.IDLE;
    private events: MediaEvent[] = [];
    private eventListeners: Map<MediaEventType, Function[]> = new Map();
    private autoPauseTimer: NodeJS.Timeout | null = null;
    private searchResults: MediaSearchResult[] = [];
    
    // Список доступных источников
    private mediaSources: MediaSource[] = [
        {
            id: 'video1',
            name: 'Big Buck Bunny',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            type: 'video'
        },
        {
            id: 'video2',
            name: 'Elephants Dream',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            type: 'video'
        },
        {
            id: 'video3',
            name: 'Tears of Steel',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video'
        },
        {
            id: 'audio',
            name: 'SoundHelix Song',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            type: 'audio'
        }
    ];

    constructor(mediaElementId: string, audioElementId: string) {
        this.mediaElement = document.getElementById(mediaElementId) as HTMLMediaElement;
        this.audioElement = document.getElementById(audioElementId) as HTMLAudioElement;
        this.currentSource = this.mediaSources[0];
        
        this.initializeMediaElement();
        this.setupEventListeners();
        this.addEvent('system', 'Медиа-менеджер инициализирован', { timestamp: new Date() });
    }

    // ============================================
    // ПУБЛИЧНЫЕ МЕТОДЫ
    // ============================================

    // Асинхронная загрузка медиа
    public async loadMedia(sourceId?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.setState(MediaState.LOADING);
                this.addEvent('loading', 'Начало загрузки медиа', { sourceId });
                
                if (sourceId) {
                    await this.changeSource(sourceId);
                }

                // Ждем готовности медиа
                const metadataLoaded = await this.waitForEvent('loadedmetadata', 10000);
                if (!metadataLoaded) {
                    throw new Error('Таймаут загрузки метаданных');
                }

                const canPlay = await this.waitForEvent('canplay', 10000);
                if (!canPlay) {
                    throw new Error('Таймаут готовности к воспроизведению');
                }

                this.setState(MediaState.READY);
                this.addEvent('loadedmetadata', 'Медиа успешно загружено', {
                    duration: this.mediaElement.duration,
                    readyState: this.mediaElement.readyState
                });

                resolve();
            } catch (error) {
                this.setState(MediaState.ERROR);
                this.addEvent('error', `Ошибка загрузки: ${error.message}`, { error }, 'error');
                reject(error);
            }
        });
    }

    // Асинхронная предзагрузка медиа с прогрессом
    public async preloadMedia(onProgress?: (progress: number) => void): Promise<MediaMetadata> {
        return new Promise((resolve, reject) => {
            this.addEvent('system', 'Начало предзагрузки медиа');
            
            // Симуляция прогресса загрузки
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (onProgress) onProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Получаем метаданные
                    const metadata: MediaMetadata = {
                        duration: this.mediaElement.duration,
                        videoWidth: this.mediaElement instanceof HTMLVideoElement ? this.mediaElement.videoWidth : 0,
                        videoHeight: this.mediaElement instanceof HTMLVideoElement ? this.mediaElement.videoHeight : 0,
                        audioTracks: (this.mediaElement as any).audioTracks || [],
                        videoTracks: (this.mediaElement as any).videoTracks || [],
                        textTracks: (this.mediaElement as any).textTracks || []
                    };

                    this.addEvent('loadeddata', 'Предзагрузка завершена', { metadata });
                    resolve(metadata);
                }
            }, 200);
        });
    }

    // Асинхронное воспроизведение
    public async play(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.addEvent('user-action', 'Запуск воспроизведения');
                
                if (this.state === MediaState.ERROR) {
                    throw new Error('Невозможно воспроизвести: состояние ERROR');
                }

                if (this.state !== MediaState.READY && this.state !== MediaState.PAUSED) {
                    await this.loadMedia();
                }

                const playPromise = this.mediaElement.play();
                
                if (playPromise !== undefined) {
                    await playPromise;
                    this.setState(MediaState.PLAYING);
                    this.addEvent('play', 'Воспроизведение начато');
                    resolve();
                }
            } catch (error) {
                this.setState(MediaState.ERROR);
                this.addEvent('error', `Ошибка воспроизведения: ${error.message}`, { error }, 'error');
                reject(error);
            }
        });
    }

    // Асинхронная пауза
    public async pause(): Promise<void> {
        return new Promise((resolve) => {
            this.addEvent('user-action', 'Пауза воспроизведения');
            this.mediaElement.pause();
            this.setState(MediaState.PAUSED);
            this.addEvent('pause', 'Воспроизведение приостановлено');
            resolve();
        });
    }

    // Асинхронная остановка
    public async stop(): Promise<void> {
        return new Promise((resolve) => {
            this.addEvent('user-action', 'Остановка воспроизведения');
            this.mediaElement.pause();
            this.mediaElement.currentTime = 0;
            this.setState(MediaState.STOPPED);
            this.addEvent('system', 'Воспроизведение остановлено');
            resolve();
        });
    }

    // Асинхронное изменение громкости
    public async setVolume(volume: number): Promise<void> {
        return new Promise((resolve) => {
            const clampedVolume = Math.max(0, Math.min(1, volume / 100));
            this.mediaElement.volume = clampedVolume;
            this.addEvent('volumechange', `Громкость изменена: ${volume}%`, { volume: clampedVolume });
            resolve();
        });
    }

    // Асинхронное изменение скорости
    public async setPlaybackRate(rate: number): Promise<void> {
        return new Promise((resolve) => {
            const clampedRate = Math.max(0.1, Math.min(4, rate));
            this.mediaElement.playbackRate = clampedRate;
            this.addEvent('ratechange', `Скорость изменена: ${clampedRate}x`, { rate: clampedRate });
            resolve();
        });
    }

    // Асинхронная перемотка
    public async seekTo(time: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (time < 0 || time > this.mediaElement.duration) {
                reject(new Error(`Время ${time} вне диапазона [0, ${this.mediaElement.duration}]`));
                return;
            }

            this.addEvent('seeking', `Перемотка к: ${this.formatTime(time)}`, { time });
            this.mediaElement.currentTime = time;

            // Ждем завершения перемотки
            const onSeeked = () => {
                this.mediaElement.removeEventListener('seeked', onSeeked);
                this.addEvent('seeked', `Перемотка завершена: ${this.formatTime(time)}`);
                resolve();
            };

            this.mediaElement.addEventListener('seeked', onSeeked);
            
            // Таймаут на случай ошибки
            setTimeout(() => {
                this.mediaElement.removeEventListener('seeked', onSeeked);
                reject(new Error('Таймаут перемотки'));
            }, 5000);
        });
    }

    // Асинхронный поиск по медиа (симуляция)
    public async searchInMedia(query: MediaSearchQuery): Promise<MediaSearchResult[]> {
        return new Promise((resolve) => {
            this.addEvent('system', `Поиск по медиа: "${query.keyword}"`, { query });
            
            // Симуляция асинхронного поиска
            setTimeout(() => {
                // Генерация случайных результатов
                const results: MediaSearchResult[] = [];
                const duration = this.mediaElement.duration || 600;
                
                for (let i = 0; i < 5; i++) {
                    const timestamp = Math.random() * duration;
                    results.push({
                        timestamp,
                        confidence: Math.random() * 0.5 + 0.5,
                        context: `Найдено совпадение "${query.keyword}" в ${this.formatTime(timestamp)}`
                    });
                }
                
                // Сортировка по времени
                results.sort((a, b) => a.timestamp - b.timestamp);
                this.searchResults = results;
                
                this.addEvent('system', `Поиск завершен: найдено ${results.length} совпадений`, { results });
                resolve(results);
            }, 1500);
        });
    }

    // Асинхронный запуск таймера авто-паузы
    public async startAutoPauseTimer(seconds: number): Promise<void> {
        return new Promise((resolve) => {
            this.addEvent('system', `Таймер авто-паузы установлен на ${seconds} секунд`);
            
            if (this.autoPauseTimer) {
                clearTimeout(this.autoPauseTimer);
            }
            
            this.autoPauseTimer = setTimeout(async () => {
                if (this.state === MediaState.PLAYING) {
                    await this.pause();
                    this.addEvent('system', 'Автоматическая пауза по таймеру');
                }
                this.autoPauseTimer = null;
                resolve();
            }, seconds * 1000);
        });
    }

    // Асинхронная смена источника
    public async changeSource(sourceId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const source = this.mediaSources.find(s => s.id === sourceId);
                if (!source) {
                    throw new Error(`Источник ${sourceId} не найден`);
                }

                this.addEvent('system', `Смена источника на: ${source.name}`);
                this.currentSource = source;

                // Определяем, какой элемент использовать
                const targetElement = source.type === 'audio' ? this.audioElement : this.mediaElement;
                
                // Скрываем/показываем элементы
                if (source.type === 'audio') {
                    this.mediaElement.style.display = 'none';
                    this.audioElement.style.display = 'block';
                    this.audioElement.src = source.url;
                    await this.audioElement.load();
                } else {
                    this.audioElement.style.display = 'none';
                    this.mediaElement.style.display = 'block';
                    this.mediaElement.src = source.url;
                    await this.mediaElement.load();
                }

                this.addEvent('loadedmetadata', `Источник изменен: ${source.name}`, { source });
                resolve();
            } catch (error) {
                this.addEvent('error', `Ошибка смены источника: ${error.message}`, { error }, 'error');
                reject(error);
            }
        });
    }

    // Загрузка пользовательского источника
    public async loadCustomSource(url: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.addEvent('user-action', `Загрузка пользовательского источника: ${url}`);
                
                // Валидация URL
                if (!this.isValidMediaUrl(url)) {
                    throw new Error('Некорректный URL медиа');
                }

                // Определяем тип по расширению
                const type = this.getMediaTypeFromUrl(url);
                const source: MediaSource = {
                    id: 'custom',
                    name: 'Пользовательский источник',
                    url,
                    type
                };

                this.mediaSources.push(source);
                await this.changeSource('custom');
                resolve();
            } catch (error) {
                this.addEvent('error', `Ошибка загрузки пользовательского источника: ${error.message}`, { error }, 'error');
                reject(error);
            }
        });
    }

    // ============================================
    // ГЕТТЕРЫ И УТИЛИТЫ
    // ============================================

    public getState(): MediaState {
        return this.state;
    }

    public getCurrentSource(): MediaSource {
        return this.currentSource;
    }

    public getEvents(filter?: EventCategory): MediaEvent[] {
        if (!filter || filter === 'all') {
            return [...this.events];
        }
        return this.events.filter(event => event.category === filter);
    }

    public getMediaElement(): HTMLMediaElement {
        return this.mediaElement;
    }

    public getSearchResults(): MediaSearchResult[] {
        return [...this.searchResults];
    }

    public clearEvents(): void {
        this.events = [];
        this.addEvent('system', 'Журнал событий очищен');
    }

    public getNetworkState(): string {
        const states = [
            'NETWORK_EMPTY',
            'NETWORK_IDLE',
            'NETWORK_LOADING',
            'NETWORK_NO_SOURCE'
        ];
        return states[this.mediaElement.networkState] || 'UNKNOWN';
    }

    public getReadyState(): string {
        const states = [
            'HAVE_NOTHING',
            'HAVE_METADATA',
            'HAVE_CURRENT_DATA',
            'HAVE_FUTURE_DATA',
            'HAVE_ENOUGH_DATA'
        ];
        return states[this.mediaElement.readyState] || 'UNKNOWN';
    }

    public getBufferedPercentage(): number {
        if (!this.mediaElement.duration) return 0;
        
        const buffered = this.mediaElement.buffered;
        if (buffered.length === 0) return 0;
        
        const end = buffered.end(buffered.length - 1);
        return (end / this.mediaElement.duration) * 100;
    }

    // ============================================
    // ПРИВАТНЫЕ МЕТОДЫ
    // ============================================

    private setState(newState: MediaState): void {
        const oldState = this.state;
        this.state = newState;
        this.addEvent('system', `Состояние изменено: ${oldState} → ${newState}`, {
            oldState,
            newState
        });
        this.updateStateUI();
    }

    private addEvent(
        type: MediaEventType, 
        message: string, 
        data?: any, 
        category?: EventCategory
    ): void {
        const event: MediaEvent = {
            id: Date.now(),
            type,
            category: category || this.getEventCategory(type),
            timestamp: new Date(),
            message,
            data
        };

        this.events.push(event);
        this.updateEventsUI();
        this.triggerEventListeners(type, event);
    }

    private getEventCategory(type: MediaEventType): EventCategory {
        const playbackEvents: MediaEventType[] = ['play', 'pause', 'ended', 'timeupdate', 'ratechange'];
        const networkEvents: MediaEventType[] = ['waiting', 'playing', 'canplay', 'loadedmetadata', 'stalled', 'suspend'];
        
        if (type === 'error') return 'error';
        if (type === 'user-action') return 'user';
        if (playbackEvents.includes(type)) return 'playback';
        if (networkEvents.includes(type)) return 'network';
        
        return 'system';
    }

    private async waitForEvent(eventType: MediaEventType, timeout: number): Promise<boolean> {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                this.mediaElement.removeEventListener(eventType, handler);
                resolve(false);
            }, timeout);

            const handler = () => {
                clearTimeout(timer);
                this.mediaElement.removeEventListener(eventType, handler);
                resolve(true);
            };

            this.mediaElement.addEventListener(eventType, handler);
        });
    }

    private initializeMediaElement(): void {
        this.mediaElement.volume = 0.7;
        this.mediaElement.preload = 'metadata';
        this.mediaElement.controls = false;
        
        // Устанавливаем первый источник
        this.mediaElement.src = this.currentSource.url;
    }

    private setupEventListeners(): void {
        // События воспроизведения
        this.mediaElement.addEventListener('play', () => {
            this.setState(MediaState.PLAYING);
        });

        this.mediaElement.addEventListener('pause', () => {
            this.setState(MediaState.PAUSED);
        });

        this.mediaElement.addEventListener('ended', () => {
            this.setState(MediaState.ENDED);
            this.addEvent('ended', 'Воспроизведение завершено');
        });

        this.mediaElement.addEventListener('timeupdate', () => {
            this.updateTimeUI();
        });

        // Сетевые события
        this.mediaElement.addEventListener('waiting', () => {
            this.setState(MediaState.BUFFERING);
            this.addEvent('waiting', 'Буферизация...');
        });

        this.mediaElement.addEventListener('playing', () => {
            if (this.state !== MediaState.PLAYING) {
                this.setState(MediaState.PLAYING);
            }
        });

        this.mediaElement.addEventListener('canplay', () => {
            this.addEvent('canplay', 'Медиа готово к воспроизведению');
        });

        this.mediaElement.addEventListener('loadedmetadata', () => {
            this.addEvent('loadedmetadata', 'Метаданные загружены', {
                duration: this.mediaElement.duration,
                dimensions: this.mediaElement instanceof HTMLVideoElement ? 
                    { width: this.mediaElement.videoWidth, height: this.mediaElement.videoHeight } : null
            });
        });

        // События ошибок
        this.mediaElement.addEventListener('error', () => {
            this.setState(MediaState.ERROR);
            const error = this.mediaElement.error;
            this.addEvent('error', `Ошибка медиа: ${error?.message || 'Неизвестная ошибка'}`, { error }, 'error');
        });

        this.mediaElement.addEventListener('stalled', () => {
            this.addEvent('stalled', 'Загрузка медиа остановлена');
        });

        // Другие события
        this.mediaElement.addEventListener('volumechange', () => {
            this.addEvent('volumechange', `Громкость: ${Math.round(this.mediaElement.volume * 100)}%`);
        });

        this.mediaElement.addEventListener('ratechange', () => {
            this.addEvent('ratechange', `Скорость: ${this.mediaElement.playbackRate}x`);
        });

        this.mediaElement.addEventListener('seeking', () => {
            this.addEvent('seeking', 'Перемотка...');
        });

        this.mediaElement.addEventListener('seeked', () => {
            this.addEvent('seeked', 'Перемотка завершена');
        });

        // Прогресс загрузки
        this.mediaElement.addEventListener('progress', () => {
            const buffered = this.getBufferedPercentage();
            this.updateBufferUI(buffered);
        });
    }

    private triggerEventListeners(eventType: MediaEventType, event: MediaEvent): void {
        const listeners = this.eventListeners.get(eventType) || [];
        listeners.forEach(listener => listener(event));
    }

    private isValidMediaUrl(url: string): boolean {
        try {
            new URL(url);
            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
            const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac'];
            const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
            
            return [...videoExtensions, ...audioExtensions].includes(extension);
        } catch {
            return false;
        }
    }

    private getMediaTypeFromUrl(url: string): 'video' | 'audio' {
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac'];
        const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
        
        return audioExtensions.includes(extension) ? 'audio' : 'video';
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // ============================================
    // ОБНОВЛЕНИЕ UI
    // ============================================

    private updateStateUI(): void {
        const stateElement = document.getElementById('playbackState');
        const indicator = document.getElementById('playbackIndicator');
        
        if (stateElement) {
            const stateMap: Record<MediaState, string> = {
                [MediaState.IDLE]: 'Неактивно',
                [MediaState.LOADING]: 'Загрузка...',
                [MediaState.READY]: 'Готово',
                [MediaState.PLAYING]: 'Воспроизведение',
                [MediaState.PAUSED]: 'На паузе',
                [MediaState.STOPPED]: 'Остановлено',
                [MediaState.BUFFERING]: 'Буферизация',
                [MediaState.ENDED]: 'Завершено',
                [MediaState.ERROR]: 'Ошибка'
            };
            
            stateElement.textContent = stateMap[this.state] || 'Неизвестно';
            
            // Цвет состояния
            const colorMap: Record<MediaState, string> = {
                [MediaState.IDLE]: '#64748b',
                [MediaState.LOADING]: '#f59e0b',
                [MediaState.READY]: '#10b981',
                [MediaState.PLAYING]: '#3b82f6',
                [MediaState.PAUSED]: '#8b5cf6',
                [MediaState.STOPPED]: '#ef4444',
                [MediaState.BUFFERING]: '#f59e0b',
                [MediaState.ENDED]: '#64748b',
                [MediaState.ERROR]: '#ef4444'
            };
            
            stateElement.style.color = colorMap[this.state] || '#64748b';
            
            if (indicator) {
                indicator.style.setProperty('--state-color', colorMap[this.state] || '#64748b');
                indicator.querySelector('::after')?.setAttribute('style', `width: 100%; background: ${colorMap[this.state]}`);
            }
        }

        // Обновляем другие индикаторы состояния
        this.updateNetworkStateUI();
        this.updateReadyStateUI();
        this.updateErrorStateUI();
    }

    private updateNetworkStateUI(): void {
        const stateElement = document.getElementById('networkState');
        const indicator = document.getElementById('networkIndicator');
        
        if (stateElement) {
            const state = this.getNetworkState();
            stateElement.textContent = state;
            
            const isGood = ['NETWORK_IDLE', 'NETWORK_LOADING'].includes(state);
            stateElement.style.color = isGood ? '#10b981' : '#ef4444';
            
            if (indicator) {
                indicator.querySelector('::after')?.setAttribute('style', `width: ${isGood ? '100%' : '30%'}`);
            }
        }
    }

    private updateReadyStateUI(): void {
        const stateElement = document.getElementById('readyState');
        const indicator = document.getElementById('readyIndicator');
        
        if (stateElement) {
            const state = this.getReadyState();
            stateElement.textContent = state;
            
            const isReady = state.includes('HAVE_') && !state.includes('HAVE_NOTHING');
            stateElement.style.color = isReady ? '#10b981' : '#f59e0b';
            
            if (indicator) {
                indicator.querySelector('::after')?.setAttribute('style', `width: ${isReady ? '100%' : '50%'}`);
            }
        }
    }

    private updateErrorStateUI(): void {
        const stateElement = document.getElementById('errorState');
        const indicator = document.getElementById('errorIndicator');
        
        if (stateElement) {
            const hasError = this.state === MediaState.ERROR || this.mediaElement.error;
            stateElement.textContent = hasError ? 'Есть ошибки' : 'Нет ошибок';
            stateElement.style.color = hasError ? '#ef4444' : '#10b981';
            
            if (indicator) {
                indicator.querySelector('::after')?.setAttribute('style', `width: ${hasError ? '100%' : '0%'}`);
            }
        }
    }

    private updateTimeUI(): void {
        const currentElement = document.getElementById('currentTimeDisplay');
        const durationElement = document.getElementById('durationDisplay');
        
        if (currentElement) {
            currentElement.textContent = this.formatTime(this.mediaElement.currentTime);
        }
        
        if (durationElement && this.mediaElement.duration) {
            durationElement.textContent = this.formatTime(this.mediaElement.duration);
        }
    }

    private updateBufferUI(percentage: number): void {
        const metric = document.getElementById('bufferedMetric');
        const bar = document.getElementById('bufferedBar');
        
        if (metric) {
            metric.textContent = `${percentage.toFixed(1)}%`;
        }
        
        if (bar) {
            bar.style.width = `${percentage}%`;
        }
        
        // Симуляция других метрик
        this.updateSimulatedMetrics();
    }

    private updateSimulatedMetrics(): void {
        // Симуляция пропускной способности
        const bandwidth = 500 + Math.random() * 1500;
        const bandwidthMetric = document.getElementById('bandwidthMetric');
        const bandwidthBar = document.getElementById('bandwidthBar');
        
        if (bandwidthMetric) {
            bandwidthMetric.textContent = `${bandwidth.toFixed(0)} KB/s`;
        }
        
        if (bandwidthBar) {
            const percentage = Math.min(100, (bandwidth / 2000) * 100);
            bandwidthBar.style.width = `${percentage}%`;
            bandwidthBar.style.background = percentage > 80 ? '#10b981' : 
                                          percentage > 40 ? '#f59e0b' : '#ef4444';
        }
        
        // Симуляция задержки
        const latency = 50 + Math.random() * 200;
        const latencyMetric = document.getElementById('latencyMetric');
        const latencyBar = document.getElementById('latencyBar');
        
        if (latencyMetric) {
            latencyMetric.textContent = `${latency.toFixed(0)}ms`;
        }
        
        if (latencyBar) {
            const percentage = Math.min(100, (latency / 300) * 100);
            latencyBar.style.width = `${percentage}%`;
            latencyBar.style.background = percentage < 30 ? '#10b981' : 
                                         percentage < 70 ? '#f59e0b' : '#ef4444';
        }
    }

    private updateEventsUI(): void {
        const container = document.getElementById('eventsContainer');
        const totalEvents = document.getElementById('totalEvents');
        const errorEvents = document.getElementById('errorEvents');
        const lastEventTime = document.getElementById('lastEventTime');
        
        if (!container) return;
        
        // Обновляем статистику
        if (totalEvents) {
            totalEvents.textContent = this.events.length.toString();
        }
        
        if (errorEvents) {
            const errorCount = this.events.filter(e => e.category === 'error').length;
            errorEvents.textContent = errorCount.toString();
        }
        
        if (lastEventTime && this.events.length > 0) {
            const lastEvent = this.events[this.events.length - 1];
            lastEventTime.textContent = lastEvent.timestamp.toLocaleTimeString();
        }
        
        // Обновляем отображение событий (фильтруем по активному фильтру)
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') as EventCategory || 'all';
        const filteredEvents = this.getEvents(activeFilter);
        
        container.innerHTML = '';
        
        filteredEvents.slice(-50).forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-entry';
            
            const typeClass = this.getEventTypeClass(event.category, event.type);
            
            eventElement.innerHTML = `
                <div class="event-time">[${event.timestamp.toLocaleTimeString()}]</div>
                <div class="event-type ${typeClass}">${this.getEventTypeLabel(event.type)}</div>
                <div class="event-message">${event.message}</div>
            `;
            
            container.appendChild(eventElement);
        });
        
        // Прокручиваем к последнему событию
        container.scrollTop = container.scrollHeight;
    }

    private getEventTypeClass(category: EventCategory, type: MediaEventType): string {
        if (category === 'error') return 'error';
        if (type === 'user-action') return 'success';
        if (category === 'playback') return 'playback';
        if (category === 'network') return 'warning';
        return 'info';
    }

    private getEventTypeLabel(type: MediaEventType): string {
        const labels: Record<MediaEventType, string> = {
            'play': 'ВОСПР.',
            'pause': 'ПАУЗА',
            'ended': 'КОНЕЦ',
            'timeupdate': 'ВРЕМЯ',
            'volumechange': 'ГРОМК.',
            'ratechange': 'СКОРОСТЬ',
            'seeking': 'ПЕРЕМОТ.',
            'seeked': 'ПЕРЕМОТ.',
            'waiting': 'БУФЕР.',
            'playing': 'ИГРАЕТ',
            'canplay': 'ГОТОВО',
            'loadedmetadata': 'МЕТАД.',
            'loading': 'ЗАГРУЗКА',
            'loadeddata': 'ДАННЫЕ',
            'error': 'ОШИБКА',
            'stalled': 'СТОП',
            'suspend': 'ПАУЗА',
            'abort': 'ОТМЕНА',
            'emptied': 'ОЧИЩЕНО',
            'progress': 'ПРОГРЕСС',
            'user-action': 'ПОЛЬЗ.',
            'system': 'СИСТЕМА'
        };
        
        return labels[type] || 'СОБЫТИЕ';
    }

    public on(eventType: MediaEventType, callback: (event: MediaEvent) => void): void {
        const listeners = this.eventListeners.get(eventType) || [];
        listeners.push(callback);
        this.eventListeners.set(eventType, listeners);
    }

    public off(eventType: MediaEventType, callback: (event: MediaEvent) => void): void {
        const listeners = this.eventListeners.get(eventType) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
            this.eventListeners.set(eventType, listeners);
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

let mediaManager: MediaManager;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Инициализация медиа менеджера
        mediaManager = new MediaManager('mediaPlayer', 'audioPlayer');
        
        // Настройка обработчиков UI
        setupEventHandlers();
        
        // Загрузка начального медиа
        await mediaManager.loadMedia();
        
        console.log('Media Manager инициализирован успешно');
        
        // Демонстрация типизированных асинхронных операций
        demonstrateAsyncOperations();
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
});

function setupEventHandlers(): void {
    if (!mediaManager) return;
    
    // Кнопки управления воспроизведением
    document.getElementById('playBtn')?.addEventListener('click', async () => {
        await mediaManager.play();
    });
    
    document.getElementById('pauseBtn')?.addEventListener('click', async () => {
        await mediaManager.pause();
    });
    
    document.getElementById('stopBtn')?.addEventListener('click', async () => {
        await mediaManager.stop();
    });
    
    // Громкость
    const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement;
    const volumeValue = document.getElementById('volumeValue');
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            if (volumeValue) {
                volumeValue.textContent = `${volumeSlider.value}%`;
            }
        });
        
        document.getElementById('setVolumeBtn')?.addEventListener('click', async () => {
            await mediaManager.setVolume(parseInt(volumeSlider.value));
        });
    }
    
    // Скорость воспроизведения
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const speed = parseFloat(btn.getAttribute('data-speed') || '1');
            await mediaManager.setPlaybackRate(speed);
            
            // Обновляем активную кнопку
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.getElementById('setCustomSpeedBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('customSpeed') as HTMLInputElement;
        const speed = parseFloat(input.value) || 1;
        await mediaManager.setPlaybackRate(speed);
    });
    
    // Перемотка
    document.querySelectorAll('.seek-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const seek = parseInt(btn.getAttribute('data-seek') || '0');
            const media = mediaManager.getMediaElement();
            const newTime = Math.max(0, Math.min(media.duration, media.currentTime + seek));
            await mediaManager.seekTo(newTime);
        });
    });
    
    document.getElementById('seekToBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('customSeek') as HTMLInputElement;
        const time = parseInt(input.value) || 0;
        await mediaManager.seekTo(time);
    });
    
    // Смена источника
    document.querySelectorAll('.source-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const sourceId = btn.getAttribute('data-source');
            if (sourceId) {
                await mediaManager.changeSource(sourceId);
                
                // Обновляем активную кнопку
                document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
    
    document.getElementById('loadCustomSourceBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('customSource') as HTMLInputElement;
        const url = input.value.trim();
        
        if (url) {
            try {
                await mediaManager.loadCustomSource(url);
                input.value = '';
            } catch (error) {
                alert(`Ошибка загрузки: ${error.message}`);
            }
        }
    });
    
    // Картинка в картинке
    document.getElementById('pictureInPictureBtn')?.addEventListener('click', async () => {
        const media = mediaManager.getMediaElement();
        
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (media instanceof HTMLVideoElement) {
            try {
                await media.requestPictureInPicture();
            } catch (error) {
                console.error('Ошибка PiP:', error);
            }
        }
    });
    
    // Полный экран
    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
        const media = mediaManager.getMediaElement();
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            media.requestFullscreen().catch(err => {
                console.error(`Ошибка полноэкранного режима: ${err.message}`);
            });
        }
    });
    
    // Без звука
    document.getElementById('muteBtn')?.addEventListener('click', () => {
        const media = mediaManager.getMediaElement();
        media.muted = !media.muted;
        const btn = document.getElementById('muteBtn');
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = media.muted ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
            btn.innerHTML = media.muted ? 
                '<i class="fas fa-volume-up"></i> Включить звук' :
                '<i class="fas fa-volume-mute"></i> Без звука';
        }
    });
    
    // Фильтры событий
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mediaManager.updateEventsUI();
        });
    });
    
    // Очистка событий
    document.getElementById('clearEventsBtn')?.addEventListener('click', () => {
        mediaManager.clearEvents();
    });
    
    // Асинхронные операции
    document.getElementById('preloadBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('preloadBtn');
        const status = document.getElementById('preloadStatus');
        const progress = document.getElementById('preloadProgress');
        
        if (btn && status && progress) {
            btn.classList.add('loading');
            btn.setAttribute('disabled', 'true');
            status.textContent = 'Загрузка...';
            progress.style.width = '0%';
            
            try {
                await mediaManager.preloadMedia((p) => {
                    progress.style.width = `${p}%`;
                    status.textContent = `Загрузка: ${p}%`;
                });
                
                status.textContent = 'Завершено';
                progress.style.width = '100%';
            } catch (error) {
                status.textContent = `Ошибка: ${error.message}`;
                progress.style.width = '0%';
            } finally {
                btn.classList.remove('loading');
                btn.removeAttribute('disabled');
            }
        }
    });
    
    document.getElementById('reloadBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('reloadBtn');
        const status = document.getElementById('reloadStatus');
        
        if (btn && status) {
            btn.classList.add('loading');
            btn.setAttribute('disabled', 'true');
            status.textContent = 'Перезагрузка...';
            
            try {
                await mediaManager.loadMedia();
                status.textContent = 'Успешно перезагружено';
            } catch (error) {
                status.textContent = `Ошибка: ${error.message}`;
            } finally {
                setTimeout(() => {
                    btn.classList.remove('loading');
                    btn.removeAttribute('disabled');
                    status.textContent = 'Готово';
                }, 1000);
            }
        }
    });
    
    document.getElementById('startAutoPauseBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('autoPauseTime') as HTMLInputElement;
        const status = document.getElementById('autoPauseStatus');
        const seconds = parseInt(input.value) || 30;
        
        if (status) {
            status.textContent = `Таймер запущен на ${seconds}с`;
            
            try {
                await mediaManager.startAutoPauseTimer(seconds);
                status.textContent = 'Таймер завершен';
            } catch (error) {
                status.textContent = `Ошибка: ${error.message}`;
            }
        }
    });
    
    document.getElementById('searchFramesBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('searchKeyword') as HTMLInputElement;
        const status = document.getElementById('searchStatus');
        const keyword = input.value.trim();
        
        if (!keyword) {
            alert('Введите ключевое слово для поиска');
            return;
        }
        
        if (status) {
            status.textContent = 'Поиск...';
            
            try {
                const query: MediaSearchQuery = {
                    keyword,
                    caseSensitive: false
                };
                
                const results = await mediaManager.searchInMedia(query);
                status.textContent = `Найдено: ${results.length} совпадений`;
                
                // Показываем результаты в консоли
                console.log('Результаты поиска:', results);
            } catch (error) {
                status.textContent = `Ошибка: ${error.message}`;
            }
        }
    });
    
    // Обновление времени каждую секунду
    setInterval(() => {
        if (mediaManager) {
            const media = mediaManager.getMediaElement();
            if (!isNaN(media.duration)) {
                const currentElement = document.getElementById('currentTimeDisplay');
                const durationElement = document.getElementById('durationDisplay');
                
                if (currentElement) {
                    currentElement.textContent = formatTime(media.currentTime);
                }
                
                if (durationElement) {
                    durationElement.textContent = formatTime(media.duration);
                }
            }
        }
    }, 1000);
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function demonstrateAsyncOperations(): void {
    console.log('=== ДЕМОНСТРАЦИЯ АСИНХРОННЫХ ОПЕРАЦИЙ ===');
    
    // Пример 1: Цепочка асинхронных операций
    const demoChain = async () => {
        console.log('\n1. Цепочка асинхронных операций:');
        
        try {
            console.log('   - Загрузка медиа...');
            await mediaManager.loadMedia();
            
            console.log('   - Воспроизведение...');
            await mediaManager.play();
            
            console.log('   - Пауза через 2 секунды...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await mediaManager.pause();
            
            console.log('   - Изменение громкости...');
            await mediaManager.setVolume(50);
            
            console.log('   - Цепочка завершена успешно');
        } catch (error) {
            console.error('   Ошибка в цепочке:', error);
        }
    };
    
    // Пример 2: Параллельные асинхронные операции
    const demoParallel = async () => {
        console.log('\n2. Параллельные асинхронные операции:');
        
        const operations = [
            mediaManager.preloadMedia(),
            mediaManager.searchInMedia({ keyword: 'demo', caseSensitive: false })
        ];
        
        try {
            const results = await Promise.allSettled(operations);
            console.log('   Результаты параллельных операций:', results);
        } catch (error) {
            console.error('   Ошибка параллельных операций:', error);
        }
    };
    
    // Пример 3: Обработка ошибок в асинхронных операциях
    const demoErrorHandling = async () => {
        console.log('\n3. Обработка ошибок в асинхронных операциях:');
        
        try {
            // Попытка перемотки за пределы длительности
            await mediaManager.seekTo(999999);
        } catch (error) {
            console.log('   Ожидаемая ошибка перемотки:', error.message);
        }
        
        try {
            // Попытка загрузки невалидного URL
            await mediaManager.loadCustomSource('invalid-url');
        } catch (error) {
            console.log('   Ожидаемая ошибка загрузки:', error.message);
        }
    };
    
    // Запуск демонстраций
    setTimeout(() => demoChain(), 1000);
    setTimeout(() => demoParallel(), 5000);
    setTimeout(() => demoErrorHandling(), 8000);
}

// Глобальные слушатели событий
window.addEventListener('beforeunload', () => {
    if (mediaManager) {
        mediaManager.addEvent('system', 'Приложение закрывается');
    }
});