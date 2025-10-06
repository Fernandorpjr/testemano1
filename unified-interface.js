/**
 * Integração da interface unificada com a extensão Mano
 */
class UnifiedInterface {
    constructor() {
        this.iframe = null;
        this.isVisible = false;
    }

    /**
     * Inicializa a interface unificada
     */
    initialize() {
        try {
            // Criar o iframe para a interface unificada
            this.createInterface();
            
            // Adicionar listener para mensagens da interface
            this.setupMessageListener();
            
            // Adicionar botão para abrir a interface
            this.addToggleButton();
            
            // Enviar dados iniciais para a interface
            setTimeout(() => {
                this.sendInitialData();
            }, 1000);
            
            console.log('Interface unificada inicializada com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao inicializar interface unificada:', error);
            return false;
        }
    }
    
    /**
     * Envia dados iniciais para a interface
     */
    sendInitialData() {
        // Enviar logs
        if (window.manoState && window.manoState.logEntries) {
            this.sendMessage('logs', { logs: window.manoState.logEntries });
        }
    }

    /**
     * Cria o iframe para a interface unificada
     */
    createInterface() {
        // Verificar se já existe
        if (document.getElementById('mano-unified-interface')) {
            return;
        }

        // Criar container
        const container = document.createElement('div');
        container.id = 'mano-unified-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.right = '-800px'; // Inicialmente fora da tela
        container.style.width = '800px';
        container.style.height = '100vh';
        container.style.zIndex = '9999';
        container.style.transition = 'right 0.3s ease';
        container.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.2)';
        container.style.backgroundColor = '#ffffff';
        
        // Criar iframe
        this.iframe = document.createElement('iframe');
        this.iframe.id = 'mano-unified-interface';
        this.iframe.src = chrome.runtime.getURL('unified-interface.html');
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.border = 'none';
        
