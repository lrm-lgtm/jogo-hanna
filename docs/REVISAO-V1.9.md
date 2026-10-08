# Casa da Hanna — Registro técnico da revisão v1.9

Data: 08/10/2026. Base observada: v1.8.0 (commit `edca592c`).
Objetivo: corrigir regressões sem recomeçar o jogo, sem alterar missões ou
reinicializar o progresso dos jogadores.

## Diagnóstico consolidado

| Área | Evidência no código da v1.8 | Ação da v1.9 |
| --- | --- | --- |
| Câmera | Raio fixado em `4.7` mesmo com cômodos e orientação móvel | Distância responsiva e maior campo útil |
| Oclusão | Passes anteriores de ocultação de paredes removidos | Transparência local com restauração de material |
| Sofá 3D | Offset de bounding box aplicado após rotação de holder | Centralização local, escala/rotação no holder |
| Sala | Mesa do pacote de restaurante + mesa procedural da v1.7 | Desabilitar apenas a importação redundante |
| Colisões | Geometria antiga era ocultada, mas mantida como parede invisível | Colisões simples que acompanham os novos móveis |
| Interação | Mesa e planta originais ainda são alvos de missão | Manter hitboxes selecionáveis mesmo com aparência substituída |
| Interface | Joystick, ação e textos diminuídos em telas pequenas | Tamanhos e alinhamentos melhores para crianças |
| Objetos carregados | `prato` lateralizado, `regador` deitado e nomes de mão incompletos | Orientação corrigida e mais nomes de ossos aceitos |

## Regras para futuras versões

1. Não substituir a geometria visual sem revisar colisão, alvo de interação
   e comportamento de missão.
2. Não empilhar móveis de bibliotecas diferentes no mesmo local. Definir
   uma única versão visual por objeto, mantendo hitbox de gameplay separada.
3. Nunca reduzir controles ou instruções só para deixar a interface menor;
   a Hanna deve conseguir jogar pelo toque em celular.
4. Câmera precisa respeitar a geometria da casa e mostrar o objetivo, não
   apenas aproximar a personagem.
5. Alterações visuais devem ter antes/depois no **mesmo aparelho e enquadramento**
   e teste de pelo menos uma missão por cômodo.
6. Manter o projeto e o cache PWA versionados, além de uma referência de rollback.

## Matriz de validação manual (ainda pendente)

- Android em paisagem e retrato: câmera, giro com um dedo, sem zoom por pinça.
- iPhone em paisagem: orientação, toque de ação e bordas seguras.
- Sala: sofá sem deslocamento, uma mesa de centro, TV sem duplicação,
  móveis bloqueando passagem apenas onde existem.
- Cozinha: pegar leite, interagir com geladeira e colocar item na mesa.
- Quarto: pegar e posicionar o ursinho, interagir com o bebê.
- Cão: interação, animação e passagem livre.
- Persistência: concluir etapa, fechar e reabrir, sem perder progresso.
- Conectividade: primeira carga online e retorno offline via PWA.

## Referências

- Jogo: https://lrm-lgtm.github.io/jogo-hanna/
- Repo: https://github.com/lrm-lgtm/jogo-hanna
- Rollback: `backup/v1.8-before-v1.9-2026-10-08`.
- Core preservado: `src/core-game.js` e payload compactado, sem mudança na v1.9.

### Questões em aberto

Animar mãos/pés de um glTF sem movimentos adequados exige confirmar as
animações presentes na versão real do asset. A compatibilidade e desempenho de
assets externos ainda dependem de teste em navegador real. Não declarar
`100% corrigido` sem executar essa validação.
