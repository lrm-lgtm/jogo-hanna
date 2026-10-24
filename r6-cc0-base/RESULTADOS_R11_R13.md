# Registro artístico R11–R13 — Casa da Hanna (24/10/2026)

**Fonte da qualidade-alvo:** ficha cartoon da Hanna baseada nas fotos que o responsável trouxe na conversa. Essas fotos não foram enviadas ao serviço VRoid nem versionadas neste repositório. O objetivo é **personagem 3D jogável dentro da Casa da Hanna**, não uma arte estática.

## Avaliação com screenshots reais em Babylon.js

| Rodada | O que mudou | Teste técnico | Resultado visual |
|---|---|---|---|
| **R11** | Postura corrigida por vetores ombro-mão da armadura importada. | PASSOU. 119 ossos; mãos 0,4235 m abaixo dos ombros e apenas 0,0904 m de deslocamento horizontal em repouso. Chromium desktop e retrato. | **REPROVADO**: rosto/cabelo anime, mangas longas, silhueta adulta e figurino distante da ficha. Postura é a melhor das três. |
| **R12** | Tentativa de substituir mangas por braços esculpidos e skinnados separadamente. | PASSOU exportação e carregamento GLB. | **REPROVADO**: braços se destacam como volumes desconectados do corpo; flores no local errado. Não promover. |
| **R13** | Tentativa de reutilizar a própria malha skinnada da roupa; recoloração das mangas e redução do volume. | PASSOU exportação e carregamento GLB. | **REPROVADO**: braços viram hastes pontiagudas e finas; não promover. |

## Evidências

- [R11 desktop](./evidence/desktop-r11-customized.png) e [R11 retrato](./evidence/portrait-r11-customized.png)
- [R12 desktop](./evidence/desktop-r12-customized.png) e [R12 retrato](./evidence/portrait-r12-customized.png)
- [R13 desktop](./evidence/desktop-r13-customized.png) e [R13 retrato](./evidence/portrait-r13-customized.png)
- [R11 CI](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40066403179): sucesso técnico
- [R12 CI](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40066669182): sucesso técnico, falha artística
- [R13 CI](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/40066878769): sucesso técnico, falha artística

## Decisão técnica

**Não seguir cortando/recolorindo a malha de amostra com regras geométricas grosseiras.** O tecido da amostra é inteiramente outro figurino, e não possui a modelagem infantil correta por baixo. É necessário um **asset base com roupa e silhueta adequadas**, remodelado no Blender com rig compatível, antes de executar outra integração. Não basta "mais rodadas" de alterações de cor ou formato na mesma malha.

**Melhor entrega jogável atualmente:** Hanna R5, com [8/8 passos e CI funcional aprovada](https://github.com/lrm-lgtm/jogo-hanna/actions/runs/39727460434); visual não premium.

**Melhor progresso técnico com rig completo:** R11, com braços abaixados e 119 ossos; não é fiel à ficha. Preservar somente como protótipo de animação, sem integrar no jogo. Branch `main` v1.9 não alterada.

**Regras:** orçamento R$ 0, sem Codex, sem geração de novas imagens no chat, sem merge ou "premium aprovado" artificial, sem download ou upload das fotos da Hanna em serviços externos.
