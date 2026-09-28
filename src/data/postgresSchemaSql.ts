export const POSTGRES_SCHEMA_SQL = `-- ==============================================================================
-- SISTEMA DE GESTÃO DE CHAMADOS TI & INVENTÁRIO CORPORATIVO DE EQUIPAMENTOS
-- SCRIPT COMPLETO DE DEFINIÇÃO E CARGA DE DADOS PARA POSTGRESQL (13 / 14 / 15 / 16)
-- Arquivo: postgres_setup.sql
-- ==============================================================================

-- 1. EXTENSÕES DO POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. TABELA: USUÁRIOS DO SISTEMA
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('usr-' || substr(md5(random()::text), 1, 8)),
    login VARCHAR(100) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    senha VARCHAR(255),
    perfil VARCHAR(50) NOT NULL DEFAULT 'Usuário' 
        CHECK (perfil IN ('Administrador', 'Técnico', 'Usuário', 'Operador')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    origem VARCHAR(50) DEFAULT 'local',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA: INVENTÁRIO DE EQUIPAMENTOS DA EMPRESA
CREATE TABLE IF NOT EXISTS inventario_equipamentos (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('inv-' || substr(md5(random()::text), 1, 8)),
    patrimonio VARCHAR(100) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    numero_serie VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Disponível'
        CHECK (status IN ('Disponível', 'Em Uso', 'Em Manutenção', 'Descartado')),
    responsavel VARCHAR(255) NOT NULL,
    setor VARCHAR(150) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    data_aquisicao DATE NOT NULL,
    valor_estimado NUMERIC(12,2) DEFAULT 0.00,
    observacoes TEXT,
    campos_customizados JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA: DEFINIÇÃO DE CAMPOS CUSTOMIZADOS DO INVENTÁRIO
CREATE TABLE IF NOT EXISTS inventario_campos (
    id VARCHAR(64) PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'texto' 
        CHECK (tipo IN ('texto', 'numero', 'data', 'selecao')),
    opcoes JSONB,
    obrigatorio BOOLEAN NOT NULL DEFAULT FALSE,
    placeholder VARCHAR(255)
);

-- 5. TABELA: CHAMADOS TÉCNICOS DE TI
CREATE TABLE IF NOT EXISTS chamados (
    id VARCHAR(64) PRIMARY KEY,
    solicitante VARCHAR(255) NOT NULL,
    tipo_solicitacao VARCHAR(255) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    prioridade VARCHAR(50) NOT NULL DEFAULT 'Média'
        CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Crítica')),
    equipamento VARCHAR(255),
    titulo VARCHAR(255) NOT NULL,
    descricao_problema TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aberto'
        CHECK (status IN ('Aberto', 'Em Atendimento', 'Encerrado')),
    data_abertura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descricao_servico TEXT,
    data_encerramento TIMESTAMPTZ,
    tecnico_responsavel VARCHAR(255),
    prazo_horas INTEGER NOT NULL DEFAULT 24,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA: OPÇÕES DINÂMICAS E MODELOS FREQUENTES
CREATE TABLE IF NOT EXISTS config_opcoes (
    id VARCHAR(64) PRIMARY KEY,
    grupo VARCHAR(50) NOT NULL,
    chave VARCHAR(255) NOT NULL,
    valor JSONB NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA: AVISOS E BANNERS INFORMATIVOS
CREATE TABLE IF NOT EXISTS avisos_banners (
    id VARCHAR(64) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'aviso'
        CHECK (tipo IN ('urgente', 'aviso', 'info', 'sucesso')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_por VARCHAR(255) NOT NULL,
    perfil_autor VARCHAR(50) NOT NULL,
    expira_em DATE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA: MENSAGENS DO CHAT ONLINE EM TEMPO REAL
CREATE TABLE IF NOT EXISTS mensagens_chat (
    id VARCHAR(64) PRIMARY KEY DEFAULT ('msg-' || substr(md5(random()::text), 1, 8)),
    chamado_id VARCHAR(64) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    sender_nome VARCHAR(255) NOT NULL,
    sender_perfil VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    anexo JSONB,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_prioridade ON chamados(prioridade);
CREATE INDEX IF NOT EXISTS idx_chamados_solicitante ON chamados(solicitante);
CREATE INDEX IF NOT EXISTS idx_chamados_equipamento ON chamados(equipamento);
CREATE INDEX IF NOT EXISTS idx_chamados_data_abertura ON chamados(data_abertura DESC);
CREATE INDEX IF NOT EXISTS idx_chamados_tecnico ON chamados(tecnico_responsavel);
CREATE INDEX IF NOT EXISTS idx_inventario_patrimonio ON inventario_equipamentos(patrimonio);
CREATE INDEX IF NOT EXISTS idx_inventario_status ON inventario_equipamentos(status);
CREATE INDEX IF NOT EXISTS idx_inventario_setor ON inventario_equipamentos(setor);
CREATE INDEX IF NOT EXISTS idx_chat_chamado ON mensagens_chat(chamado_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);

-- 10. FUNÇÃO E TRIGGERS PARA ATUALIZAR TIMESTAMPS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION fn_atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualizar_timestamp_usuarios ON usuarios;
CREATE TRIGGER trg_atualizar_timestamp_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

DROP TRIGGER IF EXISTS trg_atualizar_timestamp_inventario ON inventario_equipamentos;
CREATE TRIGGER trg_atualizar_timestamp_inventario
BEFORE UPDATE ON inventario_equipamentos
FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

DROP TRIGGER IF EXISTS trg_atualizar_timestamp_chamados ON chamados;
CREATE TRIGGER trg_atualizar_timestamp_chamados
BEFORE UPDATE ON chamados
FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

-- 11. VIEWS ANALÍTICAS
CREATE OR REPLACE VIEW vw_chamados_detalhados AS
SELECT 
    c.*,
    (c.data_abertura + (c.prazo_horas || ' hours')::INTERVAL) AS data_limite_sla,
    CASE 
        WHEN c.status = 'Encerrado' THEN 'Resolvido'
        WHEN CURRENT_TIMESTAMP > (c.data_abertura + (c.prazo_horas || ' hours')::INTERVAL) THEN 'Atrasado'
        ELSE 'Dentro do Prazo'
    END AS situacao_sla,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - c.data_abertura)) / 3600.0, 1) AS horas_decorridas
FROM chamados c;

CREATE OR REPLACE VIEW vw_dashboard_kpis AS
SELECT
    COUNT(*) AS total_chamados,
    COUNT(*) FILTER (WHERE status = 'Aberto') AS chamados_abertos,
    COUNT(*) FILTER (WHERE status = 'Em Atendimento') AS chamados_em_atendimento,
    COUNT(*) FILTER (WHERE status = 'Encerrado') AS chamados_encerrados,
    COUNT(*) FILTER (WHERE prioridade = 'Crítica') AS chamados_criticos,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'Encerrado')::NUMERIC / NULLIF(COUNT(*), 0) * 100), 1
    ) AS taxa_resolucao_pct
FROM chamados;

-- 12. CARGA DE DADOS INICIAIS (SEEDS)
INSERT INTO usuarios (id, login, nome, email, senha, perfil, ativo, origem)
VALUES 
    ('usr-admin-01', 'admin', 'Administrador TI', 'admin@empresa.com', 'admin123', 'Administrador', TRUE, 'local'),
    ('usr-tecnico-01', 'tecnico', 'Eduardo (Técnico TI)', 'eduardo.tecnico@empresa.com', 'tecnico01', 'Técnico', TRUE, 'local'),
    ('usr-operador-01', 'operador', 'Operador de Suporte', 'operador@empresa.com', 'operador123', 'Operador', TRUE, 'local'),
    ('usr-usuario-01', 'usuario', 'Mariana Souza', 'mariana.souza@empresa.com', 'usuario123', 'Usuário', TRUE, 'local')
ON CONFLICT (login) DO UPDATE SET 
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    perfil = EXCLUDED.perfil;

INSERT INTO inventario_campos (id, chave, label, tipo, opcoes, obrigatorio, placeholder)
VALUES
    ('campo-1', 'endereco_ip', 'Endereço IP', 'texto', NULL, FALSE, 'Ex: 192.168.1.105'),
    ('campo-2', 'endereco_mac', 'Endereço MAC', 'texto', NULL, FALSE, 'Ex: 00:1B:44:11:3A:B7'),
    ('campo-3', 'memoria_ram', 'Memória RAM', 'selecao', '["8 GB DDR4", "16 GB DDR4", "32 GB DDR4", "64 GB DDR5"]'::jsonb, FALSE, NULL),
    ('campo-4', 'garantia_ate', 'Garantia até', 'data', NULL, FALSE, 'YYYY-MM-DD')
ON CONFLICT (chave) DO NOTHING;

INSERT INTO inventario_equipamentos 
(id, patrimonio, nome, tipo, marca, modelo, numero_serie, status, responsavel, setor, localizacao, data_aquisicao, valor_estimado, observacoes, campos_customizados)
VALUES
    ('inv-001', 'NOTE-001', 'Notebook Dell Latitude 3420', 'Notebook', 'Dell', 'Latitude 3420 Core i7', 'DL-77291-BR', 'Em Uso', 'Mariana Souza', 'Recursos Humanos', 'Prédio A - Sala 204', '2023-04-12', 4800.00, 'Equipamento corporativo em excelente estado.', '{"endereco_ip": "192.168.10.45", "memoria_ram": "16 GB DDR4"}'::jsonb),
    ('inv-002', 'DESK-014', 'Desktop Dell OptiPlex 7090', 'Desktop', 'Dell', 'OptiPlex 7090 Micro Core i5', 'DL-90812-SP', 'Em Manutenção', 'Carlos Mendes', 'Contabilidade', 'Bancada TI - Lab 01', '2022-09-18', 3950.00, 'Em manutenção preventiva por superaquecimento.', '{"endereco_ip": "192.168.10.60", "memoria_ram": "16 GB DDR4"}'::jsonb),
    ('inv-003', 'NOTE-008', 'Notebook Lenovo ThinkPad T14', 'Notebook', 'Lenovo', 'ThinkPad T14 Gen 3', 'LN-55219-RJ', 'Disponível', 'Almoxarifado TI', 'Tecnologia da Informação', 'Armário Seguro TI', '2024-01-20', 6200.00, 'Notebook reserva com imagem padrão corporativa.', '{"endereco_ip": "192.168.10.150", "memoria_ram": "32 GB DDR4"}'::jsonb),
    ('inv-004', 'IMP-002', 'Impressora HP LaserJet Pro M404dw', 'Impressora', 'HP', 'LaserJet Pro M404dw', 'HP-33291-PR', 'Em Uso', 'Equipe Financeiro', 'Financeiro', 'Prédio B - Sala 102', '2023-08-05', 2400.00, 'Impressora departamental monocromática duplex.', '{"endereco_ip": "192.168.10.200"}'::jsonb),
    ('inv-005', 'SRV-001', 'Servidor Dell PowerEdge R650', 'Servidor', 'Dell', 'PowerEdge R650 1U Dual Xeon', 'DL-SRV-9941', 'Em Uso', 'Eduardo (Técnico TI)', 'Tecnologia da Informação', 'Data Center Rack 03', '2023-02-10', 28000.00, 'Servidor de virtualização e banco de dados relacional PostgreSQL.', '{"endereco_ip": "192.168.1.10", "memoria_ram": "64 GB DDR5"}'::jsonb)
ON CONFLICT (patrimonio) DO NOTHING;

INSERT INTO chamados
(id, solicitante, tipo_solicitacao, categoria, prioridade, equipamento, titulo, descricao_problema, status, data_abertura, prazo_horas, tecnico_responsavel, descricao_servico, data_encerramento)
VALUES
    ('CH-2601', 'Mariana Souza', 'Incidente (Falha / Erro)', 'Impressoras & Periféricos', 'Média', 'IMP-002 - Impressora HP LaserJet Pro M404dw', 'Impressora travando papel na bandeja 2', 'A impressora do setor de RH travou durante a impressão da folha de pagamento.', 'Aberto', CURRENT_TIMESTAMP - INTERVAL '2 hours', 24, NULL, NULL, NULL),
    ('CH-2602', 'Carlos Mendes', 'Incidente (Falha / Erro)', 'Hardware (Computadores/Monitores)', 'Alta', 'DESK-014 - Desktop Dell OptiPlex 7090', 'Computador da contabilidade sem ligar após queda de energia', 'A máquina não dá sinal de vida ao apertar o botão power.', 'Em Atendimento', CURRENT_TIMESTAMP - INTERVAL '18 hours', 12, 'Eduardo (Técnico TI)', NULL, NULL),
    ('CH-2599', 'Roberto Vendas', 'Incidente (Falha / Erro)', 'Rede / Internet / Wi-Fi', 'Crítica', 'SW-001 - Switch Cisco Catalyst 2960-X', 'Queda de conexão no setor comercial e CRM inoperante', 'Equipe sem acesso à internet e sem comunicação com o servidor.', 'Encerrado', CURRENT_TIMESTAMP - INTERVAL '36 hours', 8, 'Eduardo (Técnico TI)', 'Reboot e reset na porta do switch central. Comunicação normalizada.', CURRENT_TIMESTAMP - INTERVAL '32 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mensagens_chat (id, chamado_id, sender_id, sender_nome, sender_perfil, mensagem, criado_em)
VALUES
    ('msg-001', 'CH-2601', 'usr-usuario-01', 'Mariana Souza', 'Usuário', 'A impressora travou novamente durante a impressão da folha de pagamento.', CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes'),
    ('msg-002', 'CH-2601', 'usr-tecnico-01', 'Eduardo (Técnico TI)', 'Técnico', 'Já estou a caminho do prédio A para verificar o rolete da bandeja 2.', CURRENT_TIMESTAMP - INTERVAL '1 hour 40 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO avisos_banners (id, titulo, mensagem, tipo, ativo, criado_por, perfil_autor, expira_em, criado_em)
VALUES
    ('aviso-001', 'Manutenção Programada no Servidor de Banco de Dados', 'Janela de manutenção técnica e backup hoje às 22h00 com duração estimada de 30 minutos.', 'aviso', TRUE, 'Administrador TI', 'Administrador', CURRENT_DATE + INTERVAL '7 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
`;
