-- ========================================================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS LOCAL HELPDESK TI (DOCKER)
-- Compatível com PostgreSQL 14, 15 e 16
-- ========================================================================

-- Criação da tabela de Usuários com Perfis (Administrador, Técnico, Usuário)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(64) PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    senha VARCHAR(255),
    perfil VARCHAR(50) NOT NULL DEFAULT 'Usuário',
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    origem VARCHAR(50) DEFAULT 'local'
);

-- Criação da tabela de Chamados Técnicos
CREATE TABLE IF NOT EXISTS chamados (
    id VARCHAR(64) PRIMARY KEY,
    solicitante VARCHAR(255) NOT NULL,
    tipo_solicitacao VARCHAR(255) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    prioridade VARCHAR(50) NOT NULL,
    equipamento VARCHAR(255),
    titulo VARCHAR(255) NOT NULL,
    descricao_problema TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aberto',
    data_abertura TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    descricao_servico TEXT,
    data_encerramento TIMESTAMPTZ,
    tecnico_responsavel VARCHAR(255),
    prazo_horas INTEGER DEFAULT 24
);

-- Criação da tabela de Inventário de Equipamentos
CREATE TABLE IF NOT EXISTS inventario_equipamentos (
    id VARCHAR(64) PRIMARY KEY,
    patrimonio VARCHAR(100) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    numero_serie VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Disponível',
    responsavel VARCHAR(255) NOT NULL,
    setor VARCHAR(150) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    data_aquisicao DATE NOT NULL,
    valor_estimado NUMERIC(12,2) DEFAULT 0,
    observacoes TEXT,
    campos_customizados JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ
);

-- Criação da tabela de Definição de Campos Customizados do Inventário
CREATE TABLE IF NOT EXISTS inventario_campos (
    id VARCHAR(64) PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'texto',
    opcoes JSONB,
    obrigatorio BOOLEAN DEFAULT false,
    placeholder VARCHAR(255)
);

-- Criação da tabela de Opções Dinâmicas (Tipos, Categorias e Modelos Frequentes)
CREATE TABLE IF NOT EXISTS config_opcoes (
    id VARCHAR(64) PRIMARY KEY,
    grupo VARCHAR(50) NOT NULL, -- 'tipo_solicitacao', 'categoria', 'modelo_frequente'
    chave VARCHAR(255) NOT NULL,
    valor JSONB NOT NULL
);

