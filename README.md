# SOS Mulher

Aplicativo Ionic/Angular com uma API local em Node.js, Express, TypeScript e SQLite.

## Executar localmente

Requisitos: Node.js 24 ou superior e npm.

```powershell
cd sos-mulher
npm install
npm --prefix backend install
npm start
```

O comando inicia o aplicativo em [http://localhost:8100](http://localhost:8100) e a API em `http://127.0.0.1:3000`. O Angular encaminha as chamadas `/api` para o backend durante o desenvolvimento.

Contas fictícias de demonstração (criadas somente fora de `NODE_ENV=production`):

| Perfil | CPF | Senha |
|---|---|---|
| Vítima | `123.456.789-00` | `12345678` |
| Agente | `987.654.321-00` | `12345678` |

O cadastro público cria contas de vítima; contas de agente não podem ser criadas pelo aplicativo. Os dados e a chave JWT locais ficam em `sos-mulher/backend/data/`, que não deve ser compartilhada nem adicionada ao Git.

Para compilar os dois projetos:

```powershell
npm run build:full
```

## API

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `PATCH /api/profile`
- `GET /api/teams`
- `GET /api/occurrences`, `POST /api/occurrences`
- `PATCH /api/occurrences/:id/accept`, `PATCH /api/occurrences/:id/finish`
- `POST /api/support-requests`

As senhas são armazenadas com hash bcrypt; as rotas privadas usam tokens JWT e autorização por perfil. A API valida os dados de entrada e limita tentativas de login/cadastro. Os chamados de apoio e a estimativa de distância/chegada são simulações para desenvolvimento, não despacho real.

## Antes de qualquer uso real

Este backend é um protótipo acadêmico local, não um serviço pronto para produção. Ele armazena dados pessoais e localização em SQLite sem criptografia em repouso. Antes de usar dados reais, configure um `JWT_SECRET` forte e rotacione-o com segurança; implemente HTTPS, controles de acesso e auditoria operacional, política de retenção e exclusão de dados, backups protegidos e revisão de segurança/privacidade. Não use os dados fictícios ou informações de pessoas reais em testes compartilhados.
