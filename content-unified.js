// Função para inicializar a interface unificada
function initializeUnifiedInterface() {
    // Carregar o script da interface unificada
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('unified-interface.js');
    script.onload = function() {
        // Inicializar a interface unificada após o carregamento do script
        manoState.unifiedInterface = new UnifiedInterface();
        manoState.unifiedInterface.initialize();
        
        logMessage('Interface unificada inicializada', 'info');
    };
    document.head.appendChild(script);
}

// Sobrescrever a função de log para enviar mensagens para a interface unificada
const originalLogMessage = logMessage;
logMessage = function(message, level) {
    // Chamar a função original
    originalLogMessage(message, level);
    
    // Enviar para a interface unificada
    if (manoState.unifiedInterface) {
        manoState.unifiedInterface.sendLog(message, level);
    }
};

// Adicionar comando para abrir a interface unificada
function toggleUnifiedInterface() {
    console.log('Tentando alternar a interface unificada');
    if (manoState.unifiedInterface) {
        console.log('Interface unificada encontrada, alternando visibilidade');
        manoState.unifiedInterface.toggle();
        logMessage('Interface unificada ' + (manoState.unifiedInterface.isVisible ? 'exibida' : 'ocultada'), 'info');
    } else {
        console.error('Interface unificada não está disponível');
        logMessage('Interface unificada não está disponível. Tentando reinicializar...', 'warning');
        // Tentar reinicializar
        initializeUnifiedInterface();
        // Tentar novamente após um tempo
        setTimeout(() => {
            if (manoState.unifiedInterface) {
                manoState.unifiedInterface.toggle();
                logMessage('Interface unificada reinicializada e exibida', 'success');
            } else {
                logMessage('Não foi possível inicializar a interface unificada', 'error');
            }
        }, 1000);
    }
}

// Adicionar o comando à lista de comandos
const originalProcessCommand = processCommand;
processCommand = function(command) {
    // Converter para minúsculas para facilitar o processamento
    const lowerCommand = command.toLowerCase().trim();
    
    // Verificar se é o comando de interface unificada
    if (lowerCommand === 'interface' || lowerCommand === 'unificada') {
        toggleUnifiedInterface();
        return;
    }
    
    // Chamar a função original para outros comandos
    originalProcessCommand(command);
};

// Adicionar o comando à ajuda
const originalShowHelp = showHelp;
showHelp = function() {
    // Chamar a função original
    originalShowHelp();
    
    // Adicionar o comando de interface unificada
    logMessage('- interface: Abrir a interface unificada', 'info');
};