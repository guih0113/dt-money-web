# 💸 DT Money Clone (Frontend)

Este projeto é a parte **frontend** de um clone do DT Money, uma aplicação de gerenciamento de transações financeiras pessoais. O design e o nome são **inspirados em um projeto da Rocketseat**, porém toda a construção e implementação deste frontend são **inteiramente autorais**.

Ele permite aos usuários interagir com o sistema de transações de forma intuitiva, oferecendo uma experiência de usuário fluida através de técnicas avançadas de gerenciamento de estado e otimização de interface.

## ✨ Features

* **Interface de Transações**: Visualize, adicione e filtre suas transações financeiras.
* **Cadastro de Transações**: Formulário intuitivo para registrar novas entradas e saídas de dinheiro.
* **Listagem de Transações Paginada**: Exibe o histórico de transações com controle de paginação para grandes volumes de dados.
* **Busca por Transações**: Funcionalidade de pesquisa para encontrar transações específicas por título ou descrição.
* **Resumo Financeiro Interativo**: Dashboard que exibe em tempo real o total de créditos, débitos e o saldo geral.
* **Interface Otimista (Optimistic UI)**: Atualização instantânea da interface após o envio de uma nova transação, proporcionando feedback visual imediato ao usuário, antes mesmo da resposta do servidor.
* **Validação de Formulários**: Validação robusta e feedback de erro em tempo real para os campos do formulário de transação.

## 🚀 Tecnologias Utilizadas

Este projeto frontend é construído com as seguintes tecnologias:

* **React**: Biblioteca JavaScript líder para construção de interfaces de usuário reativas.
* **Vite**: Ferramenta de build de nova geração que oferece uma experiência de desenvolvimento extremamente rápida.
* **TypeScript**: Superconjunto do JavaScript que adiciona tipagem estática, melhorando a manutenibilidade e escalabilidade do código.
* **Tailwind CSS**: Framework CSS utility-first para estilização rápida e altamente personalizável.
* **@tanstack/react-query**: Poderoso gerenciador de estado de servidor que cuida do cache, sincronização e otimização de requisições de dados.
* **react-hook-form**: Biblioteca para gerenciamento de formulários no React, otimizando performance e simplificando a validação.
* **Zod**: Biblioteca de validação de esquemas TypeScript-first, utilizada para garantir a integridade dos dados do formulário.
* **@radix-ui/react-dialog**: Componente de modal (`Dialog`) acessível e sem estilos, permitindo total customização de design.
* **@radix-ui/react-radio-group**: Componente de grupo de botões de rádio (`RadioGroup`) acessível, ideal para seleção de tipos de transação.
* **lucide-react**: Conjunto de ícones vetoriais modernos e personalizáveis.
* **react-router-dom**: Biblioteca padrão para roteamento declarativo no React, utilizada para gerenciar as URLs e parâmetros de busca (`useSearchParams`).
