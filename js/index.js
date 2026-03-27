document.addEventListener('DOMContentLoaded', function () {
    // ===== создаю плавающие элементы =====
    const LETTERS = ["О", "О", "О", "А", "А", "А"];
    const DOT_COUNT = 54;
    const LETTER_COUNT = 6;

    const FLIP_CARDS = [
        { num: "5", sense: "зрение", description: "назовите 5 вещей,\nкоторые вы прямо\nсейчас видите вокруг" },
        { num: "4", sense: "осязание", description: "назовите 4 вещи,\nкоторые вы можете\nпрямо сейчас потрогать" },
        { num: "3", sense: "слух", description: "назовите 3 звука,\nкоторые вы прямо\nсейчас слышите" },
        { num: "2", sense: "обоняние", description: "назовите 2 запаха,\nкоторые вы можете\nпрямо сейчас почувствовать" },
        { num: "1", sense: "вкус", description: "назовите 1 вкус,\nкоторый вы прямо\nсейчас ощущаете" }
    ];

    // ===== рандом =====
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ===== позиции =====
    const DOT_POSITIONS = Array.from({ length: DOT_COUNT }, (_, i) => ({
        top: randInt(5, 95),
        left: randInt(5, 96),
        anim: (i % 3) + 1,
        dur: randInt(17, 30)
    }));

    const LETTER_POSITIONS = Array.from({ length: LETTER_COUNT }, (_, i) => ({
        top: randInt(15, 80),
        left: randInt(10, 90),
        anim: (i % 3) + 1,
        dur: randInt(24, 34)
    }));

    const FILTER_DESCRIPTIONS = {
        'none': '',
        'бей': 'Режим "бей" - масштабирование элементов',
        'беги': 'Режим "беги" - кружки разбегаются к краям',
        'замри': 'Режим "замри" - все анимации остановлены'
    };

    // ===== состояние =====
    let dots = [];
    let currentMode = 'none';
    let timers = [];

    // ===== DOM элементы =====
    const floatingArea = document.getElementById('floatingArea');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterDescription = document.getElementById('filterDescription');
    const flipCardsArea = document.getElementById('flipCardsArea');
    const scrollingText = document.getElementById('scrollingText');

    // ===== таймеры =====
    function addTimer(fn, delay) {
        const id = setTimeout(() => {
            fn();
            timers = timers.filter(t => t !== id);
        }, delay);
        timers.push(id);
        return id;
    }

    function clearAllTimers() {
        timers.forEach(clearTimeout);
        timers = [];
    }

    window.addEventListener('beforeunload', () => clearAllTimers());

    // ===== круги =====
    function createDots() {
        DOT_POSITIONS.forEach((pos, i) => {
            const dot = document.createElement('div');
            dot.className = `dot anim-${pos.anim}`;
            dot.style.top = `${pos.top}%`;
            dot.style.left = `${pos.left}%`;
            dot.style.animationDuration = `${pos.dur}s`;
            dot.dataset.id = i;
            dot.dataset.originalLeft = pos.left;
            dot.dataset.originalTop = pos.top;

            dot.addEventListener('click', function (e) {
                e.stopPropagation();
                if (currentMode === 'беги' || currentMode === 'замри') return;
                this.classList.add('dot-hidden');

                const dotIndex = dots.findIndex(d => d.id === i);
                if (dotIndex !== -1) dots[dotIndex].visible = false;
            });

            floatingArea.appendChild(dot);
            dots.push({
                id: i,
                element: dot,
                visible: true,
                originalLeft: pos.left,
                originalTop: pos.top
            });
        });
    }

    // ===== делаю буквы =====
    function createLetters() {
        LETTER_POSITIONS.forEach((pos, i) => {
            const letter = document.createElement('div');
            letter.className = `floating-letter anim-${pos.anim}`;
            letter.style.top = `${pos.top}%`;
            letter.style.left = `${pos.left}%`;
            letter.style.animationDuration = `${pos.dur}s`;
            letter.textContent = LETTERS[i];
            floatingArea.appendChild(letter);
        });
    }

    // ===== Сфлип карточки =====
    function createFlipCards() {
        FLIP_CARDS.forEach(card => {
            const flipCard = document.createElement('div');
            flipCard.className = 'flip-card';
            flipCard.innerHTML = `
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <span class="flip-num">${card.num}</span>
                        <span class="flip-sense">${card.sense}</span>
                    </div>
                    <div class="flip-card-back">
                        <span class="flip-back-num">${card.num}</span>
                        <p class="flip-back-text">${card.description}</p>
                    </div>
                </div>
            `;
            flipCardsArea.appendChild(flipCard);
        });
    }

    // ===== режимы =====
    function resetMode() {
        // Убираем класс mode-* с floating-area
        floatingArea.classList.remove('mode-бей', 'mode-беги', 'mode-замри');


        dots.forEach(dot => {
            dot.element.classList.remove('dot-running');
            dot.element.style.left = `${dot.originalLeft}%`;
            dot.element.style.top = `${dot.originalTop}%`;
            dot.element.style.transform = '';
            dot.element.style.animation = '';
            dot.element.style.animationDuration = `${DOT_POSITIONS[dot.id].dur}s`;

            const animClass = `anim-${DOT_POSITIONS[dot.id].anim}`;
            dot.element.classList.add(animClass);
        });

        const letters = document.querySelectorAll('.floating-letter');
        letters.forEach(letter => {
            letter.style.animationPlayState = 'running';
        });

        if (scrollingText) {
            scrollingText.classList.remove('scrolling-paused');
        }
    }

    function applyBeiMode() {
        floatingArea.classList.add('mode-бей');
        addTimer(() => {
            if (currentMode === 'бей') {
                resetMode();
                currentMode = 'none';
                filterDescription.textContent = FILTER_DESCRIPTIONS.none;
                filterBtns.forEach(btn => btn.classList.remove('active'));
            }
        }, 2000);
    }

    function applyBegiMode() {
        dots.forEach(dot => {
            if (dot.visible && !dot.element.classList.contains('dot-hidden')) {
                dot.element.classList.add('dot-running');
                const isLeft = dot.originalLeft < 50;
                const targetLeft = isLeft ? 1 : 92;
                dot.element.style.left = `${targetLeft}%`;
            }
        });
        addTimer(() => {
            if (currentMode === 'беги') {
                resetMode();
                currentMode = 'none';
                filterDescription.textContent = FILTER_DESCRIPTIONS.none;
                filterBtns.forEach(btn => btn.classList.remove('active'));
            }
        }, 2000);
    }

    function applyZamriMode() {
        floatingArea.classList.add('mode-замри');
        if (scrollingText) {
            scrollingText.classList.add('scrolling-paused');
        }
        addTimer(() => {
            if (currentMode === 'замри') {
                resetMode();
                currentMode = 'none';
                filterDescription.textContent = FILTER_DESCRIPTIONS.none;
                filterBtns.forEach(btn => btn.classList.remove('active'));
            }
        }, 2000);
    }

    // ===== обработчик фильтров =====
    function handleFilter(mode) {
        // Если нажата активная кнопка — снимаем режим
        if (mode === currentMode) {
            resetMode();
            currentMode = 'none';
            filterDescription.textContent = FILTER_DESCRIPTIONS.none;
            filterBtns.forEach(btn => btn.classList.remove('active'));
            clearAllTimers();
            return;
        }

        clearAllTimers();
        resetMode();

        currentMode = mode;
        filterDescription.textContent = FILTER_DESCRIPTIONS[mode];

        // Обновила активный класс кнопок
        filterBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = Array.from(filterBtns).find(btn => btn.textContent.trim() === mode);
        if (activeBtn) activeBtn.classList.add('active');

        switch (mode) {
            case 'бей':
                applyBeiMode();
                break;
            case 'беги':
                applyBegiMode();
                break;
            case 'замри':
                applyZamriMode();
                break;
        }
    }
    // бегущая строка меняет направление по клику
    if (scrollingText) {
        scrollingText.addEventListener('click', function () {
            // ВАЖНО: управляем через класс, как требует CSS
            this.classList.toggle('scrolling-reverse');
        });
    }
    // инициализация
    function init() {
        createDots();
        createLetters();
        createFlipCards();
        initBreathingSection();

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.textContent.trim();
                handleFilter(mode);
            });
        });

        console.log('Инициализация завершена');
    }

    init();


    // блок дыхвния
    function initBreathingSection() {
        // Проверка наличия необходимых DOM элементов
        const breathingContainer = document.querySelector('.breathing-section');
        if (!breathingContainer) {
            console.warn('Дыхательная секция не найдена');
            return;
        }

        const DURATIONS = {
            inhale: 4,
            hold: 7,
            exhale: 8
        };

        let currentPhase = 'idle';
        let elapsed = 0;
        let breathingTimers = [];
        let isRunning = false;

        const blocks = {
            inhale: document.querySelector('.breath-block[data-phase="inhale"]'),
            hold: document.querySelector('.breath-block[data-phase="hold"]'),
            exhale: document.querySelector('.breath-block[data-phase="exhale"]')
        };

        // Проверка наличия всех блоков
        const missingBlocks = Object.entries(blocks).filter(([key, block]) => !block).map(([key]) => key);
        if (missingBlocks.length > 0) {
            console.warn(`Не найдены блоки дыхания: ${missingBlocks.join(', ')}`);
            return;
        }

        const labels = {
            inhale: blocks.inhale?.querySelector('.breath-label'),
            hold: blocks.hold?.querySelector('.breath-label'),
            exhale: blocks.exhale?.querySelector('.breath-label')
        };

        const dials = {
            inhale: blocks.inhale?.querySelector('.dial-hand'),
            hold: blocks.hold?.querySelector('.dial-hand'),
            exhale: blocks.exhale?.querySelector('.dial-hand')
        };

        const secondsDisplays = {
            inhale: blocks.inhale?.querySelector('.timer-seconds'),
            hold: blocks.hold?.querySelector('.timer-seconds'),
            exhale: blocks.exhale?.querySelector('.timer-seconds')
        };

        const eyes = {
            inhale: blocks.inhale?.querySelector('.eye-svg'),
            hold: blocks.hold?.querySelector('.eye-svg'),
            exhale: blocks.exhale?.querySelector('.eye-svg')
        };

        const startBtn = document.querySelector('.breathing-start-btn');

        // загрузка SVG
        const svgCache = {
            opened: null,
            closed: null
        };

        async function loadSVG(url) {
            try {
                const response = await fetch(url);
                const svgText = await response.text();
                return svgText;
            } catch (error) {
                console.error(`Ошибка загрузки SVG (${url}):`, error);
                return null;
            }
        }
        async function loadEyeSVGs() {
            const [opened, closed] = await Promise.all([
                loadSVG('./images/opened-eye.svg'),
                loadSVG('./images/closed-eye.svg')
            ]);

            svgCache.opened = opened;
            svgCache.closed = closed;
            Object.keys(eyes).forEach(phase => {
                if (eyes[phase] && svgCache.closed) {
                    eyes[phase].innerHTML = svgCache.closed;
                }
            });
        }

        function setEye(phase, isOpen) {
            if (eyes[phase]) {
                const svgContent = isOpen ? svgCache.opened : svgCache.closed;
                if (svgContent) {
                    eyes[phase].innerHTML = svgContent;
                }
            }
        }
        function updateActiveBlock(phase) {
            Object.keys(blocks).forEach(key => {
                if (blocks[key]) {
                    const isActive = (key === phase && currentPhase !== 'idle' && isRunning);

                    if (isActive) {
                        blocks[key].classList.add('active');
                        labels[key]?.classList.add('active');
                        setEye(key, true);
                    } else {
                        blocks[key].classList.remove('active');
                        labels[key]?.classList.remove('active');
                        setEye(key, false);
                    }
                }
            });
        }

        function updateDial(phase, elapsed, duration) {
            if (dials[phase] && currentPhase === phase && isRunning) {
                const angle = duration > 0 ? (elapsed / duration) * 360 : 0;
                dials[phase].setAttribute('transform', `rotate(${angle}, 50, 50)`);
            }
            if (secondsDisplays[phase] && currentPhase === phase && isRunning) {
                secondsDisplays[phase].textContent = String(elapsed).padStart(2, '0');
            }
        }

        // Сброс всех таймеров
        function clearBreathingTimers() {
            breathingTimers.forEach(timer => {
                if (timer.interval) clearInterval(timer.interval);
                if (timer.timeout) clearTimeout(timer.timeout);
            });
            breathingTimers = [];
        }

        function resetAllBlocks() {
            Object.keys(dials).forEach(phase => {
                if (dials[phase]) {
                    dials[phase].setAttribute('transform', 'rotate(0, 50, 50)');
                }
                if (secondsDisplays[phase]) {
                    secondsDisplays[phase].textContent = '00';
                }
            });
            updateActiveBlock(null);
        }

        // Остановка дыхательного упражнения
        function stopBreathing() {
            if (!isRunning) return;

            clearBreathingTimers();
            resetAllBlocks();

            currentPhase = 'idle';
            isRunning = false;
            elapsed = 0;

            if (startBtn) {
                startBtn.textContent = 'начать';
            }

            console.log('Дыхание остановлено');
        }

        function startBreathing() {
            if (isRunning) return;

            clearBreathingTimers();
            resetAllBlocks();

            isRunning = true;
            currentPhase = 'inhale';
            elapsed = 0;

            function runPhase(phase, duration, nextPhase) {
                if (!isRunning) return;

                currentPhase = phase;
                elapsed = 0;
                updateActiveBlock(phase);

                // Интервал обновления циферблата
                const intervalId = setInterval(() => {
                    if (currentPhase === phase && isRunning) {
                        elapsed = Math.min(elapsed + 1, duration);
                        updateDial(phase, elapsed, duration);
                    }
                }, 1000);

                const timeoutId = setTimeout(() => {
                    clearInterval(intervalId);
                    if (nextPhase && isRunning) {
                        runPhase(nextPhase, DURATIONS[nextPhase],
                            nextPhase === 'inhale' ? 'hold' :
                                nextPhase === 'hold' ? 'exhale' : null);
                    } else if (isRunning) {

                        currentPhase = 'idle';
                        isRunning = false;
                        resetAllBlocks();
                        if (startBtn) startBtn.textContent = 'начать';
                    }
                }, duration * 1000);

                breathingTimers.push({ interval: intervalId, timeout: timeoutId });
            }

            runPhase('inhale', DURATIONS.inhale, 'hold');

            if (startBtn) {
                startBtn.textContent = 'стоп';
            }

            console.log('Дыхание запущено');
        }

        function handleBreathingStart() {
            if (isRunning) {
                stopBreathing();
            } else {
                startBreathing();
            }
        }

        async function initBreathing() {
            if (startBtn) {
                await loadEyeSVGs();
                startBtn.addEventListener('click', handleBreathingStart);
                startBtn.textContent = 'начать'; // Убеждаемся, что текст правильный
            }
        }

        initBreathing();
    }
