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
