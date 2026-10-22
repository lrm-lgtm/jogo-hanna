# Casa da Hanna 3 — oficina gratuita de personagem 3D

## Objetivo
Produzir **uma personagem original** com acabamento cartoon, antes de redesenhar a cozinha. A versão principal do jogo permanece preservada.

## Pipeline implementado
- `build_hanna.py`: Blender (livre) gera geometria real do modelo, materiais, olhos, rosto, cabelo, roupa, calçados, laço e detalhes. A geometria e as texturas não dependem de assinaturas ou modelos pagos.
- `character-v3/build/hanna-v3.glb`: saída glTF 2.0, para animação básica em Babylon.js. Arquivo somente existe **após build bem-sucedido** no GitHub Actions.
- `character-v3/build/hanna-front.png`, `hanna-threequarter.png` e `hanna-profile.png`: imagens renderizadas pelo Blender, que servem como **evidência real do 3D**, não como conceitos gerados por IA.
- `preview.html` e `preview.js`: visualizador de modelo, giro por toque, modo caminhada e tela adaptável ao celular.
- `preview.test.cjs`: teste em navegador (real GLB carregado e controles), com screenshots em dois tamanhos.
- `hanna3-character-art.yml`: GitHub Actions instala Blender gratuito, gera os arquivos e publica apenas na branch experimental.

## Comandos
```bash
blender --background --factory-startup --python character-v3/build_hanna.py
python3 -m http.server 8765
# http://localhost:8765/character-v3/preview.html
```

## Premissas
A personagem é um **personagem original de ficção**; não pretende representar fisicamente a filha do usuário. É uma primeira construção artisticamente trabalhada, porém ainda procedural e com animações simples por pivôs, **não um rig de deformação profissional**. A qualidade premium **não pode ser considerada alcançada** sem revisão dos renders, das proporções e do modelo em hardware real. Orçamento: R$ 0.

O pipeline não utiliza Codex nem serviços pagos. Não tocar em `main` ou no jogo legado antes de aprovação visual expressa.
