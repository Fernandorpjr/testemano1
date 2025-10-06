// Mano - Content Script for Sisreg Interaction
// This script runs in the context of the Sisreg page

console.log('Mano Extension - Content script loaded');

// Estado global do assistente
const manoState = {
    isActive: false,
    logEntries: [],
    commandHistory: [],
    currentCommandIndex: -1,
    isProcessing: false,
    workflows: null,
    visualFeedback: null,
    documentScanner: null,
    unifiedInterface: null
};

// Inicializar o assistente
function initManoAssistant() {
    createSidebar();
    setupEventListeners();
    logInfo('Assistente Mano inicializado. Pronto para ajudar com o Sisreg!');
    
    // Verificar se estamos na página do Sisreg
    if (window.location.href.includes('sisregiii.saude.gov.br')) {
        logSuccess('Página do Sisreg detectada!');
    } else {
        logError('Esta não parece ser a página do Sisreg. O assistente pode não funcionar corretamente.');
    }
    
    // Inicializar fluxos automatizados
    initializeWorkflows();
    
    // Inicializar feedback visual
    initializeVisualFeedback();
    
    // Inicializar scanner de documentos
    initializeDocumentScanner();
    
    // Inicializar visualizador do Sisreg
    initializeSisregViewer();
    
    // Inicializar interface unificada
    initializeUnifiedInterface();
}

// Função para inicializar o scanner de documentos
function initializeDocumentScanner() {
    // Verificar se o script de scanner de documentos já foi carregado
    if (typeof DocumentScanner === 'undefined') {
        // Carregar o CSS do scanner de documentos
        const documentScannerCSS = document.createElement('link');
        documentScannerCSS.rel = 'stylesheet';
        documentScannerCSS.href = chrome.runtime.getURL('document-scanner.css');
        document.head.appendChild(documentScannerCSS);
        
        // Carregar o script de scanner de documentos
        const documentScannerScript = document.createElement('script');
        documentScannerScript.src = chrome.runtime.getURL('document-scanner.js');
        documentScannerScript.onload = function() {
            setupDocumentScanner();
        };
        document.head.appendChild(documentScannerScript);
    } else {
        setupDocumentScanner();
    }
}

// Função para inicializar o visualizador do Sisreg
function initializeSisregViewer() {
    // Carregar o script do visualizador do Sisreg
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('sisreg-viewer.js');
    script.onload = function() {
        // Inicializar o visualizador do Sisreg após o carregamento do script
        manoState.sisregViewer = new SisregViewer();
        manoState.sisregViewer.initialize();
        
        logMessage('Sistema de visualização do Sisreg inicializado', 'info');
    };
    document.head.appendChild(script);
}

// Configurar o scanner de documentos
function setupDocumentScanner() {
    if (typeof DocumentScanner !== 'undefined') {
        manoState.documentScanner = new DocumentScanner().initialize();
        
        // Adicionar botão para o scanner de documentos na barra lateral
        const documentButton = document.createElement('button');
        documentButton.textContent = '📄 Documentos';
        documentButton.className = 'mano-action-button';
        documentButton.addEventListener('click', toggleDocumentScanner);
        
        const sidebarButtons = document.querySelector('.mano-action-buttons');
        if (sidebarButtons) {
            sidebarButtons.appendChild(documentButton);
        }
        
        logInfo('Sistema de documentos inicializado');
    } else {
        logError('Falha ao inicializar o sistema de documentos');
    }
}

// Alternar a visibilidade do scanner de documentos
function toggleDocumentScanner() {
    if (manoState.documentScanner) {
        manoState.documentScanner.toggle();
        logInfo('Scanner de documentos ' + (manoState.documentScanner.docContainer.style.display !== 'none' ? 'exibido' : 'ocultado'));
    } else {
        logError('Sistema de documentos não está disponível');
    }
}

// Alternar a visibilidade do visualizador do Sisreg
function toggleSisregViewer() {
    if (manoState.sisregViewer) {
        manoState.sisregViewer.toggle();
        logMessage('Visualizador do Sisreg ' + (manoState.sisregViewer.isVisible ? 'exibido' : 'ocultado'), 'info');
    } else {
        logMessage('Visualizador do Sisreg não está disponível', 'error');
    }
}

// As funções initializeUnifiedInterface e toggleUnifiedInterface foram movidas para content-unified.js

