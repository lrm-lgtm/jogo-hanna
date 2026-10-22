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

PENDÊNCIAS: a primeira carga ainda usa Babylon CDN; SW tenta guardar scripts para uso posterior offline. FPS, tamanho, iPhone/Android físicos e comparação visual premium NÃO estão comprovados. A personagem continua sendo a R5 (rig simples), não a Hanna final. Não mesclar automaticamente.
