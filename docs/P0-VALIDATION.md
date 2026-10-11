# Casa da Hanna — P0 v1.9.1 (prévia; não é produção)

## Isolamento
- Base imutável de referência: main@53e3646204699b30af0d3f5685ee70c5a6ba2b4d (v1.9).
- Branch: feature/hanna-p0-interactions-controls-20261011.
- Preview imutável verificada por HTTP no GitHub Actions: https://rawcdn.githack.com/lrm-lgtm/jogo-hanna/a0c16d4030916a3fc1fd518423af394d147e9f0e/index.html
- A prévia pode exibir uma confirmação intermediária; o link por commit é imutável. Não é o GitHub Pages de produção.
- Evitar instalar a prévia como PWA até a validação em aparelhos reais.

## Evidências automatizadas
1. `node src/build-payload.cjs` atualiza os quatro arquivos compactados usados pelo navegador.
2. `node tests/v19-regression.test.cjs` verifica sintaxe, recursos e integridade core/payload.
3. `node --test tests/p0-gameplay.test.cjs` exercita todos os cinco passos de Hora de Dormir e a direção relativa à câmera em quatro orientações.
4. Workflow de branch reconstrói, testa, publica o payload e consulta por HTTP o HTML, o módulo de movimento e o primeiro pedaço do pacote no CDN. GitHub Actions: https://github.com/lrm-lgtm/jogo-hanna/actions/workflows/p0-regression.yml.


## Navegador real: evidência automatizada — 11/10/2026

GitHub Actions **PASSOU**: https://github.com/lrm-lgtm/jogo-hanna/actions/runs/38111825612

- 3/3 testes Playwright no Chromium com a página real do jogo (não apenas mocks).
- Missão `Hora de Dormir`: USAR na cortina (ambos os painéis movem), abajur (luz ligada), cobertor (animação), carinho e boa-noite; 45 moedas + 1 estrela; sem exceções JS não tratadas.
- Teclado WASD e setas conferidos contra a projeção da câmera em quatro ângulos.
- Joystick Android emulado validado com toque via Chrome DevTools Protocol.
- Screenshots da execução: https://github.com/lrm-lgtm/jogo-hanna/actions/runs/38111825612/artifacts/11692121827
- Confirmação HTTP do bundle de prévia continua aprovada.

Este resultado *não equivale a teste em aparelho físico* e não autoriza mesclar a branch `main`. Avaliar a latência e framerate de dispositivos físicos antes da liberação.

## Matriz manual obrigatória — antes de mesclar
- [ ] No navegador PC, testar W/A/S/D e setas em quatro orientações da câmera, inclusive diagonais, perto de paredes.
- [ ] No Android, testar joystick, botão USAR, rotação por toque, retrato/paisagem e direções perceptivas.
- [ ] No iPhone, repetir joystick, botão USAR, rotação e persistência de missão.
- [ ] Abrir Hora de Dormir com passo 1: cortina fecha visivelmente e libera abajur.
- [ ] Passo 2: abajur acende; passo 3: cobertor se move; passo 4: bebê responde ao carinho; passo 5: bebê dorme.
- [ ] Tentar agir com objeto incorreto: a missão não avança e nenhuma etapa é pulada.
- [ ] Salvar, fechar e reabrir para confirmar progresso sem reset e sem duplicar recompensa.
- [ ] Repetir uma missão de cozinha e uma de brinquedos para checar regressões.
- [ ] Confirmar console sem erros, asset loading completo e desempenho aceitável.

### Bloqueadores
- Os testes automatizados não substituem teste visual/funcional em hardware real.
- A hospedagem da prévia depende do cache e da confirmação intermediária do raw.githack.com.
- Não há mudança na remasterização gráfica nesta etapa.
