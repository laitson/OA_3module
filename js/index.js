document.addEventListener('DOMContentLoaded', function() {
    // Код для кружков и букв
    const dots = document.querySelectorAll('.dot');
    const letters = document.querySelectorAll('.letter');
    const scrollingText = document.querySelector('.scrolling-text');
    
    // Функция исчезновения круга
    function disappearDot(dot) {
        dot.classList.add('disappear');
        setTimeout(() => {
            dot.style.display = 'none';
        }, 300);
    }
    
    dots.forEach(dot => {
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            disappearDot(this);
        });
    });
    
    // Код для кнопок фильтра
    const filterBtns = document.querySelectorAll('.button');
    console.log('Найдено кнопок:', filterBtns.length); 
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const buttonText = this.textContent.trim();
            console.log('Нажата кнопка:', buttonText);
            
            // Действия в зависимости от фильтра
            switch(buttonText) {
                case 'бей':
                    // Бей — кружки увеличиваются
                    console.log('Режим: БЕЙ');
                    dots.forEach(dot => {
                        if (dot.style.display !== 'none') {
                            dot.style.transition = 'transform 0.5s ease';
                            dot.style.transform = 'scale(2)';

                            setTimeout(() => {
                                dot.style.transform = 'scale(1)';
                            }, 500);
                        }
                    });
                    break;
                    
                case 'беги':
                    // Беги — кружки разбегаются к краям
                    dots.forEach(dot => {
                        if (dot.style.display !== 'none') {
                            const rect = dot.getBoundingClientRect();
                            const container = document.querySelector('.floating-elements');
                            const containerRect = container.getBoundingClientRect();
                            const centerX = rect.left + rect.width / 2;
                            const containerCenter = containerRect.left + containerRect.width / 2;
                            
                            const newLeft = centerX < containerCenter ? '2%' : '96%';
                            
                            dot.style.transition = 'left 0.8s ease-out';
                            dot.style.left = newLeft;
                            
                            setTimeout(() => {
                                dot.style.transition = '';
                            }, 800);
                        }
                    });
                    break;
                    
                case 'замри':
                    // Замри — всё останавливается
                    console.log('Режим: ЗАМРИ');
                    
                    // Останановка кружков
                    dots.forEach(dot => {
                        dot.style.animationPlayState = 'paused';
                    });
                    
                    // Остановка букв
                    letters.forEach(letter => {
                        letter.style.animationPlayState = 'paused';
                    });
                    
                    // Остановка бегущей строки
                    if (scrollingText) {
                        scrollingText.style.animationPlayState = 'paused';
                    }

                    setTimeout(() => {
                        dots.forEach(dot => {
                            dot.style.animationPlayState = 'running';
                        });
                        
                        letters.forEach(letter => {
                            letter.style.animationPlayState = 'running';
                        });
                        
                        if (scrollingText) {
                            scrollingText.style.animationPlayState = 'running';
                        }
                    }, 2000);
                    break;
                    
                default:
                    console.log('Неизвестная кнопка');
            }
        });
    });

    // бегущая строка
    if (scrollingText) {
        scrollingText.style.animation = 'scrollText 15s linear infinite';
        
        // смена направленич при клике
        scrollingText.addEventListener('click', function() {
            if (this.style.animationDirection === 'reverse') {
                this.style.animationDirection = 'normal';
            } else {
                this.style.animationDirection = 'reverse';
            }
        });
    }

    // заголовок мигает
    const titleText = document.querySelector('.title-text');
    
    if (titleText) {
        function fadeTitle() {
            titleText.style.transition = 'opacity 3s ease-in-out';
            titleText.style.opacity = '0';
            
            setTimeout(() => {
                titleText.style.opacity = '1';
            }, 3000);
            
            setTimeout(fadeTitle, 6000);
        }
        
        setTimeout(fadeTitle, 2000);
    }

    // карточки-перевертыши
    const flipCards = document.querySelectorAll('.flip-card');

    flipCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    });

    // Эффект при наведении на карточки
    flipCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('flipped')) {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});