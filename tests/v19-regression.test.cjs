/* Testes estáticos de regressão — Node 22, sem dependências. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const scripts=[
 'loader.js','mobile-fix.js','v13-motion.js','v14-world.js',
 'v15-remaster.js','v16-cinematic.js','v17-sala-a.js','v17-sala-b.js',
 'src/core-game.js','sw.js','src/build-payload.cjs'
];
for(const file of scripts){
 new vm.Script(read(file),{filename:file});
 console.log('PASS sintaxe:',file);
}
const html=read('index.html'),css=read('game.css'),sw=read('sw.js');
assert.match(html,/v1\.9\.0/);
assert.match(html,/game\.css\?v=1\.9\.0/);
assert.match(sw,/jogo-hanna-v1\.9\.0-stability/);
assert.match(css,/#mission\{/);
assert.match(css,/#useBtn\{/);
assert.match(css,/#assetBadge\.warn\{/);
assert.match(read('v16-cinematic.js'),/updateOcclusion/);
assert.match(read('v16-cinematic.js'),/radiusForViewport/);
assert.match(read('v17-sala-a.js'),/hannaSofaContent/);
assert.match(read('v17-sala-a.js'),/hannaSofaCollision/);
assert.match(read('v17-sala-b.js'),/hideLegacyCoffee/);
assert.match(read('v17-sala-b.js'),/hannaCoffeeCollision/);
assert.match(read('v13-motion.js'),/findRightHand/);
for(const match of html.matchAll(/<script\s+src="\.\/([^"?]+)\?v=/g)){
 assert.ok(fs.existsSync(path.join(root,match[1])),match[1]+' não existe');
}
const payload=['game-gz-1.txt','game-gz-2.txt','game-gz-3.txt','game-gz-4.txt']
 .map(name=>read('payload/'+name).trim()).join('');
assert.equal(zlib.gunzipSync(Buffer.from(payload,'base64')).toString('utf8'),read('src/core-game.js'));
console.log('PASS payload: idêntico ao core');
console.log('PASS v1.9: versões, HUD, assets, câmera, colisões e documentação');
