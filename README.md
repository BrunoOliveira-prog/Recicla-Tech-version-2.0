ReciclaTech 2.0: Lógica de Design e Desenvolvimento
Este documento detalha o racional por trás das mudanças implementadas na nova versão do ReciclaTech. O objetivo foi elevar o projeto de um protótipo funcional para uma aplicação com "look & feel" de produto profissional de mercado.

1. Conceito Visual: "Eco-Tech"
A principal mudança foi na identidade visual. O design anterior era funcional, mas genérico. A versão 2.0 adota uma estética Eco-Tech, que une a sustentabilidade com a modernidade tecnológica.

Paleta de Cores (Psicologia das Cores)
Emerald & Teal (Esmeralda e Verde-azulado): Substituímos o verde padrão por tons mais sofisticados.
Por que? O verde remete à natureza, mas o tom "Teal" traz um toque de tecnologia e inovação, fugindo do clichê de "site de reciclagem antigo".
Dark Mode & Glassmorphism:
Por que? O efeito de vidro fosco (backdrop-blur) no header e nos cards cria profundidade e hierarquia sem poluir a tela. É uma tendência forte em interfaces modernas (como iOS e Windows 11).


2. Experiência do Usuário (UX)
O foco foi reduzir a Carga Cognitiva do usuário. Ou seja, fazer com que ele pense menos para realizar uma tarefa.

Reestruturação do Guia (Lei de Miller)
Problema: A página antiga do Guia tinha muito texto corrido. Isso assusta o usuário.
Solução (Abas): Usei o padrão de Tabs.
Lógica: Agrupar informações relacionadas (Básico, Descarte, Ciclo...) permite que o usuário foque em um pedaço de informação por vez. Isso torna o aprendizado mais digerível.
Formulários Intuitivos (Página Agendar)
Problema: Formulários longos são tediosos.
Solução:
Agrupamento visual de campos relacionados (Data/Hora, Peso/Quantidade).
Uso de ícones (lucide-react) para facilitar o reconhecimento visual rápido do que é pedido em cada campo.


3. Arquitetura Frontend
Mantivemos a base (React + Vite), mas refinamos a estrutura de componentes.
Componentização (Shadcn UI)
Utilizamos componentes da biblioteca Shadcn UI (baseada em Radix UI e Tailwind).
Vantagem: Acessibilidade garantida (navegação por teclado, leitores de tela) e consistência visual automática. Não precisamos "reinventar a roda" para criar um Accordion ou um Modal.
Tailwind CSS (Utility-First)
Todo o estilo foi feito com classes utilitárias.

Lógica: Permite iteração rápida. Ao invés de criar arquivos .css
separados e ficar alternando telas, o estilo está junto do HTML (JSX), facilitando a manutenção e garantindo que o design system (cores, espaçamentos) seja respeitado.

Resumo da Transformação
Aspecto	| Versão 1.0 (Anterior)	| Versão 2.0 (Atual)
Estilo |	Básico / Bootstrap-like |	Moderno / Glassmorphism
Cores	 |Cores padrão HTML |	Paleta Customizada (HSL)
Navegação |	Links simples |	Menu Interativo e Abas
Foco	| Funcionalidade Pura |	Experiência e Engajamento

Conclusão: A versão 2.0 não é apenas uma "pintura nova". 
É uma reestruturação pensada para passar credibilidade, confiança e facilitar o uso da plataforma.
