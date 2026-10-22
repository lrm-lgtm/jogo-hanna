# Portões de qualidade — Personagem jogável da Casa da Hanna

Referência imutável: ficha da Hanna produzida a partir das duas fotos fornecidas no chat. O alvo **não é uma imagem de conceito**, é um **personagem 3D interativo dentro do jogo**, com silhueta, cabelos, olhos, roupas e mochila coerentes.

## Linha auditada em 22/10/2026

| Rodada | Tecnologia | Navegador | Inspeção artística |
|---|---|---|---|
| R3 | Blender procedural | Aprovado em Chromium | **Reprovado**: boneca toy, olhos/roupa/cabelo diferentes da referência |
| R4 | Blender original, figurino + polvo GLB | **Aprovado**: 8 etapas, retrato, paisagem; PR #8 | **Reprovado**: aparência estilizada simples, cozinha low-poly |
| R5 | Blender procedural refinado | **Aprovado**: 8 etapas com GLB real e câmera maior | **Reprovado**: cabelo/franja e rosto ainda artificiais |
| R6 | VRoid HairSample_Female CC0, rig real | Aprovado como visualizador | **Reprovado como Hanna**: base adulta/anime, outra roupa |
| R7 | VRoid base recolorida, polvo e laço em Blender | Aprovado em visualizador | **Reprovado**: polvo à frente e braços T-pose |
| R8 | VRoid + polvo reposicionado atrás | Aprovado (visualizador) | **Reprovado**: braços em T e roupa inadequada |
| R9 | VRoid + costura sem serrilhado e animação de repouso | Aprovado tecnicamente | **Reprovado**: braços atravessando região do rosto |
| R10 | Verificação de ângulos e distância mão-ombro no próprio Blender | **Reprovado (bloqueado antes do GLB)** | Teste geométrico encontrou mão 6,8 cm abaixo do ombro — não publicar |


Os resultados objetivos são distintos: um teste de **carregamento GLB ou movimento não equivale** a teste visual aprovado. É vedado usar "premium" como status sem inspeção da versão importada no Babylon.js, e desempenho de Chromium SwiftShader não é medição de FPS real no celular.

## Prioridades para a próxima promoção de status

- [ ] Cabelo escuro alto, laço rosa, olhos naturais e proporções infantis próximos da ficha
- [ ] Regata floral verde-água, saia rosa com pano natural, tênis cano alto
- [ ] Mochila polvo **nas costas**, com olhos, tentáculos e corpo fofo bem legíveis
- [ ] Braços abaixados em repouso, animações de caminhada/correr e pegar com **rig/skinning correto**, sem pose T
- [ ] Capturas reais frontal/3⁄4/lateral, retrato/paisagem in-game, nenhuma imagem gerada no chat
- [ ] Câmera de acompanhamento, colisões, 8/8 etapas sem teleporte
- [ ] Teste no Android físico antes de declarar 30 FPS
- [ ] Acordo visual explícito; só então migrar para main

**Não mexer na main v1.9, não avançar ambientes antes do gate da personagem, não publicar como jogo premium.**

## Entregável real de uso — R5
- [Jogar cozinha com Hanna R5 real em GLB](https://rawcdn.githack.com/lrm-lgtm/jogo-hanna/82ce0ad978548911ad890f03d6758a589f9483b0/pilot/cozinha.html)
- [Run 3/3 testes sem teleporte](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/39727460434)
- [PR R5 de integração](https://github.com/lrm-lgtm/jogo-hanna/pull/9)
- [Pesquisa CC0 VRoid R6–R10 isolada](https://github.com/lrm-lgtm/jogo-hanna/tree/feature/hanna3-r6-cc0-avatar-base-20261022); não é a Hanna final
- [R10 geometric gate failed, with logs](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/39729739232)

**Decisão artística:** nenhum dos modelos atinge a semelhança de acabamento, cabelo/rosto e roupa da ficha; não promover nenhuma branch a `main`. A próxima abordagem exige um pipeline de asset de alta fidelidade que entregue a geometria próxima da ficha, não mais retoques mínimos em malhas toy ou sample adulto.