// Inicializar feedback visual
function initializeVisualFeedback() {
    // Verificar se o script de feedback visual já foi carregado
    if (typeof VisualFeedbackSystem === 'undefined') {
        // Carregar o script de feedback visual
        const visualFeedbackScript = document.createElement('script');
        visualFeedbackScript.src = chrome.runtime.getURL('visual-feedback.js');
        visualFeedbackScript.onload = function() {
            setupVisualFeedback();
        };
        document.head.appendChild(visualFeedbackScript);
    } else {
        setupVisualFeedback();
    }
}

// Configurar feedback visual
function setupVisualFeedback() {
    if (typeof VisualFeedbackSystem !== 'undefined') {
        // Inicializar o sistema de feedback visual
        manoState.visualFeedback = new VisualFeedbackSystem();
        logInfo('Sistema de feedback visual inicializado');
    }
}

// Inicializar fluxos automatizados
function initializeWorkflows() {
    // Verificar se o script de workflows já foi carregado
    if (typeof WorkflowAutomation === 'undefined') {
        // Carregar o script de fluxos automatizados
        const workflowsScript = document.createElement('script');
        workflowsScript.src = chrome.runtime.getURL('workflows.js');
        workflowsScript.onload = function() {
            setupWorkflows();
        };
        document.head.appendChild(workflowsScript);
    } else {
        setupWorkflows();
    }
}

// Configurar fluxos automatizados
function setupWorkflows() {
    if (typeof WorkflowAutomation !== 'undefined') {
        // Inicializar o sistema de fluxos automatizados
        manoState.workflows = new WorkflowAutomation();
        
        // Carregar fluxos personalizados
        if (manoState.workflows.loadCustomWorkflows) {
            manoState.workflows.loadCustomWorkflows().then(() => {
                logInfo('Fluxos automatizados carregados');
                
                // Adicionar botão de fluxos à sidebar
                addWorkflowsButton();
            });
        }
    }
}

// Adicionar botão de fluxos à sidebar
function addWorkflowsButton() {
    const actionsContainer = document.getElementById('mano-actions-container');
    if (actionsContainer) {
        const workflowsButton = document.createElement('button');
        workflowsButton.className = 'mano-action-button';
        workflowsButton.setAttribute('data-action', 'workflows');
        workflowsButton.textContent = 'Fluxos Automatizados';
        workflowsButton.title = 'Executar fluxos automatizados';
        
        workflowsButton.addEventListener('click', showWorkflowsList);
        
        actionsContainer.appendChild(workflowsButton);
    }
}

// Criar a interface do painel lateral
function createSidebar() {
    // Criar o botão de toggle
    const toggleButton = document.createElement('button');
    toggleButton.id = 'mano-toggle-button';
    toggleButton.innerHTML = '&#9776;';
    toggleButton.title = 'Abrir/Fechar Assistente Mano';
    document.body.appendChild(toggleButton);
    
    // Criar o painel lateral
    const sidebar = document.createElement('div');
    sidebar.id = 'mano-sidebar';
    
    sidebar.innerHTML = `
        <div id="mano-sidebar-header">
            <h2 id="mano-sidebar-title">Mano - Assistente Sisreg</h2>
            <span id="mano-close-button" style="cursor: pointer;">✕</span>
        </div>
        
        <div id="mano-actions-container">
            <button class="mano-action-button" data-action="login">Login Automático</button>
            <button class="mano-action-button" data-action="search">Buscar Paciente</button>
            <button class="mano-action-button" data-action="fill">Preencher Formulário</button>
            <button class="mano-action-button" data-action="submit">Enviar Solicitação</button>
        </div>
        
        <div style="padding: 10px;">
            <input type="text" id="mano-command-input" placeholder="Digite um comando ou instrução...">
            <button id="mano-command-button">Executar</button>
        </div>
        
        <div id="mano-log-container"></div>
    `;
    
    document.body.appendChild(sidebar);
}

// Configurar os event listeners
function setupEventListeners() {
    // Toggle do painel lateral
    document.getElementById('mano-toggle-button').addEventListener('click', toggleSidebar);
    document.getElementById('mano-close-button').addEventListener('click', toggleSidebar);
    
    // Botão de comando
    document.getElementById('mano-command-button').addEventListener('click', executeCommand);
    
    // Input de comando (para pressionar Enter)
    document.getElementById('mano-command-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeCommand();
        } else if (e.key === 'ArrowUp') {
            navigateCommandHistory(-1);
        } else if (e.key === 'ArrowDown') {
            navigateCommandHistory(1);
        }
    });
    
    // Botões de ação rápida
    const actionButtons = document.querySelectorAll('.mano-action-button');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            executeAction(action);
        });
    });
}

