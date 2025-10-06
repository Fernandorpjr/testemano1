# Mano - Extensão de Navegador para Automação Sisreg

Uma extensão de navegador que permite ao assistente Mano interagir diretamente com o sistema Sisreg III, superando as limitações de segurança das iframes.

## Descrição

Esta extensão de navegador permite que o assistente Mano execute ações reais no sistema Sisreg III, como preencher formulários, clicar em botões e navegar pelo sistema. Diferentemente da versão anterior que apenas simulava essas ações, esta extensão pode interagir diretamente com os elementos da página do Sisreg.

## Funcionalidades

### Automação Real do Sisreg
- **Preenchimento de Formulários**: Preenchimento automático de dados do paciente nos formulários do Sisreg
- **Navegação Inteligente**: Clique automático em menus e botões do sistema
- **Busca de Pacientes**: Localização e seleção automática de pacientes
- **Agendamento de Consultas**: Automatização completa do processo de agendamento

### Scanner de Documentos (OCR)
- **Captura de Documentos**: Upload de imagens via arrastar e soltar ou seleção de arquivo
- **Processamento OCR Real**: Utilização do Tesseract.js para reconhecimento de texto
- **Extração Automática de Dados**: Identificação inteligente de informações do paciente:
  - Nome completo
  - Cartão Nacional de Saúde (CNS)
  - Data de nascimento
  - Telefone
  - Procedimento solicitado
- **Visualização de Texto**: Exibição do texto extraído com opção de cópia

### Integração com OCR
- **Processamento de Documentos**: Integração com o módulo OCR para extrair dados de documentos
- **Armazenamento Local**: Armazenamento seguro dos dados do paciente no navegador
- **Interface de Usuário**: Popup intuitivo para controle das funcionalidades

## Estrutura do Projeto

```
mano-browser-extension/
├── manifest.json     # Manifesto da extensão
├── popup.html        # Interface do popup
├── popup.js          # Lógica do popup
├── content.js        # Script de conteúdo que roda no Sisreg
├── content.css       # Estilos para o script de conteúdo
├── ocr.html          # Interface do scanner OCR
├── ocr.js            # Lógica do scanner OCR
└── README.md         # Este arquivo
```

## Como Instalar

1. **Habilitar Modo Desenvolvedor**:
   - Abra o Chrome/Edge
   - Acesse `chrome://extensions/` ou `edge://extensions/`
   - Ative o "Modo desenvolvedor"

2. **Carregar Extensão**:
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `mano-browser-extension`

3. **Configurar Permissões**:
   - A extensão pedirá permissão para acessar o Sisreg
   - Clique em "Permitir" para conceder acesso

## Como Usar

1. **Abrir o Sisreg**:
   - Navegue para https://sisregiii.saude.gov.br/

2. **Abrir o Popup**:
   - Clique no ícone da extensão Mano na barra de ferramentas do navegador

3. **Escanear Documento**:
   - Clique no botão "Escanear Documento" no popup
   - Na nova aba, clique na área de upload e selecione um arquivo, ou arraste e solte uma imagem
   - O OCR será processado automaticamente e os dados do paciente serão extraídos

4. **Enviar para Sisreg**:
   - Após o escaneamento, clique em "Enviar para Sisreg"
   - Os dados serão automaticamente transferidos para o popup principal

5. **Executar Ações**:
   - Use os botões no popup principal para executar ações no Sisreg:
     - **Preencher Formulário**: Preenche os campos do formulário atual
     - **Login Sisreg**: Inicia o processo de login
     - **Navegar para Agendamento**: Vai para a seção de agendamento
     - **Buscar Paciente**: Procura pelo paciente no sistema
     - **Agendar Consulta**: Inicia o processo de agendamento

## Personalização

### Atualizando Seletores

Para que a extensão funcione corretamente com o Sisreg, você pode precisar atualizar os seletores CSS nos scripts:

1. **Identificar Elementos**:
   - Inspecione a página do Sisreg usando as ferramentas de desenvolvedor
   - Encontre os seletores apropriados para cada campo ou botão

2. **Atualizar Scripts**:
   - Modifique os seletores nos arquivos `popup.js` e `content.js`
   - Teste as alterações para garantir que funcionam corretamente

### Exemplo de Atualização de Seletor

```javascript
// Antes (seletor genérico)
const nameField = document.querySelector('input[name="nome"]');

// Depois (seletor específico do Sisreg)
const nameField = document.querySelector('#formPaciente input[name="nomePaciente"]');
```

## Segurança

- **Permissões Limitadas**: A extensão só tem acesso ao Sisreg
- **Dados Locais**: Todos os dados são armazenados localmente no navegador
- **Sem Coleta de Dados**: A extensão não coleta nem envia dados para servidores externos

## Limitações Conhecidas

1. **Atualizações do Sisreg**: Mudanças no Sisreg podem quebrar os seletores
2. **Compatibilidade**: Testada principalmente no Chrome e Edge
3. **Permissões**: Requer permissões específicas para acessar o Sisreg

## Desenvolvimento Futuro

1. **Reconhecimento de Voz**: Adicionar comandos por voz
2. **Aprendizado de Máquina**: Melhorar a identificação de elementos do Sisreg
3. **Sincronização**: Sincronizar dados entre dispositivos
4. **Relatórios**: Gerar relatórios de atividades automatizadas

## Solução de Problemas

**Problema**: A extensão não preenche os campos corretamente
**Solução**: Verifique se os seletores CSS estão corretos para a versão atual do Sisreg

**Problema**: O popup não aparece
**Solução**: Certifique-se de que a extensão está habilitada e fixada na barra de ferramentas

**Problema**: Erros de permissão
**Solução**: Verifique se todas as permissões necessárias foram concedidas