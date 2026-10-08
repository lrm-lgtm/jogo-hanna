# 🏡 Casa da Hanna

Jogo infantil 3D em português, feito para navegador/celular.

## 🎮 Jogar agora

**https://lrm-lgtm.github.io/jogo-hanna/**

## Versão atual — v1.9.0 Estabilização

Esta versão corrige regressões da v1.8 **sem apagar ou refazer as 16 missões**.
Para o diagnóstico detalhado, motivos técnicos e limitações, veja
[docs/REVISAO-V1.9.md](docs/REVISAO-V1.9.md).

- distância de câmera adaptada a retrato/paisagem (evita enquadramento excessivamente fechado);
- restauração da transparência pontual de paredes que bloqueiam a personagem;
- correção do centro e da orientação espacial do sofá glTF;
- desativação da mesa de centro redundante importada pelo código antigo;
- colisões simples alinhadas a sofá, mesa de centro, rack e cadeiras novas;
- manutenção das áreas invisíveis usadas pela jogabilidade sem obstáculos fantasmas;
- interface com textos mais legíveis e joystick/botão de ação maiores;
- objetos carregados alinhados à mão direita em mais convenções de esqueleto;
- correção da orientação dos objetos prato e regador;
- preservação de PWA, salvamento local e missões (10 principais + 6 extras).

**Referência recuperável:** `edca592c` (v1.8.0), também disponível em
`backup/v1.8-before-v1.9-2026-10-08`.

### O que ainda exige validação em aparelho real

A qualidade final do visual, a animação importada e o carregamento de assets
externos só podem ser julgados em partida real no Android/iPhone e no desktop.
Os testes automatizados verificam estrutura, sintaxe e consistência do código,
não substituem um teste visual.

### Missões extras
1. Escovar os dentes
2. Lavar as mãos
3. Roupa no cesto
4. Cuidar das flores
5. Guardar o quintal
6. Banho do cachorro

Abra no Safari do iPhone e use **Compartilhar → Adicionar à Tela de Início** para instalar como app.