// Alternar a visibilidade do painel lateral
function toggleSidebar() {
    const sidebar = document.getElementById('mano-sidebar');
    const toggleButton = document.getElementById('mano-toggle-button');
    
    sidebar.classList.toggle('collapsed');
    toggleButton.classList.toggle('collapsed');
}

// Executar um comando de texto
function executeCommand() {
    const commandInput = document.getElementById('mano-command-input');
    const command = commandInput.value.trim();
    
    if (!command) return;
    
    // Adicionar ao histórico de comandos
    manoState.commandHistory.unshift(command);
    manoState.currentCommandIndex = -1;
    
    // Limitar o histórico a 20 comandos
    if (manoState.commandHistory.length > 20) {
        manoState.commandHistory.pop();
    }
    
    logInfo(`Comando: ${command}`);
    
    // Processar o comando
    processCommand(command);
    
    // Limpar o input
    commandInput.value = '';
}

// Navegar pelo histórico de comandos
function navigateCommandHistory(direction) {
    const commandInput = document.getElementById('mano-command-input');
    
    // Atualizar o índice
    manoState.currentCommandIndex += direction;
    
    // Limitar o índice
    if (manoState.currentCommandIndex < -1) {
        manoState.currentCommandIndex = -1;
    } else if (manoState.currentCommandIndex >= manoState.commandHistory.length) {
        manoState.currentCommandIndex = manoState.commandHistory.length - 1;
    }
    
    // Atualizar o input
    if (manoState.currentCommandIndex === -1) {
        commandInput.value = '';
    } else {
        commandInput.value = manoState.commandHistory[manoState.currentCommandIndex];
    }
}

// Processar um comando de texto
function processCommand(command) {
    // Evitar processamento simultâneo
    if (manoState.isProcessing) {
        logError('Aguarde o processamento do comando anterior.');
        return;
    }
    
    manoState.isProcessing = true;
    
    // Comandos básicos
    if (command.toLowerCase().includes('login')) {
        executeAction('login');
    } else if (command.toLowerCase().includes('buscar') || command.toLowerCase().includes('pesquisar')) {
        const match = command.match(/buscar\s+(.+)/i) || command.match(/pesquisar\s+(.+)/i);
        if (match && match[1]) {
            searchPatient(match[1]);
        } else {
            executeAction('search');
        }
    } else if (command.toLowerCase().includes('preencher')) {
        executeAction('fill');
    } else if (command.toLowerCase().includes('enviar') || command.toLowerCase().includes('submeter')) {
        executeAction('submit');
    } else if (command.toLowerCase().includes('clicar')) {
        const match = command.match(/clicar\s+(?:em|no|na)?\s+(.+)/i);
        if (match && match[1]) {
            clickElementByText(match[1]);
        } else {
            logError('Especifique em qual elemento clicar. Ex: "clicar em Salvar"');
        }
    } else if (command.toLowerCase().includes('fluxo')) {
        const match = command.match(/fluxo\s+(.+)/i);
        if (match && match[1]) {
            executeWorkflow(match[1]);
        } else {
            showWorkflowsList();
        }
    } else if (command.toLowerCase().includes('documento') || command.toLowerCase().includes('documentos')) {
        toggleDocumentScanner();
    } else if (command.toLowerCase().includes('sisreg') || command.toLowerCase().includes('visualizar')) {
        toggleSisregViewer();
        return 'visualizar';
    } else if (command.toLowerCase().includes('interface') || command.toLowerCase().includes('unificada')) {
        if (typeof toggleUnifiedInterface === 'function') {
            toggleUnifiedInterface();
            return 'interface';
        } else {
            logError('Interface unificada não disponível. Verifique se o módulo foi carregado.');
        }
    } else if (command.toLowerCase().includes('ajuda')) {
        showHelp();
    } else {
        logError('Comando não reconhecido. Digite "ajuda" para ver os comandos disponíveis.');
    }
    
    manoState.isProcessing = false;
}

// Executar uma ação predefinida
function executeAction(action) {
    switch (action) {
        case 'login':
            logInfo('Tentando fazer login automático...');
            attemptLogin();
            break;
        case 'search':
            logInfo('Abrindo busca de paciente...');
            navigateToPatientSearch();
            break;
        case 'fill':
            logInfo('Preparando para preencher formulário...');
            prepareFormFill();
            break;
        case 'submit':
            logInfo('Preparando para enviar solicitação...');
            submitForm();
            break;
        default:
            logError(`Ação desconhecida: ${action}`);
    }
}

