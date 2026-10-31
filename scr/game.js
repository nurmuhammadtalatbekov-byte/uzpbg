import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const mount = document.getElementById('game');
const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');
const hud = document.getElementById('hud');
const toastEl = document.getElementById('toast');
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
if (isTouch) document.getElementById('mobileControls').style.display = 'block';

let renderer, scene, camera, clock, player, weaponMesh, zoneMesh;
let enemies=[], loot=[], keys={}, bullets=[], particles=[];
let running=false, gameOver=false, pointerLocked=false;
let hp=100, stamina=100, kills=0, elapsed=0, zoneRadius=105, zoneStartDelay=35, zoneShrinkTime=130;
let fireCooldown=0, enemySpawn=12, toastTimer=0, lootCount=0, lastHit=0;
const WORLD=240, UP=new THREE.Vector3(0,1,0);
const moveInput={x:0,y:0}, joyState={active:false,id:null,x:0,y:0,originX:0,originY:0};
const mat=(color,roughness=0.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const materials={
 grass:mat('#4c7652'), sand:mat('#b8a36f'), road:mat('#303a40'), concrete:mat('#8b9894'),
 white:mat('#e6dfc8'), blue:mat('#1e6879'), terracotta:mat('#b96f4b'), dark:mat('#172832'),
 roof:mat('#8e5540'), glass:new THREE.MeshStandardMaterial({color:'#5fc9cf',roughness:.25,metalness:.2}),
 player:mat('#25d8b7'), enemy:mat('#bd5a45'), skin:mat('#d7a57c'), loot:mat('#f8d66d',.3,.2)
};
function box(w,h,d,material,x,y,z, parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function showToast(msg){toastEl.textContent=msg;toastEl.style.opacity=1;toastTimer=2.2;}
function random(min,max){return min+Math.random()*(max-min);}
function randomPoint(radius=90){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*radius;return new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r);}
function init(){
 renderer=new THREE.WebGLRenderer({antialias:!isTouch,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:2));renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=!isTouch;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 mount.appendChild(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color('#8fc8d0');scene.fog=new THREE.FogExp2('#8fc8d0',0.0037);
 camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,500);
 clock=new THREE.Clock();
 const hemi=new THREE.HemisphereLight('#d9f8ff','#46533a',2.1);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff0ce',3.1);sun.position.set(-55,90,45);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-130;sun.shadow.camera.right=130;sun.shadow.camera.top=130;sun.shadow.camera.bottom=-130;scene.add(sun);
 buildWorld();createPlayer();createEnemies(11);createLoot(28);createZone();
 window.addEventListener('resize',resize);
 document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','Tab'].includes(e.code))e.preventDefault();if(e.code==='KeyE')pickupLoot();if(e.code==='Escape'&&running&&!isTouch)document.exitPointerLock?.();});
 document.addEventListener('keyup',e=>keys[e.code]=false);
 renderer.domElement.addEventListener('click',()=>{if(running&&!isTouch&&!pointerLocked)renderer.domElement.requestPointerLock?.();else if(running)shoot();});
 document.addEventListener('pointerlockchange',()=>{pointerLocked=document.pointerLockElement===renderer.domElement;});
 document.addEventListener('mousemove',e=>{if(running&&pointerLocked){player.yaw-=e.movementX*.0024;player.pitch=THREE.MathUtils.clamp(player.pitch-e.movementY*.0018,-.45,.5);}});
 setupTouch();animate();
}
function buildWorld(){
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,WORLD),materials.grass);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 // A ring road and roads crossing the map
 const road1=box(WORLD,.08,13,materials.road,0,.035,0);const road2=box(13,.08,WORLD,materials.road,0,.04,0);
 for(let i=-100;i<=100;i+=8){box(.18,.025,2,materials.white,i,.09,0);box(2,.025,.18,materials.white,0,.095,i);}
 // Distant hills
 for(let i=0;i<42;i++){let p=randomPoint(145);let hill=new THREE.Mesh(new THREE.ConeGeometry(random(7,18),random(12,35),7),mat(i%2?'#6b8870':'#7b9a7b'));hill.position.set(p.x,-4,p.z);hill.rotation.y=Math.random()*6.28;scene.add(hill);}
 // Uzbek-inspired town blocks, courtyards, domes and landmarks
 const districts=[
  {x:-52,z:-44,name:'ESKI SHAHAR',color:materials.terracotta},
  {x:48,z:-42,name:'YANGI TUMAN',color:materials.blue},
  {x:-50,z:48,name:'BOZOR',color:materials.roof},
  {x:50,z:48,name:'QAL’A',color:materials.white}
 ];
 districts.forEach((d,di)=>{
  for(let i=0;i<12;i++){
   let x=d.x+random(-19,19),z=d.z+random(-18,18);
   if(Math.abs(x)<10||Math.abs(z)<8)continue;
   let w=random(5,10),dep=random(5,9),h=random(4,12);
   const building=box(w,h,dep,[d.color,materials.concrete,materials.white,materials.blue][Math.floor(Math.random()*4)],x,h/2,z);
   // windows on the street-facing side
   for(let yy=1.7;yy<h-1;yy+=2.3){
    for(let xx=-w/2+1;xx<w/2-0.5;xx+=2.2){
     box(.8,.9,.06,materials.glass,x+xx,yy,z+dep/2+.04);
    }
   }
   // parapet / roof accent
   if(di===0||di===3){box(w+.4,.45,dep+.4,materials.roof,x,h+.2,z);}
  }
  // courtyard walls
  const cx=d.x,cz=d.z;
  box(24,1.4,.5,materials.white,cx,0.7,cz-18);box(24,1.4,.5,materials.white,cx,.7,cz+18);
  box(.5,1.4,36,materials.white,cx-12,.7,cz);box(.5,1.4,36,materials.white,cx+12,.7,cz);
 });
 // Landmark dome
 const domeMat=mat('#d9b65f',.45,.25);
 const base=box(12,8,12,materials.white,0,4,-35);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(6,20,12,0,Math.PI*2,0,Math.PI/2),domeMat);dome.position.set(0,8,-35);scene.add(dome);
 const tower=box(4,15,4,materials.terracotta,0,7.5,28);
 const cap=new THREE.Mesh(new THREE.ConeGeometry(3.5,4,8),domeMat);cap.position.set(0,17,28);scene.add(cap);
 // Trees
 for(let i=0;i<100;i++){
  let p=randomPoint(112);if(Math.abs(p.x)<12||Math.abs(p.z)<12)continue;
  box(.65,3,.65,mat('#76533b'),p.x,1.5,p.z);
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(random(1.5,2.5),1),mat(i%2?'#3d7b53':'#548c5b'));crown.position.set(p.x,4,p.z);crown.castShadow=true;scene.add(crown);
 }
 // Rocks and roadside containers
 for(let i=0;i<30;i++){let p=randomPoint(100);if(Math.abs(p.x)<12||Math.abs(p.z)<12)continue;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(random(.7,1.8),0),mat('#737e78'));rock.position.set(p.x,.7,p.z);rock.scale.y=.7;scene.add(rock);}
 // decorative parked vehicles
 for(let i=0;i<7;i++){const p=randomPoint(90);makeCar(p.x,p.z,i%3);}
}
function makeCar(x,z,type=0){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.random()*Math.PI;
 const bodymat=[mat('#2a9d8f'),mat('#d2b15f'),mat('#c45c46')][type%3];
 box(3.7,1.05,6,bodymat,0,1,0,g);box(2.7,1.05,2.7,materials.glass,0,1.95,-.2,g);
 for(const wx of [-1.9,1.9])for(const wz of [-1.9,1.9]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.32,12),mat('#151a20'));wh.rotation.z=Math.PI/2;wh.position.set(wx,.55,wz);g.add(wh);}
 scene.add(g);return g;
}
function createPlayer(){
 const group=new THREE.Group();group.position.set(0,0,15);scene.add(group);
 const body=box(1.05,1.45,.65,materials.player,0,1.55,0,group);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.38,16,12),materials.skin);head.position.set(0,2.55,0);head.castShadow=true;group.add(head);
 const pack=box(.65,.8,.3,materials.terracotta,0,1.65,-.48,group);
 const gun=box(.16,.18,1.5,mat('#202a30',.35,.6),.55,1.75,.5,group);
 player={group,yaw:0,pitch:0,velocityY:0,grounded:true,body,gun,speed:7};
}
function createEnemies(count){
 for(let i=0;i<count;i++){
  const p=randomPoint(78);if(p.length()<22)p.x+=30;
  const g=new THREE.Group();g.position.set(p.x,0,p.z);scene.add(g);
  const color=mat(['#bd5a45','#d6a345','#7d77c9','#b5c4ca'][i%4]);
  box(.9,1.45,.6,color,0,1.5,0,g);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),materials.skin);head.position.y=2.48;g.add(head);
  const pack=box(.5,.7,.25,materials.dark,0,1.65,-.42,g);
  const marker=new THREE.Mesh(new THREE.ConeGeometry(.16,.35,4),mat('#ff7a63'));marker.position.y=3.1;g.add(marker);
  enemies.push({group:g,hp:100,alive:true,speed:random(1.7,2.7),attack:random(1.3,2.4),attackTimer:random(.4,1.8),wander:random(1,4),dir:randomPoint(1),color});
 }
}
function createLoot(count){
 const types=['DORI','KALTAK','ENERGIYA','KUCHAYTIRGICH'];
 for(let i=0;i<count;i++){
  const p=randomPoint(90);const g=new THREE.Group();g.position.set(p.x,.55,p.z);
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.55),materials.loot);crystal.position.y=.4;crystal.castShadow=true;g.add(crystal);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.75,.05,6,18),mat('#4df6d2',.3,.5));ring.rotation.x=Math.PI/2;g.add(ring);
  const light=new THREE.PointLight('#4df6d2',.7,4);light.position.y=.8;g.add(light);scene.add(g);
  loot.push({group:g,type:types[i%types.length],taken:false,phase:Math.random()*6.28});
 }
}
function createZone(){
 const geo=new THREE.RingGeometry(0.985,1,96);const material=new THREE.MeshBasicMaterial({color:'#4df6d2',side:THREE.DoubleSide,transparent:true,opacity:.75});
 zoneMesh=new THREE.Mesh(geo,material);zoneMesh.rotation.x=-Math.PI/2;zoneMesh.position.y=.16;zoneMesh.scale.set(zoneRadius,zoneRadius,1);scene.add(zoneMesh);
}
function resize(){if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
function setupTouch(){
 const joy=document.getElementById('joy');
 joy.addEventListener('pointerdown',e=>{joyState.active=true;joyState.id=e.pointerId;joyState.originX=e.clientX;joyState.originY=e.clientY;joy.setPointerCapture(e.pointerId);});
 joy.addEventListener('pointermove',e=>{if(!joyState.active||e.pointerId!==joyState.id)return;let dx=e.clientX-joyState.originX,dy=e.clientY-joyState.originY;const len=Math.max(1,Math.hypot(dx,dy)),scale=Math.min(1,48/len);moveInput.x=dx/len*scale;moveInput.y=-dy/len*scale;});
 const endJoy=e=>{if(e.pointerId!==joyState.id)return;joyState.active=false;moveInput.x=moveInput.y=0;};joy.addEventListener('pointerup',endJoy);joy.addEventListener('pointercancel',endJoy);
 document.getElementById('fireBtn').addEventListener('pointerdown',e=>{e.preventDefault();shoot();});
 document.getElementById('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(player.grounded){player.velocityY=7;player.grounded=false;}});
 document.getElementById('runBtn').addEventListener('pointerdown',e=>{e.preventDefault();keys.ShiftLeft=true;});
 document.getElementById('runBtn').addEventListener('pointerup',()=>keys.ShiftLeft=false);
 // Drag right side of screen to rotate camera on touch
 let lookId=null,lastX=0,lastY=0;
 renderer.domElement.addEventListener('pointerdown',e=>{if(!isTouch||e.clientX<innerWidth*.42)return;lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;});
 renderer.domElement.addEventListener('pointermove',e=>{if(!isTouch||lookId!==e.pointerId||!running)return;player.yaw-=(e.clientX-lastX)*.006;player.pitch=THREE.MathUtils.clamp(player.pitch-(e.clientY-lastY)*.004,-.45,.5);lastX=e.clientX;lastY=e.clientY;});
 renderer.domElement.addEventListener('pointerup',e=>{if(lookId===e.pointerId)lookId=null;});
}
function startGame(){
 startScreen.style.display='none';endScreen.style.display='none';hud.style.display='block';running=true;gameOver=false;
 if(!isTouch)renderer.domElement.requestPointerLock?.();
 clock.getDelta();showToast('Jang boshlandi! Jihozlarni yig‘ing va zonada qoling.');
}
function shoot(){
 if(!running||gameOver||fireCooldown>0)return;fireCooldown=.23;
 const origin=camera.position.clone();const dir=new THREE.Vector3();camera.getWorldDirection(dir);
 const ray=new THREE.Raycaster(origin,dir,0,65);
 const candidates=enemies.filter(e=>e.alive).map(e=>({e,box:new THREE.Box3().setFromObject(e.group)}));
 let best=null,bestDist=65;
 for(const item of candidates){const hit=ray.ray.intersectBox(item.box,new THREE.Vector3());if(hit){const d=hit.distanceTo(origin);if(d<bestDist){bestDist=d;best=item.e;}}}
 // tracer
 const end=origin.clone().add(dir.clone().multiplyScalar(bestDist));
 const points=[origin.clone(),end];const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#a8fff1',transparent:true,opacity:.8}));scene.add(line);setTimeout(()=>{scene.remove(line);line.geometry.dispose();line.material.dispose();},65);
 if(best){best.hp-=35;best.group.traverse(o=>{if(o.isMesh&&o.material?.emissive){o.material.emissive.set('#552211');}});if(best.hp<=0){best.alive=false;scene.remove(best.group);kills++;document.getElementById('kills').textContent=kills;showToast('Raqib zararsizlantirildi! +1 KILL');}else showToast('Nishonga tegdi!');}
}
function pickupLoot(){
 if(!running||gameOver)return;let nearest=null,dist=3.4;
 for(const item of loot){if(item.taken)continue;const d=item.group.position.distanceTo(player.group.position);if(d<dist){dist=d;nearest=item;}}
 if(!nearest){showToast('Yaqinda jihoz yo‘q.');return;}
 nearest.taken=true;scene.remove(nearest.group);lootCount++;
 if(nearest.type==='DORI')hp=Math.min(100,hp+25);
 else if(nearest.type==='ENERGIYA')stamina=Math.min(100,stamina+40);
 else if(nearest.type==='KUCHAYTIRGICH')hp=Math.min(100,hp+12);
 else showToast('Kaltak topildi — omad siz bilan!');
 updateBars();if(nearest.type!=='KALTAK')showToast(nearest.type+' olindi!');
}
function updatePlayer(dt){
 const forward=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
 const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));
 let ix=(keys.KeyD?1:0)-(keys.KeyA?1:0),iy=(keys.KeyW?1:0)-(keys.KeyS?1:0);
 if(isTouch){ix=moveInput.x;iy=moveInput.y;}
 const moving=Math.abs(ix)+Math.abs(iy)>.05;const sprint=(keys.ShiftLeft||keys.ShiftRight)&&stamina>1;
 const speed=sprint?10:6.3;
 if(sprint&&moving)stamina=Math.max(0,stamina-24*dt);else stamina=Math.min(100,stamina+12*dt);
 const direction=right.multiplyScalar(ix).add(forward.multiplyScalar(iy));if(direction.length()>1)direction.normalize();
 player.group.position.addScaledVector(direction,speed*dt);
 player.group.position.x=THREE.MathUtils.clamp(player.group.position.x,-WORLD/2+4,WORLD/2-4);
 player.group.position.z=THREE.MathUtils.clamp(player.group.position.z,-WORLD/2+4,WORLD/2-4);
 if(moving)player.group.rotation.y=player.yaw;
 if((keys.Space||keys.Spacebar)&&player.grounded){player.velocityY=7;player.grounded=false;}
 player.velocityY-=19*dt;player.group.position.y+=player.velocityY*dt;
 if(player.group.position.y<=0){player.group.position.y=0;player.velocityY=0;player.grounded=true;}
 const target=new THREE.Vector3(player.group.position.x+Math.sin(player.yaw)*8,player.group.position.y+3.2+player.pitch*5,player.group.position.z+Math.cos(player.yaw)*8);
 // camera sits behind the player, facing their forward direction
 const back=new THREE.Vector3(Math.sin(player.yaw),0,Math.cos(player.yaw));
 camera.position.set(player.group.position.x+back.x*7,player.group.position.y+3.2+player.pitch*5,player.group.position.z+back.z*7);
 camera.lookAt(player.group.position.x-back.x*4,player.group.position.y+1.5,player.group.position.z-back.z*4);
}
function updateEnemies(dt){
 for(const e of enemies){if(!e.alive)continue;
  const toPlayer=player.group.position.clone().sub(e.group.position);toPlayer.y=0;const d=toPlayer.length();
  e.attackTimer-=dt;e.wander-=dt;
  if(d<29){toPlayer.normalize();e.group.position.addScaledVector(toPlayer,e.speed*dt);e.group.rotation.y=Math.atan2(toPlayer.x,toPlayer.z);
   if(d<2.4&&e.attackTimer<=0){e.attackTimer=e.attack;hp=Math.max(0,hp-random(5,10));lastHit=1;showToast('Raqib hujum qildi!');updateBars();if(hp<=0)finish(false);}
  }else if(e.wander<=0){e.wander=random(1.5,4);e.dir=randomPoint(1);e.dir.normalize();}
  else {e.group.position.addScaledVector(e.dir,e.speed*.22*dt);}
  e.group.position.x=THREE.MathUtils.clamp(e.group.position.x,-WORLD/2+4,WORLD/2-4);e.group.position.z=THREE.MathUtils.clamp(e.group.position.z,-WORLD/2+4,WORLD/2-4);
 }
}
function updateZone(dt){
 if(elapsed>zoneStartDelay){zoneRadius=Math.max(16,105-(elapsed-zoneStartDelay)/zoneShrinkTime*89);zoneMesh.scale.set(zoneRadius,zoneRadius,1);}
 const p=player.group.position;const dist=Math.hypot(p.x,p.z);
 if(dist>zoneRadius){lastHit-=dt;if(lastHit<=0){hp=Math.max(0,hp-4);lastHit=.8;updateBars();if(hp<=0)finish(false);}}
 document.getElementById('zoneTime').textContent=elapsed<zoneStartDelay?formatTime(zoneStartDelay-elapsed):'TORAYMOQDA';
}
function updateBars(){
 document.getElementById('hpBar').style.width=hp+'%';document.getElementById('hpText').textContent=Math.ceil(hp)+' / 100';
 document.getElementById('stBar').style.width=stamina+'%';document.getElementById('stText').textContent=Math.ceil(stamina)+'%';
}
function updateMap(){
 const c=document.getElementById('miniMap'),ctx=c.getContext('2d'),w=c.width;ctx.clearRect(0,0,w,w);
 ctx.fillStyle='#102a30';ctx.fillRect(0,0,w,w);
 const sc=w/WORLD,center=w/2;
 ctx.strokeStyle='#829c91';ctx.lineWidth=8;ctx.strokeRect(center-WORLD/2*sc,center-WORLD/2*sc,WORLD*sc,WORLD*sc);
 ctx.fillStyle='#687a70';for(let i=0;i<4;i++){ctx.fillRect((35+i*33)*sc,35*sc,22*sc,22*sc);}
 ctx.strokeStyle='#4df6d2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(center,center,zoneRadius*sc,0,Math.PI*2);ctx.stroke();
 for(const e of enemies){if(!e.alive)continue;ctx.fillStyle='#ff7766';ctx.fillRect(center+e.group.position.x*sc-2,center+e.group.position.z*sc-2,4,4);}
 ctx.fillStyle='#f5ffad';ctx.beginPath();ctx.arc(center+player.group.position.x*sc,center+player.group.position.z*sc,4,0,Math.PI*2);ctx.fill();
}
function formatTime(t){t=Math.max(0,Math.ceil(t));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}
function finish(win){
 if(gameOver)return;gameOver=true;running=false;if(document.pointerLockElement)document.exitPointerLock();
 endScreen.style.display='flex';document.getElementById('endTitle').textContent=win?'G‘ALABA!':'MAG‘LUBIYAT';document.getElementById('endStats').textContent=kills+' KILL · '+lootCount+' JIHOZ';
 document.getElementById('endText').textContent=win?'Maydon sizniki! Sinfdoshlaringizga ham chaqiriq tashlang.':'Bu safar omad kelmadi. Yana bir bor urinib ko‘ring.';
}
function resetGame(){
 for(const e of enemies)scene.remove(e.group);for(const l of loot)scene.remove(l.group);
 enemies=[];loot=[];if(player)scene.remove(player.group);if(zoneMesh)scene.remove(zoneMesh);
 bullets=[];hp=100;stamina=100;kills=0;elapsed=0;zoneRadius=105;lootCount=0;lastHit=0;
 document.getElementById('kills').textContent='0';player=null;createPlayer();createEnemies(11);createLoot(28);createZone();updateBars();startGame();
}
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
 if(running&&!gameOver){
  elapsed+=dt;fireCooldown=Math.max(0,fireCooldown-dt);updatePlayer(dt);updateEnemies(dt);updateZone(dt);
  for(const l of loot){if(!l.taken){l.group.rotation.y+=dt*.9;l.group.position.y=.55+Math.sin(elapsed*2+l.phase)*.15;}}
  if(enemies.every(e=>!e.alive))finish(true);
  document.getElementById('alive').textContent=Math.max(1,enemies.filter(e=>e.alive).length+1);
  updateMap();updateBars();
 }
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toastEl.style.opacity=0;}
 if(renderer&&scene&&camera)renderer.render(scene,camera);
}
document.getElementById('startBtn').addEventListener('click',()=>{if(!renderer)init();startGame();});
document.getElementById('howBtn').addEventListener('click',()=>showToast(isTouch?'Chap tomondagi joystik — yurish. O‘ng tomonni suring — kamerani burish. OTISH, SAKRASH, E loot.':'WASD yurish · SHIFT yugurish · SPACE sakrash · Sichqoncha chap klik otish · E jihoz olish. Nishonni sichqoncha bilan boshqarish uchun maydonni bosing.'));
document.getElementById('againBtn').addEventListener('click',()=>resetGame());
document.getElementById('menuBtn').addEventListener('click',()=>{endScreen.style.display='none';startScreen.style.display='flex';hud.style.display='none';});
window.addEventListener('keydown',e=>{if(e.code==='KeyE')pickupLoot();if(e.code==='KeyF')shoot();});
