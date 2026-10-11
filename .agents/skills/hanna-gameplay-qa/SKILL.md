# Skill — hanna-gameplay-qa

Quando usar: antes de modificar interações, missões, câmera, controle, personagem, colisão ou modelo de objeto já interativo.

## Inspeção obrigatória
1. Ler os passos atuais em `src/core-game.js` e `v14-world.js`.
2. Rastrear: target → nearestInteractive/extraNear → evento pointerdown/keydown → ação → estado → avanço → animação → save/restore.
3. Verificar input pelo espaço de visualização, nunca supor que o mundo X+ equivale a direita na tela.
4. Para cada missão afetada, exercitar etapa correta, objeto errado, distância, duplo clique, retomada.
5. Para alterações no núcleo, rodar `node src/build-payload.cjs` (o HTML serve payload comprimido, não src/core-game.js diretamente).

## Provas
- `node tests/v19-regression.test.cjs`
- `node --test tests/p0-gameplay.test.cjs`
- `node --test tests/p1-mission-inventory.test.cjs`
- `node --test tests/p0-browser.test.cjs` onde houver navegador e Playwright.
- Anexar screenshot do mesmo enquadramento antes/depois quando houver alteração perceptível.
- Se falta Android/iPhone físico, registrar explicitamente que não houve validação naquele hardware.
- Não declarar missões funcionais apenas por existir o identificador na lista.

## Saída obrigatória
Defeito confirmado vs hipótese, arquivos, commits, testes executados, resultados, instruções de reprodução, pendências e rollback.
