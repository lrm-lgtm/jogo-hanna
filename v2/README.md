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
