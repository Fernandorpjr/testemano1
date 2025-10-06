/**
 * Sistema de visualização da tela do Sisreg
 * Permite capturar e monitorar a tela do Sisreg para verificar operações
 */
class SisregViewer {
    constructor() {
        this.isVisible = false;
        this.captureInterval = null;
        this.viewerElement = null;
        this.contentElement = null;
        this.lastScreenshot = null;
        this.captureFrequency = 2000; // 2 segundos
    }

    /**
     * Inicializa o visualizador do Sisreg
     */
    initialize() {
        // Criar o elemento do visualizador
        this.createViewerElement();
        
        // Adicionar botão ao sidebar
        this.addToggleButton();
        
        console.log('Sistema de visualização do Sisreg inicializado');
    }

    /**
     * Cria o elemento do visualizador na página
     */
    createViewerElement() {
        // Verificar se já existe
        if (document.querySelector('.mano-sisreg-viewer')) {
            return;
        }

        // Criar container principal
        this.viewerElement = document.createElement('div');
        this.viewerElement.className = 'mano-sisreg-viewer';
        
        // Criar cabeçalho
        const header = document.createElement('div');
        header.className = 'mano-sisreg-header';
        
        const title = document.createElement('h3');
        title.className = 'mano-sisreg-title';
        title.textContent = 'Visualizador do Sisreg';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'mano-sisreg-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => this.toggle());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Criar área de conteúdo
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'mano-sisreg-content';
        
        // Montar estrutura
        this.viewerElement.appendChild(header);
        this.viewerElement.appendChild(this.contentElement);
        
        // Adicionar à página
        document.body.appendChild(this.viewerElement);
    }

    /**
     * Adiciona botão de toggle ao sidebar
     */
    addToggleButton() {
        // Verificar se o sidebar existe
        const actionsContainer = document.getElementById('mano-actions-container');
        if (!actionsContainer) {
            console.error('Container de ações não encontrado');
            return;
        }
        
        // Criar botão
        const button = document.createElement('button');
        button.className = 'mano-action-button';
        button.id = 'mano-sisreg-button';
        button.innerHTML = '👁️ Visualizar Sisreg';
        button.addEventListener('click', () => this.toggle());
        
        // Adicionar ao container
        actionsContainer.appendChild(button);
    }

    /**
     * Alterna a visibilidade do visualizador
     */
    toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Exibe o visualizador e inicia a captura
     */
    show() {
        this.viewerElement.classList.add('visible');
        this.startCapture();
        
        // Atualizar texto do botão
        const button = document.getElementById('mano-sisreg-button');
        if (button) {
            button.innerHTML = '👁️ Parar visualização';
        }
    }

    /**
     * Oculta o visualizador e para a captura
     */
    hide() {
        this.viewerElement.classList.remove('visible');
        this.stopCapture();
        
        // Atualizar texto do botão
        const button = document.getElementById('mano-sisreg-button');
        if (button) {
            button.innerHTML = '👁️ Visualizar Sisreg';
        }
    }

    /**
     * Inicia a captura periódica da tela
     */
    startCapture() {
        // Parar captura anterior se existir
        this.stopCapture();
        
        // Fazer captura inicial
        this.captureScreen();
        
        // Configurar intervalo para capturas periódicas
        this.captureInterval = setInterval(() => {
            this.captureScreen();
        }, this.captureFrequency);
    }

    /**
     * Para a captura periódica
     */
    stopCapture() {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
    }

    /**
     * Captura a tela atual do Sisreg
     */
    captureScreen() {
        // Verificar se estamos na página do Sisreg
        if (!window.location.href.includes('sisregiii') && !window.location.href.includes('sisreg')) {
            this.showMessage('Esta não parece ser a página do Sisreg');
            return;
        }
        
        try {
            // Capturar a área principal do Sisreg
            const sisregContent = document.querySelector('.container-fluid') || 
                                 document.querySelector('main') || 
                                 document.querySelector('body');
            
            if (!sisregContent) {
                this.showMessage('Não foi possível identificar o conteúdo do Sisreg');
                return;
            }
            
            // Usar html2canvas para capturar a tela (se disponível)
            if (typeof html2canvas === 'function') {
                html2canvas(sisregContent).then(canvas => {
                    this.displayScreenshot(canvas.toDataURL());
                });
            } else {
                // Fallback: usar uma captura simplificada
                this.captureSimplified(sisregContent);
            }
        } catch (error) {
            console.error('Erro ao capturar tela:', error);
            this.showMessage('Erro ao capturar tela: ' + error.message);
        }
    }
    
    /**
     * Captura simplificada quando html2canvas não está disponível
     */
    captureSimplified(element) {
        // Criar uma cópia do conteúdo
        const clone = element.cloneNode(true);
        
        // Limpar conteúdo atual
        this.contentElement.innerHTML = '';
        
        // Adicionar estilo para ajustar ao tamanho
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.overflow = 'auto';
        clone.style.maxHeight = '100%';
        
        // Adicionar ao visualizador
        this.contentElement.appendChild(clone);
    }

    /**
     * Exibe a captura de tela no visualizador
     */
    displayScreenshot(dataUrl) {
        // Salvar última captura
        this.lastScreenshot = dataUrl;
        
        // Criar ou atualizar a imagem
        let img = this.contentElement.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            this.contentElement.innerHTML = '';
            this.contentElement.appendChild(img);
        }
        
        img.src = dataUrl;
    }

    /**
     * Exibe uma mensagem no visualizador
     */
    showMessage(message) {
        this.contentElement.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Carrega a biblioteca html2canvas se necessário
     */
    loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (typeof html2canvas === 'function') {
                resolve();
                return;
            }
            
            // Carregar a biblioteca
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar html2canvas'));
            document.head.appendChild(script);
        });
    }
}

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SisregViewer };
} else {
    window.SisregViewer = SisregViewer;
}