// Funções de automação específicas do Sisreg

// Sistema avançado de reconhecimento de elementos
const ElementFinder = {
    // Estratégias de busca para diferentes tipos de elementos
    strategies: {
        // Estratégia para campos de texto/input
        input: [
            // Por ID
            (id) => document.querySelector(`input[id="${id}"], input[id*="${id}"]`),
            // Por nome
            (name) => document.querySelector(`input[name="${name}"], input[name*="${name}"]`),
            // Por placeholder
            (placeholder) => document.querySelector(`input[placeholder*="${placeholder}" i]`),
            // Por label associada
            (labelText) => {
                const labels = Array.from(document.querySelectorAll('label'));
                for (const label of labels) {
                    if (label.textContent.toLowerCase().includes(labelText.toLowerCase())) {
                        const forAttr = label.getAttribute('for');
                        if (forAttr) return document.getElementById(forAttr);
                        
                        // Buscar input dentro da label
                        const input = label.querySelector('input');
                        if (input) return input;
                    }
                }
                return null;
            },
            // Por texto próximo
            (text) => {
                const elements = document.querySelectorAll('input');
                for (const el of elements) {
                    const parent = el.parentElement;
                    if (parent && parent.textContent.toLowerCase().includes(text.toLowerCase())) {
                        return el;
                    }
                }
                return null;
            }
        ],
        
        // Estratégia para botões
        button: [
            // Por ID
            (id) => document.querySelector(`button[id="${id}"], button[id*="${id}"], input[type="button"][id*="${id}"], input[type="submit"][id*="${id}"]`),
            // Por texto
            (text) => {
                const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn, .button, [role="button"]'));
                for (const button of buttons) {
                    if (button.textContent.toLowerCase().includes(text.toLowerCase()) || 
                        button.value?.toLowerCase().includes(text.toLowerCase())) {
                        return button;
                    }
                }
                return null;
            },
            // Por ícone (classes comuns de ícones)
            (iconClass) => document.querySelector(`button i[class*="${iconClass}"], a i[class*="${iconClass}"]`)?.closest('button, a'),
            // Por aria-label
            (label) => document.querySelector(`[aria-label*="${label}" i]`)
        ],
        
        // Estratégia para links
        link: [
            // Por href
            (href) => document.querySelector(`a[href*="${href}" i]`),
            // Por texto
            (text) => {
                const links = Array.from(document.querySelectorAll('a'));
                for (const link of links) {
                    if (link.textContent.toLowerCase().includes(text.toLowerCase())) {
                        return link;
                    }
                }
                return null;
            }
        ],
        
        // Estratégia para elementos genéricos por texto
        text: [
            (text) => {
                // Usar XPath para encontrar elementos que contêm o texto
                const xpath = `//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${text.toLowerCase()}')]`;
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue;
            }
        ]
    },
    
    // Método principal para encontrar elementos
    find: function(type, query, required = false) {
        const strategies = this.strategies[type] || this.strategies.text;
        
        for (const strategy of strategies) {
            const element = strategy(query);
            if (element) return element;
        }
        
        if (required) {
            logError(`Elemento não encontrado: ${type} "${query}"`);
        }
        
        return null;
    },
    
    // Método para encontrar múltiplos elementos
    findAll: function(type, query) {
        const results = [];
        const strategies = this.strategies[type] || this.strategies.text;
        
        for (const strategy of strategies) {
            const element = strategy(query);
            if (element) results.push(element);
        }
        
        return results;
    },
    
    // Método para encontrar elementos em uma tabela
    findInTable: function(tableQuery, rowText, columnIndex) {
        // Encontrar a tabela
        const table = this.find('text', tableQuery);
        if (!table) return null;
        
        // Procurar nas linhas
        const rows = table.querySelectorAll('tr');
        for (const row of rows) {
            if (row.textContent.toLowerCase().includes(rowText.toLowerCase())) {
                // Encontrar a célula na coluna especificada
                const cells = row.querySelectorAll('td');
                if (cells.length > columnIndex) {
                    return cells[columnIndex];
                }
            }
        }
        
        return null;
    }
};

