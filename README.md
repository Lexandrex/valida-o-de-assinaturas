# validador-de-assinaturas

## introdução 

Neste trabalho, foi desenvolvida uma aplicação completa para o cadastro de funcionários, com definição de hierarquias e permissões exclusivas, voltada para o registro de despesas com anexação de comprovantes. A aplicação permite que gerentes e diretores realizem o aceite ou a recusa de relatórios submetidos, garantindo controle e rastreabilidade.

Para isso, foi utilizado o banco de dados MySQL, por meio do servidor XAMPP, além de bibliotecas de criptografia que possibilitam a geração de chaves públicas e privadas exclusivas para cada usuário, as quais são empregadas na validação e autenticação do aceite dos relatórios, conferindo maior segurança e integridade ao processo.

## Tecnologias Utilizadas

### Frontend
- **HTML** simples
- **CSS** básico para estilização

### Backend
- **JavaScript (Node.js)**
- **Express.js** – framework para criação da API
- **CORS** – controle de acesso entre o frontend e backend
- **JWT (JSON Web Token)** – autenticação via token
- **bcrypt** – para hash seguro das senhas
- **Crypto (RSA)** – geração e uso de chaves públicas/privadas para assinatura digital

### Banco de Dados
- **MySQL**, executado localmente com **XAMPP**

### Comunicação
- API REST construída com **Express.js**
- Comunicação entre frontend e backend via **requisições HTTP** usando `fetch` ou `axios` (caso adicionado)

---

## tabelas do banco
### Funcionalidades

- Cadastro e autenticação de usuários com diferentes cargos:
  - `funcionário`
  - `gerente`
  - `diretor`
- Registro de despesas com:
  - Descrição
  - Valor
  - Anexos (recibos)
- Validação de despesas
- Assinatura digital de despesas
- Criptografia com geração de **chaves públicas e privadas exclusivas por usuário**
- Status de acompanhamento da despesa:
  - `pendente`
  - `validado`
  - `assinado`
  - `rejeitado`

---

### Tabela usuarios

Contém os dados dos usuários e suas permissões no sistema.

| Campo                      | Tipo                                         | Descrição                                           |
|---------------------------|----------------------------------------------|-----------------------------------------------------|
| `id`                      | `int(11)`                                    | Identificador único                                 |
| `nome`                    | `varchar(100)`                               | Nome do usuário                                     |
| `email`                   | `varchar(100)`                               | E-mail (login único)                                |
| `senha_hash`              | `varchar(255)`                               | Senha criptografada                                 |
| `cargo`                   | `enum('funcionario','gerente','diretor')`    | Cargo e permissões                                  |
| `chave_publica`           | `text`                                       | Chave pública para verificação                      |
| `chave_privada_criptografada` | `text`                                 | Chave privada criptografada                         |

---

### Tabela despesas

Armazena as despesas cadastradas pelos funcionários.

| Campo        | Tipo                                                  | Descrição                                |
|--------------|-------------------------------------------------------|-------------------------------------------|
| `id`         | `int(11)`                                             | ID da despesa                             |
| `employee_id`| `int(11)`                                             | ID do funcionário que criou               |
| `descricao`  | `text`                                                | Descrição detalhada da despesa            |
| `valor`      | `decimal(10,2)`                                       | Valor da despesa                          |
| `data`       | `date`                                                | Data da despesa                           |
| `status`     | `enum('pendente','validado','assinado','rejeitado')` | Estado atual da despesa                   |
| `recibo_url` | `varchar(255)`                                        | URL ou caminho do recibo anexado          |

---

### Tabela validacoes

Guarda os registros de validações feitas por gerentes ou diretores.

| Campo          | Tipo                                | Descrição                                 |
|----------------|-------------------------------------|--------------------------------------------|
| `id`           | `int(11)`                           | ID da validação                            |
| `expense_id`   | `int(11)`                           | Referência à despesa                       |
| `validador_id` | `int(11)`                           | ID do gerente que validou                  |
| `status`       | `enum('validado','rejeitado')`      | Resultado da validação                     |
| `observacao`   | `text`                              | Comentários sobre a validação              |
| `data_validacao`| `datetime`                         | Data e hora da validação                   |

---

### Tabela assinaturas

Registra as assinaturas digitais dos diretores para cada despesa.

| Campo             | Tipo       | Descrição                              |
|-------------------|------------|-----------------------------------------|
| `id`              | `int(11)`  | ID da assinatura                        |
| `expense_id`      | `int(11)`  | Referência à despesa assinada           |
| `assinante_id`    | `int(11)`  | ID do diretor que assinou               |
| `assinatura`      | `text`     | Assinatura digital                      |
| `data_assinatura` | `datetime` | Data e hora da assinatura               |

---

### Segurança e Criptografia

- Cada usuário possui um **par de chaves RSA (pública/privada)**
- A **chave privada** é **criptografada** e armazenada de forma segura
- A **assinatura digital** é gerada com a chave privada e validada com a chave pública

---
