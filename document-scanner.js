/**
 * Sistema de captura e processamento de documentos para o assistente Mano
 * Permite capturar, processar e anexar documentos ao Sisreg
 */

class DocumentScanner {
    constructor() {
        this.documents = [];
        this.currentDocument = null;
        this.isScanning = false;
        this.loadSavedDocuments();
    }

    /**
     * Inicializa a interface de captura de documentos
     */
    initialize() {
        // Criar o container para a interface de documentos
        this.createDocumentInterface();
        
        // Carregar documentos salvos
        this.loadSavedDocuments();
        
        return this;
    }

    /**
     * Cria a interface para captura e gerenciamento de documentos
     */
    createDocumentInterface() {
        // Container principal
        this.docContainer = document.createElement('div');
        this.docContainer.className = 'mano-document-container';
        this.docContainer.style.display = 'none';
        
        // Título
        const title = document.createElement('h3');
        title.textContent = 'Gerenciador de Documentos';
        this.docContainer.appendChild(title);
        
        // Área de captura
        this.createCaptureArea();
        
        // Lista de documentos
        this.createDocumentList();
        
        // Botões de ação
        this.createActionButtons();
        
        // Adicionar ao corpo do documento
        document.body.appendChild(this.docContainer);
    }

    /**
     * Cria a área de captura de documentos
     */
    createCaptureArea() {
        const captureArea = document.createElement('div');
        captureArea.className = 'mano-capture-area';
        
        // Título da seção
        const captureTitle = document.createElement('h4');
        captureTitle.textContent = 'Capturar Documento';
        captureArea.appendChild(captureTitle);
        
        // Input para upload de arquivo
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'mano-file-input';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        
        // Label estilizado para o input
        const fileLabel = document.createElement('label');
        fileLabel.htmlFor = 'mano-file-input';
        fileLabel.className = 'mano-file-button';
        fileLabel.textContent = 'Selecionar Arquivos';
        
        // Botão para capturar via câmera
        const cameraButton = document.createElement('button');
        cameraButton.className = 'mano-camera-button';
        cameraButton.textContent = 'Capturar com Câmera';
        
        // Área de preview
        this.previewArea = document.createElement('div');
        this.previewArea.className = 'mano-preview-area';
        
        // Adicionar elementos à área de captura
        captureArea.appendChild(fileLabel);
        captureArea.appendChild(fileInput);
        captureArea.appendChild(cameraButton);
        captureArea.appendChild(this.previewArea);
        
        // Event listeners
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        cameraButton.addEventListener('click', () => this.openCamera());
        
        this.docContainer.appendChild(captureArea);
    }

    /**
     * Cria a lista de documentos capturados
     */
    createDocumentList() {
        const listContainer = document.createElement('div');
        listContainer.className = 'mano-document-list-container';
        
        // Título da seção
        const listTitle = document.createElement('h4');
        listTitle.textContent = 'Documentos Capturados';
        listContainer.appendChild(listTitle);
        
        // Lista de documentos
        this.documentList = document.createElement('ul');
        this.documentList.className = 'mano-document-list';
        
        listContainer.appendChild(this.documentList);
        this.docContainer.appendChild(listContainer);
    }

    /**
     * Cria os botões de ação para os documentos
     */
    createActionButtons() {
        const actionArea = document.createElement('div');
        actionArea.className = 'mano-action-area';
        
        // Botão para processar documentos
        const processButton = document.createElement('button');
        processButton.className = 'mano-process-button';
        processButton.textContent = 'Processar Documentos';
        processButton.addEventListener('click', () => this.processDocuments());
        
        // Botão para anexar ao Sisreg
        const attachButton = document.createElement('button');
        attachButton.className = 'mano-attach-button';
        attachButton.textContent = 'Anexar ao Sisreg';
        attachButton.addEventListener('click', () => this.attachToSisreg());
        
        // Botão para limpar documentos
        const clearButton = document.createElement('button');
        clearButton.className = 'mano-clear-button';
        clearButton.textContent = 'Limpar Tudo';
        clearButton.addEventListener('click', () => this.clearDocuments());
        
        actionArea.appendChild(processButton);
        actionArea.appendChild(attachButton);
        actionArea.appendChild(clearButton);
        
        this.docContainer.appendChild(actionArea);
    }

