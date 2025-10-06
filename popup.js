// Mano - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const saveButton = document.getElementById('save-button');
    const statusMessage = document.getElementById('status-message');
    const openSisregButton = document.getElementById('open-sisreg');
    const sendCommandButton = document.getElementById('send-command');
    
    // Carregar credenciais salvas
    chrome.storage.local.get(['sisregUsername', 'sisregPassword'], function(result) {
        if (result.sisregUsername) {
            usernameInput.value = result.sisregUsername;
        }
        if (result.sisregPassword) {
            passwordInput.value = result.sisregPassword;
        }
    });
    
    // Salvar credenciais
    saveButton.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showStatus('Preencha usuário e senha!', 'error');
            return;
        }
        
        chrome.storage.local.set({
            sisregUsername: username,
            sisregPassword: password
        }, function() {
            showStatus('Credenciais salvas com sucesso!', 'success');
        });
    });
    
    // Abrir Sisreg
    openSisregButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://sisregiii.saude.gov.br/cgi-bin/index#' });
    });
    
    // Enviar comando
    sendCommandButton.addEventListener('click', function() {
        // Abrir modal para digitar comando
        const command = prompt('Digite o comando para o assistente:');
        
        if (!command) return;
        
        // Enviar comando para a aba ativa
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                showStatus('Nenhuma aba ativa encontrada!', 'error');
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'executeCommand',
                command: command
            }, function(response) {
                if (chrome.runtime.lastError) {
                    showStatus('Erro ao enviar comando: ' + chrome.runtime.lastError.message, 'error');
                    return;
                }
                
                if (response && response.success) {
                    showStatus('Comando enviado com sucesso!', 'success');
                } else {
                    showStatus('Erro ao executar comando!', 'error');
                }
            });
        });
    });
    
    // Função para mostrar mensagem de status
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status ' + type;
        statusMessage.style.display = 'block';
        
        // Esconder a mensagem após 3 segundos
        setTimeout(function() {
            statusMessage.style.display = 'none';
        }, 3000);
    }
    
    // Verificar status do assistente na aba atual
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'getStatus'
            }, function(response) {
                // Ignorar erros se o assistente não estiver ativo na página atual
                if (chrome.runtime.lastError) {
                    return;
                }
                
                if (response && response.success) {
                    // Mostrar status do assistente
                    if (response.isActive) {
                        showStatus('Assistente ativo na página atual!', 'success');
                    }
                    
                    // Mostrar logs recentes
                    if (response.logEntries && response.logEntries.length > 0) {
                        const latestLog = response.logEntries[0];
                        showStatus(`Última ação: ${latestLog.message}`, latestLog.type);
                    }
                }
            });
        }
    });
});