-- Criação da tabela de Avisos e Banners Informativos
CREATE TABLE IF NOT EXISTS avisos_banners (
    id VARCHAR(64) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'aviso', -- 'urgente', 'aviso', 'info', 'sucesso'
    ativo BOOLEAN DEFAULT true,
    criado_por VARCHAR(255) NOT NULL,
    perfil_autor VARCHAR(50) NOT NULL,
    expira_em DATE,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de Mensagens de Chat com Anexos
CREATE TABLE IF NOT EXISTS mensagens_chat (
    id VARCHAR(64) PRIMARY KEY,
    chamado_id VARCHAR(64) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    sender_nome VARCHAR(255) NOT NULL,
    sender_perfil VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    anexo JSONB,
    lida BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de consultas rápidas
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_abertura ON chamados(data_abertura);
CREATE INDEX IF NOT EXISTS idx_chamados_solicitante ON chamados(solicitante);
CREATE INDEX IF NOT EXISTS idx_inventario_status ON inventario_equipamentos(status);
CREATE INDEX IF NOT EXISTS idx_inventario_patrimonio ON inventario_equipamentos(patrimonio);
CREATE INDEX IF NOT EXISTS idx_chat_chamado ON mensagens_chat(chamado_id);

-- ========================================================================
-- CARGA DE DADOS INICIAIS (SEEDS)
-- ========================================================================

-- Usuários Padrão (Admin, Técnico e Usuário)
INSERT INTO usuarios (id, login, nome, email, senha, perfil, criado_em, origem)
VALUES 
    ('usr-admin-01', 'admin', 'Administrador TI', 'admin@empresa.com', 'admin123', 'Administrador', NOW(), 'local'),
    ('usr-tecnico-01', 'tecnico', 'Eduardo (Técnico TI)', 'eduardo.tecnico@empresa.com', 'tecnico01', 'Técnico', NOW(), 'local'),
    ('usr-usuario-01', 'usuario', 'Mariana Souza', 'mariana.souza@empresa.com', 'usuario123', 'Usuário', NOW(), 'local')
ON CONFLICT (login) DO NOTHING;

-- Definição de Campos Customizados do Inventário
INSERT INTO inventario_campos (id, chave, label, tipo, opcoes, placeholder)
VALUES
    ('campo-1', 'endereco_ip', 'Endereço IP', 'texto', NULL, 'Ex: 192.168.1.105'),
    ('campo-2', 'endereco_mac', 'Endereço MAC', 'texto', NULL, 'Ex: 00:1B:44:11:3A:B7'),
    ('campo-3', 'memoria_ram', 'Memória RAM', 'selecao', '["8 GB DDR4", "16 GB DDR4", "32 GB DDR4", "64 GB DDR5"]'::jsonb, NULL),
    ('campo-4', 'garantia_ate', 'Garantia até', 'data', NULL, 'YYYY-MM-DD')
ON CONFLICT (chave) DO NOTHING;

-- Equipamentos Iniciais de Exemplo
INSERT INTO inventario_equipamentos 
(id, patrimonio, nome, tipo, marca, modelo, numero_serie, status, responsavel, setor, localizacao, data_aquisicao, valor_estimado, observacoes, campos_customizados)
VALUES
    ('inv-001', 'NOTE-001', 'Notebook Dell Latitude 3420', 'Notebook', 'Dell', 'Latitude 3420 Core i7', 'DL-77291-BR', 'Em Uso', 'Mariana Souza', 'Recursos Humanos', 'Prédio A - Sala 204', '2023-04-12', 4800.00, 'Equipamento em excelente estado de conservação.', '{"endereco_ip": "192.168.10.45", "memoria_ram": "16 GB DDR4"}'::jsonb),
    ('inv-002', 'DESK-014', 'Desktop Dell OptiPlex 7090', 'Desktop', 'Dell', 'OptiPlex 7090 Micro', 'DL-90812-SP', 'Em Manutenção', 'Carlos Mendes', 'Contabilidade', 'Bancada TI - Lab 01', '2022-09-18', 3950.00, 'Em manutenção preventiva por superaquecimento.', '{"endereco_ip": "192.168.10.60", "memoria_ram": "16 GB DDR4"}'::jsonb),
    ('inv-003', 'NOTE-008', 'Notebook Lenovo ThinkPad T14', 'Notebook', 'Lenovo', 'ThinkPad T14 Gen 3', 'LN-55219-RJ', 'Disponível', 'Almoxarifado TI', 'Tecnologia da Informação', 'Armário Seguro TI', '2024-01-20', 6200.00, 'Reserva configurada com imagem padrão corporativa.', '{"endereco_ip": "192.168.10.150", "memoria_ram": "32 GB DDR4"}'::jsonb),
    ('inv-004', 'IMP-002', 'Impressora HP LaserJet Pro M404dw', 'Impressora', 'HP', 'LaserJet Pro M404dw', 'HP-33291-PR', 'Em Uso', 'Equipe Financeiro', 'Financeiro', 'Prédio B - Sala 102', '2023-08-05', 2400.00, 'Impressora de rede duplex para o setor financeiro.', '{"endereco_ip": "192.168.10.200"}'::jsonb),
    ('inv-005', 'SRV-001', 'Servidor Dell PowerEdge R650', 'Servidor', 'Dell', 'PowerEdge R650 1U', 'DL-SRV-9941', 'Em Uso', 'Eduardo (Técnico TI)', 'Tecnologia da Informação', 'Data Center Rack 03', '2023-02-10', 28000.00, 'Servidor de virtualização e banco de dados corporativo.', '{"endereco_ip": "192.168.1.10", "memoria_ram": "64 GB DDR5"}'::jsonb)
ON CONFLICT (patrimonio) DO NOTHING;

-- Chamados Iniciais de Demonstração
INSERT INTO chamados
(id, solicitante, tipo_solicitacao, categoria, prioridade, equipamento, titulo, descricao_problema, status, data_abertura, prazo_horas)
VALUES
    ('CH-2601', 'Mariana Souza', 'Incidente (Falha / Erro)', 'Impressoras & Periféricos', 'Média', 'Impressora HP LaserJet Pro M404dw', 'Impressora travando papel na bandeja 2', 'A impressora do setor de RH travou durante a impressão da folha de pagamento.', 'Aberto', NOW() - INTERVAL '2 hours', 24),
    ('CH-2602', 'Carlos Mendes', 'Incidente (Falha / Erro)', 'Hardware (Computadores/Monitores)', 'Alta', 'Desktop Dell OptiPlex 7090', 'Computador da contabilidade sem ligar após queda de energia', 'A máquina não dá sinal de vida ao apertar o botão power.', 'Em Atendimento', NOW() - INTERVAL '18 hours', 12),
    ('CH-2599', 'Roberto Vendas', 'Incidente (Falha / Erro)', 'Rede / Internet / Wi-Fi', 'Crítica', 'Switch Cisco Catalyst 2960X', 'Queda de conexão no setor comercial e CRM inoperante', 'Equipe sem acesso à internet e sem comunicação com o servidor.', 'Aberto', NOW() - INTERVAL '36 hours', 8)
ON CONFLICT (id) DO NOTHING;