// метаболы
function initMetaballsBlock() {
    const canvas = document.getElementById('metaballsCanvas');
    if (!canvas) {
        console.warn('Canvas для метаболов не найден');
        return;
    }
    
    const container = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    
    // Цвета
    const BG_COLOR = { r: 244, g: 67, b: 54 }; 
    const BALL_COLOR = { r: 46, g: 45, b: 43 }; 
    
    class Ball {
        constructor(effect, x, y) {
            this.effect = effect;
            this.x = x || Math.random() * this.effect.width;
            this.y = y || Math.random() * this.effect.height;
            this.radius = Math.random() * 40 + 20;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
        }
        
        update() {
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.speedX = -this.speedX;
            }
            if (this.x + this.radius > this.effect.width) {
                this.x = this.effect.width - this.radius;
                this.speedX = -this.speedX;
            }
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.speedY = -this.speedY;
            }
            if (this.y + this.radius > this.effect.height) {
                this.y = this.effect.height - this.radius;
                this.speedY = -this.speedY;
            }
            
            this.x += this.speedX;
            this.y += this.speedY;
        }
    }
    
    class MetaballsEffect {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.balls = [];
        }
        
        init(numberOfBalls) {
            for (let i = 0; i < numberOfBalls; i++) {
                this.balls.push(new Ball(this));
            }
        }
        
        update() {
            this.balls.forEach(ball => ball.update());
        }
        
        draw(context) {
            const imageData = context.getImageData(0, 0, this.width, this.height);
            const data = imageData.data;
            
            // Заполняем фон красным
            for (let i = 0; i < data.length; i += 4) {
                data[i] = BG_COLOR.r;
                data[i + 1] = BG_COLOR.g;
                data[i + 2] = BG_COLOR.b;
                data[i + 3] = 255;
            }
            
            const step = 2;
            
            for (let y = 0; y < this.height; y += step) {
                for (let x = 0; x < this.width; x += step) {
                    let sum = 0;
                    for (let ball of this.balls) {
                        const dx = x - ball.x;
                        const dy = y - ball.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        sum += ball.radius * ball.radius / (distance * distance + 0.1);
                    }
                    
                    if (sum > 0.65) {
                        for (let dy = 0; dy < step; dy++) {
                            for (let dx = 0; dx < step; dx++) {
                                const px = x + dx;
                                const py = y + dy;
                                if (px < this.width && py < this.height) {
                                    const index = (py * this.width + px) * 4;
                                    data[index] = BALL_COLOR.r;
                                    data[index + 1] = BALL_COLOR.g;
                                    data[index + 2] = BALL_COLOR.b;
                                    data[index + 3] = 255;
                                }
                            }
                        }
                    }
                }
            }
            
            context.putImageData(imageData, 0, 0);
        }
        
        addBall(x, y) {
            const newBall = new Ball(this, x, y);
            newBall.radius = Math.random() * 35 + 15;
            newBall.speedX = (Math.random() - 0.5) * 2;
            newBall.speedY = (Math.random() - 0.5) * 2;
            this.balls.push(newBall);
        }
        
        removeBall() {
            if (this.balls.length > 1) {
                this.balls.pop();
            }
        }
        
        resize(width, height) {
            this.width = width;
            this.height = height;
        }
    }
    
    // Функция изменения размера
    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        if (effect) effect.resize(canvas.width, canvas.height);
    }
    
    const effect = new MetaballsEffect(canvas.width, canvas.height);
    effect.init(8);
    
    // анимация
    function animate() {
        if (!canvas.isConnected) return;
        effect.update();
        effect.draw(ctx);
        requestAnimationFrame(animate);
    }
    
    // инициализация
    resizeCanvas();
    animate();
    
    // интерактивность
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        let closestBall = null;
        let closestDistance = Infinity;
        
        for (let ball of effect.balls) {
            const dx = ball.x - mouseX;
            const dy = ball.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestBall = ball;
            }
        }
        
        if (closestBall && closestDistance < 100) {
            const dx = mouseX - closestBall.x;
            const dy = mouseY - closestBall.y;
            closestBall.speedX += dx * 0.03;
            closestBall.speedY += dy * 0.03;
            
            const maxSpeed = 4;
            closestBall.speedX = Math.min(maxSpeed, Math.max(-maxSpeed, closestBall.speedX));
            closestBall.speedY = Math.min(maxSpeed, Math.max(-maxSpeed, closestBall.speedY));
        }
    });
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        effect.addBall(e.clientX - rect.left, e.clientY - rect.top);
    });
    
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        effect.removeBall();
    });
    
    window.addEventListener('resize', () => resizeCanvas());
    
    console.log('Metaballs блок запущен');
}

// запуск метаболов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initMetaballsBlock, 200);
    });
} else {
    setTimeout(initMetaballsBlock, 200);
}
})