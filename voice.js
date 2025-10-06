/**
 * Mano - Sistema de Reconhecimento de Voz
 * Este módulo implementa funcionalidades de reconhecimento de voz para o assistente Mano
 */

class VoiceRecognitionSystem {
    constructor() {
        // Verificar se o navegador suporta reconhecimento de voz
        this.recognition = null;
        this.isListening = false;
        this.commandCallback = null;
        this.initializeRecognition();
    }

    // Inicializar o sistema de reconhecimento de voz
    initializeRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.setupRecognition();
            console.log('Sistema de reconhecimento de voz inicializado com sucesso');
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
            this.setupRecognition();
            console.log('Sistema de reconhecimento de voz inicializado com sucesso');
        } else {
            console.error('Reconhecimento de voz não é suportado neste navegador');
            return false;
        }
        return true;
    }

    // Configurar o reconhecimento de voz
    setupRecognition() {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'pt-BR';
        
        // Evento quando um resultado é reconhecido
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            console.log('Comando de voz reconhecido:', transcript);
            
            if (this.commandCallback) {
                this.commandCallback(transcript);
            }
        };
        
        // Eventos de erro e fim
        this.recognition.onerror = (event) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            this.isListening = false;
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Reconhecimento de voz finalizado');
        };
    }

    // Iniciar o reconhecimento de voz
    startListening(callback) {
        if (!this.recognition) {
            console.error('Sistema de reconhecimento de voz não inicializado');
            return false;
        }
        
        if (this.isListening) {
            this.stopListening();
        }
        
        this.commandCallback = callback;
        
        try {
            this.recognition.start();
            this.isListening = true;
            console.log('Reconhecimento de voz iniciado. Aguardando comando...');
            return true;
        } catch (error) {
            console.error('Erro ao iniciar reconhecimento de voz:', error);
            return false;
        }
    }

    // Parar o reconhecimento de voz
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            console.log('Reconhecimento de voz interrompido');
            return true;
        }
        return false;
    }

    // Processar comandos de voz
    processVoiceCommand(command) {
        // Comandos básicos
        if (command.includes('login') || command.includes('entrar')) {
            return { action: 'login' };
        }
        
        if (command.includes('buscar') || command.includes('procurar')) {
            const nameMatch = command.match(/(?:buscar|procurar)\s+(?:paciente\s+)?(.+)/i);
            if (nameMatch && nameMatch[1]) {
                return { action: 'search', params: { name: nameMatch[1] } };
            }
        }
        
        if (command.includes('preencher')) {
            return { action: 'fill' };
        }
        
        if (command.includes('enviar') || command.includes('submeter') || command.includes('confirmar')) {
            return { action: 'submit' };
        }
        
        if (command.includes('clicar') || command.includes('selecionar')) {
            const textMatch = command.match(/(?:clicar|selecionar)\s+(?:em\s+)?(.+)/i);
            if (textMatch && textMatch[1]) {
                return { action: 'click', params: { text: textMatch[1] } };
            }
        }
        
        if (command.includes('documento') || command.includes('documentos')) {
            return { action: 'documentos' };
        }
        
        if (command.includes('ajuda') || command.includes('comandos')) {
            return { action: 'help' };
        }
        
        // Comandos de controle do assistente
        if (command.includes('mostrar') || command.includes('exibir')) {
            return { action: 'show' };
        }
        
        if (command.includes('ocultar') || command.includes('esconder')) {
            return { action: 'hide' };
        }
        
        // Comando não reconhecido
        return { action: 'unknown', params: { command } };
    }
}

// Exportar o sistema de reconhecimento de voz
window.VoiceRecognitionSystem = VoiceRecognitionSystem;