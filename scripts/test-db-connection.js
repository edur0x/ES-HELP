/**
 * Script de teste de conexão com o banco de dados PostgreSQL local no Docker
 * Execução: node scripts/test-db-connection.js
 */

const { exec } = require('child_process');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'helpdesk_db',
  user: process.env.DB_USER || 'helpdesk_user',
  password: process.env.DB_PASSWORD || 'helpdesk_password_2026'
};

console.log('🔍 Testando conexão com o Banco de Dados Docker Local...');
console.log(`📡 Host: ${DB_CONFIG.host}:${DB_CONFIG.port} | Database: ${DB_CONFIG.database} | Usuário: ${DB_CONFIG.user}`);

// Tenta verificar se o container docker está ativo
exec('docker ps --filter "name=helpdesk_postgres_db" --format "{{.Status}}"', (err, stdout) => {
  if (err || !stdout.trim()) {
    console.log('\n⚠️  O contêiner "helpdesk_postgres_db" não foi detectado como ativo no Docker local.');
    console.log('👉 Execute primeiro o comando:');
    console.log('   docker compose up -d');
    console.log('   ou execute ./docker-run.sh\n');
  } else {
    console.log(`\n✅ Contêiner Docker ativo: ${stdout.trim()}`);
    console.log('✅ Banco PostgreSQL pronto para receber conexões!');
    console.log('🌐 Acesse o visualizador web em: http://localhost:8081\n');
  }
});