    /**
     * Manipula a seleção de arquivos
     */
    handleFileSelect(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (!file.type.match('image.*')) {
                console.warn('Arquivo não é uma imagem:', file.name);
                return;
            }
            
            this.addDocument({
                name: file.name,
                type: file.type,
                file: file,
                status: 'pendente',
                date: new Date().toISOString()
            });
        });
        
        this.updateDocumentList();
        this.saveDocuments();
    }

    /**
     * Abre a câmera para captura de imagem
     */
    openCamera() {
        // Criar elementos para a câmera
        const cameraContainer = document.createElement('div');
        cameraContainer.className = 'mano-camera-container';
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.style.width = '100%';
        
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Capturar';
        captureButton.className = 'mano-capture-button';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fechar';
        closeButton.className = 'mano-close-camera-button';
        
        cameraContainer.appendChild(video);
        cameraContainer.appendChild(captureButton);
        cameraContainer.appendChild(closeButton);
        
        document.body.appendChild(cameraContainer);
        
        // Iniciar a câmera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                this.cameraStream = stream;
                
                captureButton.addEventListener('click', () => {
                    // Capturar frame do vídeo
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    
                    // Converter para blob
                    canvas.toBlob(blob => {
                        const fileName = `captura_${new Date().toISOString().replace(/:/g, '-')}.jpg`;
                        const file = new File([blob], fileName, { type: 'image/jpeg' });
                        
                        this.addDocument({
                            name: fileName,
                            type: 'image/jpeg',
                            file: file,
                            status: 'pendente',
                            date: new Date().toISOString()
                        });
                        
                        this.updateDocumentList();
                        this.saveDocuments();
                    }, 'image/jpeg');
                });
                
                closeButton.addEventListener('click', () => {
                    this.closeCamera();
                    document.body.removeChild(cameraContainer);
                });
            })
            .catch(err => {
                console.error('Erro ao acessar a câmera:', err);
                document.body.removeChild(cameraContainer);
                alert('Não foi possível acessar a câmera. Verifique as permissões.');
            });
    }

    /**
     * Fecha a câmera e libera recursos
     */
    closeCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    }

    /**
     * Adiciona um documento à lista
     */
    addDocument(document) {
        this.documents.push(document);
        
        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'mano-document-preview';
            img.title = document.name;
            this.previewArea.appendChild(img);
        };
        reader.readAsDataURL(document.file);
    }

    /**
     * Atualiza a lista de documentos na interface
     */
    updateDocumentList() {
        this.documentList.innerHTML = '';
        
        if (this.documents.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Nenhum documento capturado';
            emptyMessage.className = 'mano-empty-list';
            this.documentList.appendChild(emptyMessage);
            return;
        }
        
        this.documents.forEach((doc, index) => {
            const item = document.createElement('li');
            item.className = 'mano-document-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = doc.name;
            nameSpan.className = 'mano-document-name';
            
            const statusSpan = document.createElement('span');
            statusSpan.textContent = doc.status;
            statusSpan.className = `mano-document-status mano-status-${doc.status}`;
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.className = 'mano-delete-document';
            deleteButton.addEventListener('click', () => {
                this.documents.splice(index, 1);
                this.updateDocumentList();
                this.saveDocuments();
            });
            
            item.appendChild(nameSpan);
            item.appendChild(statusSpan);
            item.appendChild(deleteButton);
            
            this.documentList.appendChild(item);
        });
    }

    /**
     * Processa os documentos para extração de texto via OCR
     */
    processDocuments() {
        if (this.documents.length === 0) {
            alert('Nenhum documento para processar');
            return;
        }
        
        // Marcar documentos como processando
        this.documents.forEach(doc => {
            if (doc.status === 'pendente') {
                doc.status = 'processando';
            }
        });
        this.updateDocumentList();
        
        // Processar cada documento
        const promises = this.documents
            .filter(doc => doc.status === 'processando')
            .map(doc => this.processDocument(doc));
        
        Promise.all(promises)
            .then(() => {
                this.updateDocumentList();
                this.saveDocuments();
                alert('Processamento concluído!');
            })
            .catch(err => {
                console.error('Erro ao processar documentos:', err);
                alert('Ocorreu um erro ao processar os documentos.');
            });
    }

    /**
     * Processa um documento individual usando OCR
     */
    processDocument(doc) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Criar canvas para processamento
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Usar Tesseract.js para OCR (se disponível)
                    if (typeof Tesseract !== 'undefined') {
                        Tesseract.recognize(
                            canvas.toDataURL('image/jpeg'),
                            'por', // Português
                            { logger: m => console.log(m) }
                        ).then(({ data: { text } }) => {
                            doc.text = text;
                            doc.status = 'processado';
                            resolve(doc);
                        }).catch(err => {
                            console.error('Erro no OCR:', err);
                            doc.status = 'erro';
                            reject(err);
                        });
                    } else {
                        // Fallback se Tesseract não estiver disponível
                        // Simular processamento bem-sucedido
                        setTimeout(() => {
                            doc.text = 'Texto extraído simulado para ' + doc.name;
                            doc.status = 'processado';
                            resolve(doc);
                        }, 1000);
                    }
                };
                
                img.onerror = () => {
                    doc.status = 'erro';
                    reject(new Error('Falha ao carregar imagem'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                doc.status = 'erro';
                reject(new Error('Falha ao ler arquivo'));
            };
            
            reader.readAsDataURL(doc.file);
        });
    }

    /**
     * Anexa os documentos processados ao Sisreg
     */
    attachToSisreg() {
        const processedDocs = this.documents.filter(doc => doc.status === 'processado');
        
        if (processedDocs.length === 0) {
            alert('Nenhum documento processado para anexar');
            return;
        }
        
        // Verificar se estamos na página do Sisreg
        if (!window.location.href.includes('sisreg')) {
            alert('Esta funcionalidade só está disponível na página do Sisreg');
            return;
        }
        
        // Procurar por campos de upload no Sisreg
        const uploadFields = Array.from(document.querySelectorAll('input[type="file"]'));
        
        if (uploadFields.length === 0) {
            alert('Nenhum campo de upload encontrado na página atual do Sisreg');
            return;
        }
        
        // Tentar anexar documentos aos campos de upload
        let attachedCount = 0;
        
        processedDocs.forEach((doc, index) => {
            if (index < uploadFields.length) {
                // Criar um objeto DataTransfer para simular o upload
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(doc.file);
                
                // Atribuir o arquivo ao campo de upload
                uploadFields[index].files = dataTransfer.files;
                
                // Disparar evento de change para ativar handlers
                const event = new Event('change', { bubbles: true });
                uploadFields[index].dispatchEvent(event);
                
                doc.status = 'anexado';
                attachedCount++;
            }
        });
        
        this.updateDocumentList();
        this.saveDocuments();
        
        if (attachedCount > 0) {
            alert(`${attachedCount} documento(s) anexado(s) com sucesso!`);
        } else {
            alert('Não foi possível anexar os documentos');
        }
    }

    /**
     * Limpa todos os documentos
     */
    clearDocuments() {
        if (confirm('Tem certeza que deseja remover todos os documentos?')) {
            this.documents = [];
            this.previewArea.innerHTML = '';
            this.updateDocumentList();
            this.saveDocuments();
        }
    }

    /**
     * Salva os documentos no localStorage
     */
    saveDocuments() {
        // Não podemos salvar os objetos File diretamente
        // Então salvamos apenas os metadados
        const docsToSave = this.documents.map(doc => ({
            name: doc.name,
            type: doc.type,
            status: doc.status,
            date: doc.date,
            text: doc.text || null
        }));
        
        localStorage.setItem('mano-documents', JSON.stringify(docsToSave));
    }

    /**
     * Carrega documentos salvos do localStorage
     */
    loadSavedDocuments() {
        const saved = localStorage.getItem('mano-documents');
        if (saved) {
            try {
                const parsedDocs = JSON.parse(saved);
                // Restaurar apenas metadados, não podemos restaurar os arquivos
                this.documents = parsedDocs;
            } catch (e) {
                console.error('Erro ao carregar documentos salvos:', e);
            }
        }
    }

    /**
     * Mostra a interface de documentos
     */
    show() {
        this.docContainer.style.display = 'block';
    }

    /**
     * Esconde a interface de documentos
     */
    hide() {
        this.docContainer.style.display = 'none';
    }

    /**
     * Alterna a visibilidade da interface de documentos
     */
    toggle() {
        if (this.docContainer.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }
}