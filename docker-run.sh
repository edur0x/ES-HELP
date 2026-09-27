#!/usr/bin/env bash
# ========================================================================
# Script para Iniciar e Conectar ao Banco de Dados HelpDesk TI no Docker
# ========================================================================

set -e

echo "🚀 Iniciando ambiente de banco de dados HelpDesk TI no Docker..."

# Verifica se o docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Erro: O comando 'docker' não foi encontrado. Por favor, instale o Docker para prosseguir."
    exit 1
fi

# Inicia os contêineres em segundo plano
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

echo "⏳ Aguardando o banco PostgreSQL inicializar e passar no healthcheck..."
sleep 4

echo "✅ Contêineres em execução com sucesso!"
echo "--------------------------------------------------"
echo "📊 PostgreSQL Host:     localhost"
echo "🔌 Porta:               5432"
echo "🗄️  Banco de Dados:     helpdesk_db"
echo "👤 Usuário:             helpdesk_user"
echo "🔑 Senha:               helpdesk_password_2026"
echo "🌐 Visualizador Web:    http://localhost:8081 (pgweb)"
echo "--------------------------------------------------"
echo "💡 Para conectar via psql: psql -h localhost -p 5432 -U helpdesk_user -d helpdesk_db"
echo "💡 Para testar a conexão com o app: node scripts/test-db-connection.js"