// Tentar fazer login automático
function attemptLogin() {
    try {
        // Verificar se estamos na página de login
        const loginForm = document.querySelector('form[name="loginForm"]');
        if (!loginForm) {
            logError('Página de login não encontrada.');
            return;
        }
        
        // Verificar se há credenciais salvas
        chrome.storage.local.get(['sisregUsername', 'sisregPassword'], (result) => {
            if (result.sisregUsername && result.sisregPassword) {
                // Preencher o formulário de login usando o ElementFinder
                const usernameField = ElementFinder.find('input', 'username') || 
                                     ElementFinder.find('input', 'usuário') || 
                                     ElementFinder.find('input', 'login');
                                     
                const passwordField = ElementFinder.find('input', 'password') || 
                                     ElementFinder.find('input', 'senha');
                
                if (usernameField && passwordField) {
                    usernameField.value = result.sisregUsername;
                    passwordField.value = result.sisregPassword;
                    
                    // Disparar eventos para atualizar os campos
                    usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // Clicar no botão de login
                    setTimeout(() => {
                        const loginButton = ElementFinder.find('button', 'entrar') || 
                                           ElementFinder.find('button', 'login') ||
                                           ElementFinder.find('button', 'acessar') ||
                                           document.querySelector('input[type="submit"], button[type="submit"]');
                                           
                        if (loginButton) {
                            loginButton.click();
                            logSuccess('Login realizado com sucesso!');
                        } else {
                            logError('Botão de login não encontrado.');
                        }
                    }, 500);
                } else {
                    logError('Campos de login não encontrados.');
                }
            } else {
                logError('Credenciais não encontradas. Configure-as nas opções da extensão.');
            }
        });
    } catch (error) {
        logError(`Erro ao tentar fazer login: ${error.message}`);
    }
}

// Navegar para a busca de paciente
function navigateToPatientSearch() {
    try {
        // Tentar encontrar o link ou botão para busca de paciente
        const searchLinks = Array.from(document.querySelectorAll('a, button')).filter(el => 
            el.textContent.toLowerCase().includes('paciente') || 
            el.textContent.toLowerCase().includes('buscar') ||
            el.textContent.toLowerCase().includes('pesquisar')
        );
        
        if (searchLinks.length > 0) {
            searchLinks[0].click();
            logSuccess('Navegando para busca de paciente...');
        } else {
            logError('Link para busca de paciente não encontrado.');
        }
    } catch (error) {
        logError(`Erro ao navegar para busca de paciente: ${error.message}`);
    }
}

// Preparar para preencher formulário
function prepareFormFill() {
    logInfo('Para preencher o formulário, você pode:');
    logInfo('1. Colar dados estruturados (JSON/CSV)');
    logInfo('2. Usar comandos específicos como "preencher nome João Silva"');
    
    // Adicionar botão para colar dados
    const actionsContainer = document.getElementById('mano-actions-container');
    
    if (!document.getElementById('mano-paste-data-button')) {
        const pasteButton = document.createElement('button');
        pasteButton.id = 'mano-paste-data-button';
        pasteButton.className = 'mano-action-button';
        pasteButton.textContent = 'Colar Dados do Paciente';
        pasteButton.addEventListener('click', () => {
            // Solicitar permissão para acessar a área de transferência
            navigator.clipboard.readText()
                .then(text => {
                    try {
                        // Tentar analisar como JSON
                        const data = JSON.parse(text);
                        fillSisregForm(data);
                    } catch (e) {
                        // Se não for JSON, tratar como texto simples
                        logInfo('Dados colados como texto. Tentando extrair informações...');
                        const patientData = extractPatientData(text);
                        fillSisregForm(patientData);
                    }
                })
                .catch(err => {
                    logError(`Erro ao acessar a área de transferência: ${err.message}`);
                    logInfo('Tente colar manualmente no campo de comando e digite "preencher dados"');
                });
        });
        
        actionsContainer.appendChild(pasteButton);
    }
}

