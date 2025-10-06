/**
 * Mano - Sistema de Feedback Visual
 * Este módulo implementa feedback visual para ações automatizadas
 */

class VisualFeedbackSystem {
    constructor() {
        this.highlightClass = 'mano-highlight';
        this.clickAnimationClass = 'mano-click-animation';
        this.typingAnimationClass = 'mano-typing-animation';
        this.scrollAnimationClass = 'mano-scroll-animation';
        this.setupStyles();
    }

    // Configurar estilos CSS para animações
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .${this.highlightClass} {
                outline: 3px solid #4285f4 !important;
                box-shadow: 0 0 8px rgba(66, 133, 244, 0.8) !important;
                transition: all 0.3s ease-in-out !important;
                z-index: 9999 !important;
            }
            
            .${this.clickAnimationClass} {
                position: absolute;
                width: 20px;
                height: 20px;
                background-color: rgba(66, 133, 244, 0.6);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 10000;
                animation: click-ripple 0.6s ease-out;
            }
            
            .${this.typingAnimationClass} {
                border-right: 2px solid #4285f4 !important;
                animation: typing-cursor 0.7s infinite;
            }
            
            .${this.scrollAnimationClass} {
                transition: scroll-behavior 0.5s ease !important;
                scroll-behavior: smooth !important;
            }
            
            @keyframes click-ripple {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(3);
                }
            }
            
            @keyframes typing-cursor {
                0%, 100% { border-color: transparent; }
                50% { border-color: #4285f4; }
            }
        `;
        document.head.appendChild(style);
    }

    // Destacar um elemento
    highlightElement(element, duration = 2000) {
        if (!element) return;
        
        // Adicionar classe de destaque
        element.classList.add(this.highlightClass);
        
        // Rolar para o elemento se não estiver visível
        this.scrollToElementIfNeeded(element);
        
        // Remover destaque após a duração especificada
        setTimeout(() => {
            element.classList.remove(this.highlightClass);
        }, duration);
        
        return element;
    }

    // Animar clique em um elemento
    animateClick(element, x, y) {
        if (!element) return;
        
        // Destacar o elemento
        this.highlightElement(element, 1000);
        
        // Criar animação de clique
        const clickAnimation = document.createElement('div');
        clickAnimation.className = this.clickAnimationClass;
        
        // Posicionar a animação
        if (x && y) {
            clickAnimation.style.left = `${x}px`;
            clickAnimation.style.top = `${y}px`;
        } else {
            const rect = element.getBoundingClientRect();
            clickAnimation.style.left = `${rect.left + rect.width / 2}px`;
            clickAnimation.style.top = `${rect.top + rect.height / 2}px`;
        }
        
        // Adicionar ao DOM
        document.body.appendChild(clickAnimation);
        
        // Remover após a animação
        setTimeout(() => {
            document.body.removeChild(clickAnimation);
        }, 600);
        
        return element;
    }

    // Animar digitação em um campo
    animateTyping(element, text, speed = 50) {
        if (!element || !element.tagName || !['INPUT', 'TEXTAREA'].includes(element.tagName.toUpperCase())) {
            return Promise.reject(new Error('Elemento inválido para digitação'));
        }
        
        // Destacar o elemento
        this.highlightElement(element);
        
        // Adicionar classe de animação de digitação
        element.classList.add(this.typingAnimationClass);
        
        // Limpar o campo
        element.value = '';
        
        // Animar digitação caractere por caractere
        return new Promise((resolve) => {
            let i = 0;
            const typeNextChar = () => {
                if (i < text.length) {
                    element.value += text.charAt(i);
                    i++;
                    setTimeout(typeNextChar, speed);
                } else {
                    // Remover classe de animação
                    element.classList.remove(this.typingAnimationClass);
                    resolve(element);
                }
            };
            
            typeNextChar();
        });
    }

    // Animar rolagem para um elemento
    scrollToElementIfNeeded(element) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (!isInViewport) {
            // Adicionar classe de animação de rolagem
            document.documentElement.classList.add(this.scrollAnimationClass);
            
            // Rolar para o elemento
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Remover classe após a rolagem
            setTimeout(() => {
                document.documentElement.classList.remove(this.scrollAnimationClass);
            }, 1000);
        }
        
        return element;
    }

    // Animar preenchimento de formulário
    animateFormFill(formData) {
        const promises = [];
        
        for (const selector in formData) {
            const element = document.querySelector(selector);
            if (element) {
                promises.push(this.animateTyping(element, formData[selector]));
            }
        }
        
        return Promise.all(promises);
    }
}

// Exportar o sistema de feedback visual
window.VisualFeedbackSystem = VisualFeedbackSystem;