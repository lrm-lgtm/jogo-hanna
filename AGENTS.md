# Casa da Hanna — regras operacionais para agentes

Missão: jogo infantil 3D acessível no browser/celular, com 10 missões principais e 6 extras.

## Ordem obrigatória
1. P0: assegurar gameplay/interações, controles relativos à câmera, teste de navegador e Android emulado.
2. P1: conferir todos os 16 contratos de missão e salvar/restaurar sem regressões.
3. P2: somente depois dos gates anteriores, substituir recursos visuais um por vez, com comparativo antes/depois e prova em jogo.

## Não regredir
- Nunca escrever na branch `main` por conta própria, publicar ou mesclar PR em rascunho.
- Preservar v1.9 e o formato do save `jogo_hanna_v11_save` e `hanna_v14_extra`.
- Alteração em `src/core-game.js` exige `node src/build-payload.cjs` e paridade com os quatro `payload/game-gz-*.txt`.
- Não confundir malha de arte com target selecionável; preservar hitbox, missão, colisão e animação.
- Objetos e nomes devem ser únicos; não reutilizar nomes de malha no Babylon para múltiplos objetos distintos.
- Nenhuma troca de motor ou adição de serviço pago sem decisão explícita do proprietário.

## Skills
- `.agents/skills/hanna-gameplay-qa/SKILL.md` — missões, inputs, saves, regressões.
- `.agents/skills/hanna-3d-art/SKILL.md` — fontes CC0, modelos, licenças, exportação, qualidade, comparação.
- `assets/catalog.json` é a lista de recursos gráficos atualmente presentes, não uma promessa de que foram aprovados visualmente.

Aprovação de P0/P1 não implica aprovação visual da P2.