// Extrair dados do paciente de texto simples
function extractPatientData(text) {
    const patientData = {};
    
    // Tentar extrair nome
    const nameMatch = text.match(/nome:?\s*([^\n]+)/i);
    if (nameMatch) patientData.nome = nameMatch[1].trim();
    
    // Tentar extrair CNS (Cartão do SUS)
    const cnsMatch = text.match(/cns:?\s*(\d[\d\s]+)/i) || text.match(/cartão\s+do\s+sus:?\s*(\d[\d\s]+)/i);
    if (cnsMatch) patientData.cns = cnsMatch[1].replace(/\s/g, '').trim();
    
    // Tentar extrair data de nascimento
    const dobMatch = text.match(/nascimento:?\s*(\d{2}\/\d{2}\/\d{4})/i) || text.match(/data\s+de\s+nascimento:?\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (dobMatch) patientData.dataNascimento = dobMatch[1].trim();
    
    // Tentar extrair telefone
    const phoneMatch = text.match(/telefone:?\s*([\d\s\-\(\)]+)/i);
    if (phoneMatch) patientData.telefone = phoneMatch[1].trim();
    
    // Tentar extrair endereço
    const addressMatch = text.match(/endereço:?\s*([^\n]+)/i);
    if (addressMatch) patientData.endereco = addressMatch[1].trim();
    
    // Tentar extrair diagnóstico
    const diagnosisMatch = text.match(/diagnóstico:?\s*([^\n]+)/i) || text.match(/cid:?\s*([^\n]+)/i);
    if (diagnosisMatch) patientData.diagnostico = diagnosisMatch[1].trim();
    
    logInfo(`Dados extraídos: ${Object.keys(patientData).length} campos`);
    return patientData;
}

// Preencher formulário do Sisreg
function fillSisregForm(patientData) {
    try {
        logInfo('Preenchendo formulário com dados do paciente...');
        console.log('Dados do paciente:', patientData);
        
        // Mapeamento de campos (ajustar conforme a estrutura real do Sisreg)
        const fieldMappings = {
            'nome': ['input[name*="nome"]', 'input[id*="nome"]', 'input[placeholder*="nome"]'],
            'cns': ['input[name*="cns"]', 'input[id*="cns"]', 'input[name*="cartao"]', 'input[id*="cartao"]', 'input[placeholder*="cartão"]'],
            'dataNascimento': ['input[name*="nascimento"]', 'input[id*="nascimento"]', 'input[name*="data"]', 'input[type="date"]'],
            'telefone': ['input[name*="telefone"]', 'input[id*="telefone"]', 'input[name*="fone"]', 'input[id*="fone"]'],
            'endereco': ['input[name*="endereco"]', 'input[id*="endereco"]', 'textarea[name*="endereco"]', 'textarea[id*="endereco"]'],
            'diagnostico': ['input[name*="diagnostico"]', 'input[id*="diagnostico"]', 'textarea[name*="diagnostico"]', 'textarea[id*="diagnostico"]', 'input[name*="cid"]', 'input[id*="cid"]']
        };
        
        let fieldsFound = 0;
        let fieldsFilled = 0;
        
        // Para cada tipo de dado do paciente
        for (const [key, value] of Object.entries(patientData)) {
            if (!value) continue;
            
            // Tentar cada seletor possível para este tipo de campo
            const selectors = fieldMappings[key] || [];
            fieldsFound++;
            
            let fieldFound = false;
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                
                if (elements.length > 0) {
                    // Preencher o primeiro elemento encontrado
                    const element = elements[0];
                    
                    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
                        element.value = value;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        // Destacar o campo preenchido
                        element.style.backgroundColor = '#e8f8e8';
                        setTimeout(() => {
                            element.style.backgroundColor = '';
                        }, 2000);
                        
                        fieldFound = true;
                        fieldsFilled++;
                        break;
                    }
                }
            }
            
            if (!fieldFound) {
                logInfo(`Campo não encontrado: ${key}`);
            }
        }
        
        if (fieldsFilled > 0) {
            logSuccess(`Formulário preenchido com sucesso! (${fieldsFilled}/${fieldsFound} campos)`);
        } else {
            logError('Não foi possível preencher nenhum campo. Verifique se o formulário está aberto.');
        }
    } catch (error) {
        logError(`Erro ao preencher formulário: ${error.message}`);
    }
}

