/**
 * Mano - Fluxos Automatizados para Processos de Regulação
 * Este módulo implementa fluxos de trabalho automatizados para processos comuns no Sisreg
 */

class WorkflowAutomation {
    constructor() {
        this.workflows = {
            // Fluxo de nova solicitação
            'nova_solicitacao': [
                { action: 'click', params: { text: 'Nova Solicitação' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'fill', params: { form: 'solicitacao' } },
                { action: 'wait', params: { time: 500 } },
                { action: 'submit' }
            ],
            
            // Fluxo de busca e regulação
            'regular_paciente': [
                { action: 'click', params: { text: 'Regulação' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'search', params: { type: 'paciente' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'click', params: { text: 'Visualizar' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'fill', params: { form: 'regulacao' } },
                { action: 'wait', params: { time: 500 } },
                { action: 'submit' }
            ],
            
            // Fluxo de autorização
            'autorizar': [
                { action: 'click', params: { text: 'Autorização' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'search', params: { type: 'pendentes' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'click', params: { text: 'Autorizar' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'fill', params: { form: 'autorizacao' } },
                { action: 'wait', params: { time: 500 } },
                { action: 'submit' }
            ],
            
            // Fluxo de consulta de histórico
            'historico': [
                { action: 'click', params: { text: 'Consultas' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'click', params: { text: 'Histórico' } },
                { action: 'wait', params: { time: 1000 } },
                { action: 'search', params: { type: 'historico' } },
                { action: 'wait', params: { time: 1000 } }
            ]
        };
    }

    // Obter lista de fluxos disponíveis
    getAvailableWorkflows() {
        return Object.keys(this.workflows);
    }

    // Executar um fluxo de trabalho
    async executeWorkflow(workflowName, customParams = {}) {
        if (!this.workflows[workflowName]) {
            console.error(`Fluxo de trabalho '${workflowName}' não encontrado`);
            return false;
        }
        
        console.log(`Iniciando fluxo de trabalho: ${workflowName}`);
        
        // Obter os passos do fluxo
        const steps = this.workflows[workflowName];
        
        // Executar cada passo sequencialmente
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.log(`Executando passo ${i+1}/${steps.length}: ${step.action}`);
            
            // Mesclar parâmetros personalizados com os padrões
            const params = { ...step.params, ...customParams };
            
            try {
                await this.executeStep(step.action, params);
            } catch (error) {
                console.error(`Erro ao executar passo ${i+1} (${step.action}):`, error);
                return false;
            }
        }
        
        console.log(`Fluxo de trabalho '${workflowName}' concluído com sucesso`);
        return true;
    }

    // Executar um passo individual
    async executeStep(action, params) {
        return new Promise((resolve, reject) => {
            switch (action) {
                case 'click':
                    if (params.text) {
                        window.clickElementByText(params.text);
                        resolve();
                    } else if (params.selector) {
                        const element = document.querySelector(params.selector);
                        if (element) {
                            element.click();
                            resolve();
                        } else {
                            reject(new Error(`Elemento não encontrado: ${params.selector}`));
                        }
                    } else {
                        reject(new Error('Parâmetros insuficientes para ação de clique'));
                    }
                    break;
                    
                case 'fill':
                    if (params.form) {
                        window.fillForm(params.data);
                        resolve();
                    } else {
                        reject(new Error('Parâmetros insuficientes para ação de preenchimento'));
                    }
                    break;
                    
                case 'search':
                    if (params.type === 'paciente' && params.name) {
                        window.searchPatient(params.name);
                        resolve();
                    } else if (params.type && !params.name) {
                        // Busca genérica por tipo
                        window.executeSearch(params.type, params.criteria);
                        resolve();
                    } else {
                        reject(new Error('Parâmetros insuficientes para ação de busca'));
                    }
                    break;
                    
                case 'submit':
                    window.submitForm();
                    resolve();
                    break;
                    
                case 'wait':
                    const waitTime = params.time || 1000;
                    setTimeout(resolve, waitTime);
                    break;
                    
                default:
                    reject(new Error(`Ação desconhecida: ${action}`));
            }
        });
    }

    // Criar um novo fluxo personalizado
    createCustomWorkflow(name, steps) {
        if (this.workflows[name]) {
            console.warn(`Substituindo fluxo de trabalho existente: ${name}`);
        }
        
        this.workflows[name] = steps;
        
        // Salvar fluxos personalizados no armazenamento local
        this.saveCustomWorkflows();
        
        return true;
    }

    // Salvar fluxos personalizados
    saveCustomWorkflows() {
        // Filtrar apenas fluxos personalizados
        const customWorkflows = {};
        Object.keys(this.workflows).forEach(key => {
            if (!['nova_solicitacao', 'regular_paciente', 'autorizar', 'historico'].includes(key)) {
                customWorkflows[key] = this.workflows[key];
            }
        });
        
        // Salvar no armazenamento local
        chrome.storage.local.set({ 'mano_custom_workflows': customWorkflows }, function() {
            console.log('Fluxos de trabalho personalizados salvos');
        });
    }

    // Carregar fluxos personalizados
    loadCustomWorkflows() {
        return new Promise((resolve) => {
            chrome.storage.local.get('mano_custom_workflows', (result) => {
                if (result.mano_custom_workflows) {
                    // Mesclar fluxos personalizados com os padrões
                    Object.keys(result.mano_custom_workflows).forEach(key => {
                        this.workflows[key] = result.mano_custom_workflows[key];
                    });
                    console.log('Fluxos de trabalho personalizados carregados');
                }
                resolve();
            });
        });
    }
}

// Exportar o sistema de automação de fluxos
window.WorkflowAutomation = WorkflowAutomation;