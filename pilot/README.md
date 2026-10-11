# Casa da Hanna 3.0 — Cozinha piloto (isolada)

**Escopo**: um cômodo novo e sua própria missão Café da Manhã; não muda a lógica da v1.9.
**Versão publicada**: \`main\` continua no commit 53e3646204699b30af0d3f5685ee70c5a6ba2b4d.
**Visual**: stylized/cozy cartoon 3D com modelos KayKit Restaurant & Furniture Bits (CC0), palette pastel e iluminação suave. Sem compras nem IA paga.

## Arte, controles e interação
- Todos os modelos vêm de dois repositórios originais CC0 e são instalados de forma determinística por \`node pilot/install-assets.cjs\`. Assets versionados em \`pilot/assets\`; não há dependência desses dois repositórios durante o jogo.
- Câmera 3/4 ortográfica, com acompanhamento moderado, sem parede frontal, adaptação retrato/paisagem.
- Toque no objeto: seleciona alvo e a personagem percorre um caminho real (grid A*, sem teleporte). Alternativa: botão 'IR ATÉ' da missão. Controle manual: joystick/WASD e setas.
- Ao chegar, botão de ação mostra ação válida. Não executar 'pegar pão' quando a missão pede 'leite'. Objetos da missão têm IDs exclusivos.
- Missão piloto de 8 etapas: geladeira, leite, mesa, pão, torradeira, torrada, mesa. Salva progresso apenas em \`hanna_kitchen_pilot_v1\`, isolado do jogo principal.
- Gestos livres não alteram a câmera; câmera intencionalmente previsível para uso infantil. Pincelada e detalhes visuais simples são sintéticos, não itens de loja.

## Gate de aceitação
- Playwright navega sem manipular posição do avatar, sem teleporte e com percurso real, testando em desktop, Android retrato e paisagem emulados.
- Capturas screenshot dos dois formatos, métricas de FPS e logs.
- Teste em **Android físico/iPhone** e revisão artística humana **ainda necessários**. Não declarar qualidade de console/estúdio.

## Executar localmente
\`\`\`sh
node pilot/install-assets.cjs
python3 -m http.server 8765
# http://localhost:8765/pilot/cozinha.html
\`\`\`