// Buscar paciente
function searchPatient(searchTerm) {
    try {
        logInfo(`Buscando paciente: ${searchTerm}`);
        
        // Tentar encontrar o campo de busca
        const searchFields = document.querySelectorAll('input[type="text"], input[type="search"]');
        let searchField = null;
        
        for (const field of searchFields) {
            if (field.placeholder && (
                field.placeholder.toLowerCase().includes('buscar') || 
                field.placeholder.toLowerCase().includes('pesquisar') ||
                field.placeholder.toLowerCase().includes('paciente')
            )) {
                searchField = field;
                break;
            }
        }
        
        if (!searchField) {
            // Se não encontrou pelo placeholder, tentar pelo nome/id
            for (const field of searchFields) {
                if (field.name && (
                    field.name.toLowerCase().includes('search') || 
                    field.name.toLowerCase().includes('busca') ||
                    field.name.toLowerCase().includes('paciente')
                )) {
                    searchField = field;
                    break;
                }
            }
        }
        
        if (searchField) {
            // Preencher o campo de busca
            searchField.value = searchTerm;
            searchField.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Tentar encontrar o botão de busca
            const searchButtons = Array.from(document.querySelectorAll('button, input[type="submit"]')).filter(el => 
                el.textContent.toLowerCase().includes('buscar') || 
                el.textContent.toLowerCase().includes('pesquisar') ||
                el.value?.toLowerCase().includes('buscar') ||
                el.value?.toLowerCase().includes('pesquisar')
            );
            
            if (searchButtons.length > 0) {
                setTimeout(() => {
                    searchButtons[0].click();
                    logSuccess('Busca iniciada!');
                }, 500);
            } else {
                // Se não encontrou o botão, tentar pressionar Enter no campo
                searchField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
                logInfo('Pressionar Enter para buscar (botão não encontrado)');
            }
        } else {
            logError('Campo de busca não encontrado.');
        }
    } catch (error) {
        logError(`Erro ao buscar paciente: ${error.message}`);
    }
}

// Enviar formulário
function submitForm() {
    try {
        logInfo('Tentando enviar formulário...');
        
        // Tentar encontrar o botão de envio
        const submitButtons = Array.from(document.querySelectorAll('button, input[type="submit"]')).filter(el => 
            el.textContent.toLowerCase().includes('enviar') || 
            el.textContent.toLowerCase().includes('salvar') ||
            el.textContent.toLowerCase().includes('confirmar') ||
            el.value?.toLowerCase().includes('enviar') ||
            el.value?.toLowerCase().includes('salvar') ||
            el.value?.toLowerCase().includes('confirmar')
        );
        
        if (submitButtons.length > 0) {
            // Confirmar antes de enviar
            if (confirm('Tem certeza que deseja enviar o formulário?')) {
                submitButtons[0].click();
                logSuccess('Formulário enviado!');
            } else {
                logInfo('Envio cancelado pelo usuário.');
            }
        } else {
            logError('Botão de envio não encontrado.');
        }
    } catch (error) {
        logError(`Erro ao enviar formulário: ${error.message}`);
    }
}

// Clicar em um elemento pelo texto
function clickElementByText(text) {
    try {
        logInfo(`Procurando elemento com texto: "${text}"`);
        
        // Função para verificar se um elemento contém o texto
        const containsText = (element, searchText) => {
            return element.textContent.toLowerCase().includes(searchText.toLowerCase());
        };
        
        // Procurar em links, botões e outros elementos clicáveis
        const elements = Array.from(document.querySelectorAll('a, button, input[type="button"], input[type="submit"], [role="button"], .btn'));
        const matchingElements = elements.filter(el => containsText(el, text));
        
        if (matchingElements.length > 0) {
            const element = matchingElements[0];
            
            // Adicionar feedback visual se disponível
            if (manoState.visualFeedback) {
                manoState.visualFeedback.animateClick(element);
                
                // Pequeno atraso para visualizar a animação antes do clique real
                setTimeout(() => {
                    element.click();
                    logSuccess(`Clicado em elemento: "${element.textContent.trim()}"`);
                }, 300);
            } else {
                // Clicar no primeiro elemento encontrado sem animação
                element.click();
                logSuccess(`Clicado em elemento: "${element.textContent.trim()}"`);
            }
        } else {
            logError(`Nenhum elemento encontrado com o texto: "${text}"`);
        }
    } catch (error) {
        logError(`Erro ao clicar no elemento: ${error.message}`);
    }
}

// Mostrar ajuda
function showHelp() {
    logInfo('=== Comandos Disponíveis ===');
    logInfo('- login: Fazer login automático');
    logInfo('- buscar [termo]: Buscar paciente');
    logInfo('- preencher: Preparar para preencher formulário');
    logInfo('- clicar em [texto]: Clicar em elemento com texto específico');
    logInfo('- enviar: Enviar formulário atual');
    logInfo('- fluxo [nome]: Executar um fluxo automatizado');
    logInfo('- fluxo: Listar fluxos automatizados disponíveis');
    logInfo('- documentos: Abrir o gerenciador de documentos');
    logInfo('- sisreg: Abrir o visualizador do Sisreg');
    logInfo('- interface: Abrir a interface unificada');
    logInfo('- ajuda: Mostrar esta ajuda');
}

