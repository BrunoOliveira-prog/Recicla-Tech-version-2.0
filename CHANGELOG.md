# Changelog - ReciclaTech

## v1.0.0 - A Atualização Premium (Web de Perfeição Máxima)
*Data: 14/01/2026*

Esta é a primeira versão estável e completa do ReciclaTech, incorporando uma interface moderna, funcionalidades de backend robustas e uma experiência de usuário visualmente rica.

### 🎨 Interface & Design (Frontend)
- **Glassmorphism Global**: Implementação de efeitos de vidro fosco em cartões, menus e sobreposições para um visual "premium".
- **Modo Escuro (Dark Mode)**: Suporte completo a tema claro/escuro com alternância via botão (Sol/Lua) e detecção de preferência do sistema.
- **Animações Vivas**: Fundo com formas flutuantes (`animate-float`), botões com feedback tátil e transições suaves.
- **Mapa Interativo**:
  - Integração com Leaflet.
  - Sidebar flutuante com estatísticas em tempo real.
  - Marcadores personalizados e tooltips estilizados.
- **Estatísticas Dinâmicas**:
  - Cartões interativos na home page.
  - Barras de progresso animadas.
  - Formatação inteligente de unidades (kg -> Toneladas automáticas).
  - Contagem de itens integrada aos cards de coleta.

### ⚙️ Backend & Funcionalidades
- **Autenticação Completa**:
  - Login/Registro com JWT.
  - Suporte preparado para Google OAuth.
  - Proteção de rotas (Middleware de autenticação).
- **Gestão de Usuários**:
  - Perfis de `COLETOR` (Brunos) e `RECICLADOR` (Pedro).
  - Permissões específicas por função.
  - Seed do banco de dados com usuários de teste.
- **Api de Estatísticas (`/api/stats`)**:
  - Cálculos em tempo real de resíduos coletados (peso e itens).
  - Contagem de pontos ativos e agendamentos.

### 🛠️ Infraestrutura
- **Banco de Dados**: PostgreSQL configurado e populado.
- **Scripts**: Automação de `seed` para resetar e popular o banco.
- **Configuração**: Variáveis de ambiente (`.env`) padronizadas.
