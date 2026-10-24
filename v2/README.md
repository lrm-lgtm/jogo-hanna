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