// Mostrar lista de fluxos automatizados
function showWorkflowsList() {
    if (!manoState.workflows) {
        logError('Sistema de fluxos automatizados não disponível');
        return;
    }
    
    const workflows = manoState.workflows.getAvailableWorkflows();
    
    if (workflows.length === 0) {
        logInfo('Nenhum fluxo automatizado disponível');
        return;
    }
    
    logInfo('Fluxos automatizados disponíveis:');
    
    workflows.forEach(workflow => {
        logInfo(`- ${workflow} (digite: fluxo ${workflow})`);
    });
}

// Executar fluxo automatizado
function executeWorkflow(workflowName) {
    if (!manoState.workflows) {
        logError('Sistema de fluxos automatizados não disponível');
        return;
    }
    
    logInfo(`Executando fluxo automatizado: ${workflowName}`);
    
    manoState.workflows.executeWorkflow(workflowName)
        .then(success => {
            if (success) {
                logSuccess(`Fluxo automatizado '${workflowName}' concluído com sucesso`);
            } else {
                logError(`Erro ao executar fluxo automatizado '${workflowName}'`);
            }
        })
        .catch(error => {
            logError(`Erro ao executar fluxo automatizado: ${error.message}`);
        });
}

// Funções de log
function logInfo(message) {
    addLogEntry(message, 'info');
}

function logSuccess(message) {
    addLogEntry(message, 'success');
}

function logError(message) {
    addLogEntry(message, 'error');
}

function addLogEntry(message, type) {
    const logContainer = document.getElementById('mano-log-container');
    
    if (!logContainer) return;
    
    const entry = document.createElement('div');
    entry.className = `mano-log-entry mano-log-${type}`;
    
    // Adicionar timestamp
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    entry.textContent = `[${timestamp}] ${message}`;
    
    // Adicionar ao início do log
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Limitar o número de entradas de log (manter as 100 mais recentes)
    const entries = logContainer.querySelectorAll('.mano-log-entry');
    if (entries.length > 100) {
        logContainer.removeChild(entries[entries.length - 1]);
    }
    
    // Adicionar ao estado
    manoState.logEntries.unshift({ message, type, timestamp });
    if (manoState.logEntries.length > 100) {
        manoState.logEntries.pop();
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        fillSisregForm(request.data);
        sendResponse({ success: true, message: 'Formulário preenchido!' });
    } else if (request.action === 'clickElement') {
        clickElementByText(request.text);
        sendResponse({ success: true, message: 'Comando de clique executado!' });
    } else if (request.action === 'executeCommand') {
        processCommand(request.command);
        sendResponse({ success: true, message: 'Comando executado!' });
    } else if (request.action === 'getStatus') {
        sendResponse({ 
            success: true, 
            isActive: manoState.isActive,
            logEntries: manoState.logEntries.slice(0, 10) // Enviar apenas as 10 entradas mais recentes
        });
    }
    return true; // Indica que a resposta pode ser assíncrona
});

// Inicializar o assistente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManoAssistant);
} else {
    initManoAssistant();
}

// Inicializar o sistema de reconhecimento de voz
function initializeVoiceRecognition() {
    // Verificar se o navegador suporta reconhecimento de voz
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        logError('Seu navegador não suporta reconhecimento de voz.');
        return false;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript.trim();
        logInfo(`Comando de voz: ${command}`);
        processCommand(command);
    };
    
    recognition.onerror = function(event) {
        logError(`Erro no reconhecimento de voz: ${event.error}`);
    };
    
    // Adicionar botão de voz
    const actionsContainer = document.getElementById('mano-actions-container');
    if (actionsContainer && !document.getElementById('mano-voice-button')) {
        const voiceButton = document.createElement('button');
        voiceButton.id = 'mano-voice-button';
        voiceButton.className = 'mano-action-button';
        voiceButton.innerHTML = '🎤 Comando de Voz';
        voiceButton.addEventListener('click', function() {
            try {
                recognition.start();
                logInfo('Reconhecimento de voz ativado. Fale um comando...');
                voiceButton.disabled = true;
                setTimeout(() => {
                    voiceButton.disabled = false;
                }, 5000);
            } catch (e) {
                logError(`Erro ao iniciar reconhecimento de voz: ${e.message}`);
            }
        });
        actionsContainer.appendChild(voiceButton);
    }
    
    return true;
}

// Observe changes in the page to provide real-time assistance
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // Check for specific elements that appear during Sisreg workflows
            // This could be used to provide contextual assistance
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});