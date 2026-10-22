# Hanna jogável — contrato de direção artística (22/10/2026)

A referência visual oficial é **a última ficha cartoon aprovada na conversa**, baseada nas duas fotos reais da Hanna fornecidas pelo responsável. As fotos e a ficha **não** são renders do jogo e não devem ser confundidas com o resultado real no Babylon.js.

## Silhueta e identidade obrigatórias
- Menina infantil com proporções estilizadas de criança, não boneca feita de bolinhas.
- Cabelo castanho-escuro comprido, preso alto em rabo de cavalo, laço grande rosa; mechas onduladas na testa e contorno do rosto.
- Olhos castanhos grandes, integrados ao rosto, com pálpebras, cílios discretos, sorriso expressivo. Rosto harmonioso em frente, 3/4 e perfil.
- **Regata verde-água com três flores**, **saia rosa de camadas com laço**; pernas descobertas, meias brancas, tênis estilo cano alto rosa com coração e cadarços.
- **Mochila de polvo fofinho pastel** com tentáculos rosa, lilás, creme, olhos e sorriso, colocada nas costas. Não é adorno opcional.
- Paleta: verde-água, rosa, lilás, creme, cabelo marrom; materiais suaves, sem textura de plástico/borracha brilhante.

## Integração funcional
O alvo final é um **arquivo 3D GLB para a personagem controlável do jogo**, não um sprite, imagem 2D ou imagem gerada aqui. O modelo precisa ter pivôs/rig ou esqueleto para caminhada, parada, giro e interação, escala e colisão adequadas, exportação carregável no Babylon.js e suporte a retrato/paisagem. A mochilinha acompanha o corpo.

## Portões de qualidade
1. Render frontal: rosto natural, sem olhos saltados; roupa e polvo facilmente reconhecíveis.
2. Render 3/4 e perfil: cabelo com volume coerente, nada atravessando rosto/corpo; mochila bem posicionada.
3. Preview Babylon.js: modelo real gira e caminha, sem tela preta, sem sumir, com câmera adequada.
4. Emulação mobile retrato/paisagem: botões acessíveis, modelo enquadrado.
5. Qualidade premium **somente por revisão visual do resultado real + teste físico**. Teste de arquivo, 3D ou CI verde, sozinho, não aprova arte.

## Regras
- Sem Codex, sem geração de novas imagens no chat e sem gastos.
- Biblioteca de fotos reais não é enviada para serviços externos de reconstrução facial.
- Todo trabalho em branch isolada. `main` v1.9 intacta.
- Se reprovar, registrar defeitos e fazer outra rodada; não expandir cozinha enquanto personagem reprova.

**Situação na abertura:** GLB R3 em branch funcional, visual reprovado comparado à nova referência. R4 precisa trocar a roupa, melhorar cabelo e criar a mochila polvo **como geometria 3D exportável**.