        // Montar estrutura
        container.appendChild(this.iframe);
        document.body.appendChild(container);
    }

    /**
     * Configura o listener para mensagens da interface
     */
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Verificar se a mensagem é da nossa interface
            if (!event.data || !event.data.type || !event.data.type.startsWith('mano')) {
                return;
            }
            
            // Processar mensagens
            this.processMessage(event.data);
        });
    }

    /**
     * Processa mensagens recebidas da interface
     */
    processMessage(message) {
        switch (message.type) {
            case 'manoInterfaceReady':
                this.sendInitialData();
                break;
                
            case 'manoCommand':
                if (typeof window.processCommand === 'function') {
                    window.processCommand(message.command);
                }
                break;
                
            case 'manoOcrCapture':
                if (typeof window.performOCR === 'function') {
                    window.performOCR();
                }
                break;
                
            case 'manoSisregStartCapture':
                if (window.manoState && window.manoState.sisregViewer) {
                    window.manoState.sisregViewer.startCapture(message.frequency);
                }
                break;
                
            case 'manoSisregStopCapture':
                if (window.manoState && window.manoState.sisregViewer) {
                    window.manoState.sisregViewer.stopCapture();
                }
                break;
                
            case 'manoDocumentUpload':
                if (window.manoState && window.manoState.documentScanner) {
                    window.manoState.documentScanner.addDocument(message.name, message.data);
                }
                break;
                
            case 'manoDocumentCamera':
                if (window.manoState && window.manoState.documentScanner) {
                    window.manoState.documentScanner.openCamera();
                }
                break;
                
            case 'manoDocumentProcess':
                if (window.manoState && window.manoState.documentScanner) {
                    window.manoState.documentScanner.processDocuments();
                }
                break;
                
            case 'manoDocumentAttach':
                if (window.manoState && window.manoState.documentScanner) {
                    window.manoState.documentScanner.attachToSisreg();
                }
                break;
                
            case 'manoDocumentClear':
                if (window.manoState && window.manoState.documentScanner) {
                    window.manoState.documentScanner.clearDocuments();
                }
                break;
                
            case 'manoDocumentAction':
                if (window.manoState && window.manoState.documentScanner) {
                    if (message.action === 'view') {
                        window.manoState.documentScanner.viewDocument(message.documentId);
                    } else if (message.action === 'delete') {
                        window.manoState.documentScanner.deleteDocument(message.documentId);
                    }
                }
                break;
                
            case 'manoRefreshWorkflows':
                if (typeof window.showWorkflowsList === 'function') {
                    window.showWorkflowsList();
                }
                break;
                
            case 'manoExecuteWorkflow':
                if (typeof window.executeWorkflow === 'function') {
                    window.executeWorkflow(message.workflowId);
                }
                break;
        }
    }

    /**
     * Envia dados iniciais para a interface
     */
    sendInitialData() {
        // Enviar logs existentes
        if (window.manoState && window.manoState.logEntries) {
            window.manoState.logEntries.forEach(entry => {
                this.sendLog(entry.message, entry.level);
            });
        }
        
        // Enviar lista de fluxos
        if (window.manoState && window.manoState.workflows) {
            this.sendWorkflowsList();
        }
        
        // Enviar lista de documentos
        if (window.manoState && window.manoState.documentScanner) {
            this.sendDocumentsList();
        }
    }

    /**
     * Envia uma mensagem de log para a interface
     */
    sendLog(message, level) {
        this.sendMessage({
            type: 'manoLog',
            message: message,
            level: level
        });
    }

    /**
     * Envia resultados de OCR para a interface
     */
    sendOcrResult(text, imageUrl) {
        this.sendMessage({
            type: 'manoOcrResult',
            text: text,
            imageUrl: imageUrl
        });
    }

    /**
     * Envia lista de documentos para a interface
     */
    sendDocumentsList() {
        if (window.manoState && window.manoState.documentScanner) {
            const documents = window.manoState.documentScanner.getDocuments();
            this.sendMessage({
                type: 'manoDocumentUpdate',
                documents: documents
            });
        }
    }

    /**
     * Envia captura do Sisreg para a interface
     */
    sendSisregCapture(imageUrl) {
        this.sendMessage({
            type: 'manoSisregCapture',
            imageUrl: imageUrl
        });
    }

    /**
     * Envia lista de fluxos para a interface
     */
    sendWorkflowsList() {
        if (window.manoState && window.manoState.workflows) {
            const workflows = window.manoState.workflows.getWorkflows();
            this.sendMessage({
                type: 'manoWorkflowsList',
                workflows: workflows
            });
        }
    }

    /**
     * Envia mensagem para a interface
     */
    sendMessage(action, data) {
        if (!this.iframe || !this.iframe.contentWindow) {
            console.error('Iframe não disponível para enviar mensagem:', action);
            return;
        }
        
        try {
            this.iframe.contentWindow.postMessage({
                type: 'mano.' + action,
                data: data
            }, '*');
            console.log('Mensagem enviada para a interface:', action);
        } catch (error) {
            console.error('Erro ao enviar mensagem para a interface:', error);
        }
    }

    /**
     * Adiciona botão para abrir a interface
     */
    addToggleButton() {
        // Verificar se o botão já existe
        if (document.querySelector('.mano-interface-button')) {
            return;
        }
        
        // Adicionar botão para a interface unificada na barra lateral
        const interfaceButton = document.createElement('button');
        interfaceButton.textContent = '📊 Dashboard';
        interfaceButton.className = 'mano-action-button mano-interface-button';
        interfaceButton.style.backgroundColor = '#2563eb';
        interfaceButton.style.color = 'white';
        interfaceButton.addEventListener('click', () => {
            console.log('Botão da interface clicado');
            this.toggle();
        });
        
        // Tentar adicionar à barra lateral
        const sidebarButtons = document.querySelector('.mano-action-buttons');
        if (sidebarButtons) {
            sidebarButtons.appendChild(interfaceButton);
            console.log('Botão da interface adicionado à barra lateral');
        } else {
            // Se a barra lateral não existir, criar um botão flutuante
            interfaceButton.style.position = 'fixed';
            interfaceButton.style.bottom = '20px';
            interfaceButton.style.right = '20px';
            interfaceButton.style.zIndex = '9998';
            interfaceButton.style.padding = '10px 15px';
            interfaceButton.style.borderRadius = '5px';
            interfaceButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            document.body.appendChild(interfaceButton);
            console.log('Botão flutuante da interface adicionado');
        }
    }

    /**
     * Alterna a visibilidade da interface
     */
    toggle() {
        const container = document.getElementById('mano-unified-container');
        if (!container) {
            console.error('Container da interface unificada não encontrado');
            // Tentar recriar a interface
            this.createInterface();
            setTimeout(() => this.toggle(), 100);
            return;
        }
        
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            container.style.right = '0';
            console.log('Interface unificada exibida');
        } else {
            container.style.right = '-800px';
            console.log('Interface unificada ocultada');
        }
        
        // Atualizar botão
        const button = document.getElementById('mano-unified-toggle');
        if (button) {
            button.innerHTML = this.isVisible ? '✖️' : '🤖';
        }
    }

    /**
     * Exibe a interface
     */
    show() {
        const container = document.getElementById('mano-unified-container');
        if (!container) {
            // Tentar recriar a interface
            this.createInterface();
            setTimeout(() => this.show(), 100);
            return;
        }
        
        container.style.right = '0';
        this.isVisible = true;
        console.log('Interface unificada exibida via show()');
        
        // Enviar mensagem para a interface
        this.sendMessage('toggle', { isVisible: true });
    }

    /**
     * Oculta a interface
     */
    hide() {
        if (this.isVisible) {
            this.toggle();
        }
    }
}

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UnifiedInterface };
} else {
    window.UnifiedInterface = UnifiedInterface;
}