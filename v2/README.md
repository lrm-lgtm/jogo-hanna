# Casa da Hanna — Cozinha 3D v2

Branch isolada baseada no piloto R5; a v1.9 e o piloto são preservados.
Preview: https://raw.githack.com/lrm-lgtm/jogo-hanna/feature/cozinha-3d-v2-20261022/v2/index.html
Execução local na raiz do projeto: python3 -m http.server 8765; abrir http://localhost:8765/v2/index.html

- mission.js: oito passos declarativos, pré-condições e save separado.
- quality.js: baixo, médio, alto e automático.
- audio.js: sons sintéticos e voz PT-BR dependente de suporte local.
- ui.js: pausa, ajuda, som e qualidade; retrato orienta a girar.
- sw.js: cache do shell e dos recursos carregados após primeira sessão online.
- cozinha.js: cena adaptada do piloto R5, glTF locais em ../pilot/assets.
- Testes: node --test v2/tests/*.test.cjs

Babylon e loaders UMD 9.29.0 versionados em v2/vendor, sem dependência de CDN de runtime; o service worker faz cache de ambos. FPS, tamanho, iPhone/Android físicos e comparação visual premium NÃO estão comprovados. A personagem continua sendo a R5 (rig simples), não a Hanna final. Não mesclar automaticamente.

## Rodada artística R2 (modelo real Blender)
- `v2/blender/build_kitchen.py` gera original `v2/assets/kitchen-architecture-r2.glb` (GLB 2.0 com bevel, normais ponderadas e materiais PBR).
- Metadados/licença da geometria original em `v2/assets/kitchen-architecture-r2.json` (CC0 1.0), SHA-256 verificado em CI.
- A cena importa o GLB local e substitui elementos planos da R1, sem tocar nas entidades interativas, navegação ou personagem.
- Visual premium e desempenho móvel físico continuam **pendentes de aceite**, ainda não concluídos.


## Rodada FREE R8 — Hanna em jogo (24/10/2026)

- Fonte editável da nova personagem autoral: `v2/blender/build_hanna_r8.py`.
- Resultado Blender sem modelos pagos: `v2/assets/hanna-free-r8.glb`, 5.912.000 bytes e manifesto de exportação.
- Direção visual: moletom rosa, jardineira/shorts jeans azul, cabelo castanho, laço rosa e tênis rosados.
- O jogo carrega o GLB com pivôs `HannaRig`, `HeadPivot`, `ArmLeftPivot`, `ArmRightPivot`, `LegLeftPivot`, `LegRightPivot`.
- Integração: `v2/premium-corner.js` adiciona geladeira rosa, ímãs, cortinas, ervas, louça e luz de janela em geometria original local.
- Capturas REAIS, não imagens geradas: [desktop e Android R8](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40067715289) — passaram no Chromium.
- Comparação: R8 tem personagem visível de frente, paleta coesa e câmera mais próxima, mas **NÃO ALCANÇOU A META PREMIUM**. Rostos, cabelo, materiais e animações seguem simplificados; screenshot não pode ser usado como aprovação artística.
- Testes de regressão unitários e v1.9 passaram no commit 666ad60f. Missão completa + persistência/offline da rodada R8 requer aprovação do workflow de browser correspondente.
- v1.9 `main` permanece intocada, PR #10 em rascunho. Sem gastos, créditos ou assinaturas.

## Gráficos R9 — nitidez nativa e controle de performance (24/10/2026)
- Problema medido no código anterior: modo automático comum de celular renderizava apenas 1,35 pixels por unidade CSS. Android DPR=3 mostrava fração da resolução física.
- Profiles separados por qualidade/performance: baixo 1,15, médio 1,85, alto 2,4, máxima nitidez até 3 pixels por unidade CSS, com limite de framebuffer 3.200 px no maior lado.
- Multisampling Babylon.js, sharpening delicado e FXAA apenas no perfil sem MSAA; sem bloom agressivo.
- HUD oferece máxima nitidez manual (consumo maior de GPU e bateria), e a prévia de Android em CI emula DPR=3 para validar tamanho do framebuffer.
- Isso corrige nitidez técnica e não entrega, por si só, personagem ou arte premium. Não confundir teste Chromium com desempenho em aparelho físico.
- O teste offline da R8 tinha uma expectativa obsoleta de nome do personagem R5 e foi atualizado para a nova R8.

### Hotfix R9.1 — causa raiz provada por imagem/telemetria
- No teste Android DPR 3, código R9 anterior produziu **buffer 525 × 242** para viewport CSS **852 × 393**. O fator de escala foi calculado incorretamente como `DPR / pixels`; isso reduz o buffer até abaixo da resolução CSS.
- R9.1 corrige para `hardwareScalingLevel = 1 / min(perfil, DPR, limite de framebuffer)`. Exemplo esperado de perfil médio: 852 × 393 CSS deve gerar cerca de **1576 × 727 pixels** internos. A prova será o log de screenshot CI, não o valor idealizado.
- Testes de missão usam perfil baixo para evitar confundir sobrecarga do SwiftShader CPU com lógica da missão; screenshots emulados DPR3 testam render real do perfil automático separadamente.
- Arte e rig premium continuam pendentes, mesmo com imagem limpa.

## Joystick R10 — controle Android de verdade (24/10/2026)
- Feedback de jogabilidade com imagens reais do usuário: joystick parece incorreto perto da geladeira. A implementação antiga normalizava movimento mínimo para velocidade máxima, sem dead zone e com reset incompleto de pointer capture.
- Novo `v2/controls.js`: analógico proporcional, zona morta 12%, curva 360°, cálculo no referencial da câmera, interpolação de ângulo e entrada suave; unitários em `v2/tests/controls.test.cjs`.
- `v2/cozinha.js`: usa velocidade real proporcional ao gesto; rotação segue o deslocamento efetivo, liberando captura em pause, blur, visibilitychange, pointercancel/up/lostpointercapture. QA read-only expõe `joystick` e `manualMeters`.
- Joystick landscape tem 94×94 CSS px e base do stick não captura eventos.
- Teste de movimento via **gesto touchscreen Android real emulado CDP**, não clique decorativo: `v2/tests/joystick.browser.cjs` com CI isolado `hanna-v2-joystick.yml` [execução aprovada](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40070615102). Direita +0,950m X; esquerda -0,950m X; frente -0,293m X/+0,950m Z; trás +0,299m X/-0,971m Z. Dead zone, release e pausa aprovados.
- Os testes do jogo completo 8 etapas, save, offline nesta rodada são separados e precisam de confirmação própria. Android físico não testado, portanto não afirmar ausência definitiva de bug no dispositivo real.


## R12 — orientação e caminhada articulada (24/10/2026)

**Defeito reportado em smartphone real:** Hanna deslocava-se para o lado correto, mas permanecia virada no sentido oposto; as pernas pareciam imóveis.

**Correções:** `v2/blender/build_hanna_r8.py` foi modificado para produzir um novo GLB original com hierarquia **quadril → joelho → tornozelo**, preservando a roupa; o Blender exportou 94 malhas e 165 nós. O export e os nomes dos nove pivôs passaram na CI. O arquivo mantém o nome `v2/assets/hanna-free-r8.glb` apenas para não quebrar o cache/endereços anteriores; o conteúdo é R12.

- `v2/gait.js`: orientação geométrica em eixo Babylon, calculada de forma independente de o modelo ter a frente em +Z, -Z ou outro vetor; ciclo de passos síncrono à distância realmente percorrida, parando gradualmente quando a Hanna para.
- `v2/cozinha.js`: mede o vetor frontal real entre centro do rosto e pupilas importados do GLB; remove hipótese incorreta sobre "frente". Articula pernas, joelhos, tornozelos, braços e cabeça sobre quaternions **reais** do Babylon, respeitando a rotação original de cada pivô.
- `v2/tests/gait.test.cjs`: confirma orientação nos quatro sentidos e diagonais, movimento alternado dos quadris e flexão de joelhos, e parada sem passos fantasmas.
- `v2/tests/joystick.browser.cjs`: simula gestos de toque em Chromium Android paisagem, verifica a direção do rosto em relação ao vetor de movimento e exige ângulos reais nos quaternions dos joelhos/quadris (10°+), além de imagens capturadas **enquanto o dedo está no joystick**.
- A primeira execução R12 revelou um sinal invertido na fórmula, com alinhamento -0,876; a fórmula corrigida passou com gesto real `40120972173`. Os testes mais rigorosos de rotação de joints da última rodada foram iniciados em `40121266549`.

**Portões de aceite:** teste no Android físico ainda pendente; qualidade artística/animação premium continua reprovada (rig segmentado não equivale a animação esquelética profissional). PR #10 continua em rascunho, v1.9 main preservada.


## R13 — caminhada e objetos segurados (Samsung real, 24/10/2026)
**Retorno do teste físico no Samsung:** direção da Hanna e joystick aprovados. Caminhada ainda REPROVADA visualmente (pernas mexem, mas feio); ao pegar a torrada ela aparecia nas costas.
- v2/gait.js: novo ciclo de apoio/elevação com IK quadril/joelho/tornozelo, balanço de braços/tronco leve e fase sincronizada à distância real. A direção aprovada continua preservada.
- v2/cozinha.js: objeto carregado agora preso ao pivô da MÃO DIREITA importada do GLB, com transformação por centro da malha hand-1 e deslocamento na frente da personagem, não mais fixado ao torso.
- v2/interactions.js: oito animações de alcance, contato, pegar e retrair; mission.advance ocorre no contato. Porta da geladeira anima dobradiça; a torrada salta da torradeira; ao servir ela desce sobre o prato.
- v2/tests/interactions.test.cjs e gait.test.cjs: cinemática e tempo das ações.
- Browser completo comprova 8 etapas e proximidade objeto↔mão para leite/pão/torrada. Browser dedicado props.browser.cjs inicia legitimamente no save da etapa 6, pega torrada, leva à mesa e testa a posição em frente ao corpo.
- Teste joystick com quatro direções após R13 APROVADO: https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40122946834. Testes do último fluxo de objetos/missão ainda executando.
Não chamar premium. Rig segmentado ainda pode ficar feio; teste visual no Samsung físico será a palavra final. PR #10 em rascunho; main/v1.9 inalterada.

## R14 — revisão baseada em vídeo REAL do Samsung (24/10/2026)
Vídeo original recebido: 65 s; o usuário mostrou porta da geladeira em looping, torrada acima da torradeira e caminhada artificial.
- Porta: retirada CreateAndStartAnimation (loop implícito) e substituída por transição one-shot independente de FPS (0 → -1,28 rad em 820 ms), com posição final travada e sem replay ao restaurar save.
- Torrada: excluído disco cilíndrico solto na cota y=1,50 m; nova fatia vertical de pão com casca, realmente colocada dentro da ranhura da torradeira em y=1,195 m e ejetada uma única vez até y=1,39 m (base continua abaixo da fenda em y=1,367 m). Ao servir, torrada pousa à altura correta do prato.
- Passos: amplitude horizontal -0,092→-0,075 m, elevação do pé 5,5→3,2 cm, cadência mais baixa (ciclo de dois passos a cada 1,36 m, era 1,02 m), ombros e balanço de corpo reduzidos. Isso melhora a estética mas NÃO torna o rig um sistema profissional com malha deformada.
- Novo módulo sem loops v2/object-motion.js e testes unitários v2/tests/object-motion.test.cjs; testes de navegador v2/tests/objects.browser.cjs verificam abertura de porta uma única vez, permanência aberta inclusive após reload de save, torrada ancorada ao slot e sem nova animação após 2,4 s.
- Evidência CI: https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40125031947 (em execução na publicação desta nota). Teste Android joystick/hip com novo limite coerente com passo mais sutil: https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40125157931
- Gate artístico ainda reprovado; repetir vídeo Samsung real antes de aprovar. Branch feature isolada, main/v1.9 intocada.

## R15 — sequência geladeira → leite → mesa (100% grátis; 24/10/2026)

**Problema de fundo:** a missão avançava quando a Hanna tocava no botão, embora o ombro fosse o único pivô do braço. Abrir/pegar/servir eram genericamente simulados e os alimentos reapareciam na mão ou na mesa, sem preparação espacial.

**Implementado:**
- Fonte Blender original `v2/blender/build_hanna_r8.py` modificada para criar `ElbowLeft/RightPivot`, `WristLeft/RightPivot`, `HandLeft/RightGrip`, além dos quadris e joelhos existentes. O GLB é reconstruído gratuitamente pelo workflow Blender sem licenças pagas.
- `v2/interaction-anchors.js`: oito pares declarativos de *stand spot* (no piso acessível) e posição-alvo real de mão em coordenadas 3D da geladeira/leite/mesa/pão/torradeira.
- `v2/cozinha.js`: após apertar INTERAGIR, a Hanna se reposiciona andando devagar até a área acessível, gira em direção ao ponto de contato e só então inicia o gesto de alcançar. O braço direito usa ombro/cotovelo/pulso com aproximação cinemática de dois segmentos; o objeto carregado é preso ao `HandRightGrip` do GLB, e não ao corpo nem ao ombro.
- `v2/tests/interaction-anchors.test.cjs` verifica consistência com missão e proximidade dos alvos. `v2/tests/contacts.browser.cjs` executa sequência real Android simulada (geladeira, leite, mesa), mede ponto de parada e erro espacial da mão, e captura imagens.
- Joystick e lógica de frente aprovados pelo usuário foram preservados; progresso v2 permanece separado e PR segue em rascunho.

**Limitações:** a cinemática ainda usa pivôs segmentados, sem skinning/deformação profissional e sem clips finais do Blender. Aprovação estética premium e Samsung físico pendentes; testes Chromium não demonstram beleza por si sós.

**Evidências:** [CI R15 das três interações](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40134150898), [CI regressão v1.9](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40134154361).

## R16 — porta da geladeira visível (screenshot real do usuário)

A captura mostrava a missão no passo 2/8, mas a geladeira rosa parecia fechada. Causa: o yaw antigo -1,28 rad girava o painel para dentro, atrás do armário GLB maciço. Testar só o ângulo do pivô não comprovava visibilidade.

- R16 altera a porta para abrir para FORA, +1,44 rad em 1,02 s, sem loop. Após pegar o leite, fecha em 0,82 s sem repetir e sem reabrir ao restaurar a missão.
- O GLB B2_fridge_enclosure é um bloco maciço e fica oculto. Uma cavidade real com fundo, laterais, prateleiras e produtos substitui a parte sólida; a porta rosa, ímãs e maçaneta seguem presos à dobradiça.
- Leite físico passou para perto da abertura interna, e o contato da mão foi recalibrado para essa posição alcançável.
- O teste de navegador agora mede também se a cavidade existe, se o sólido foi ocultado, se há prateleiras visíveis quando aberta, o giro final e a porta fechada depois de retirar o leite.
- Fotos reais no Chromium Android emulado precisam ser conferidas; a interação ainda não tem selo premium.

CI da porta e torrada: https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40148731281
PR #10 permanece draft, v1.9 main preservada.