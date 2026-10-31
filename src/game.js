<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>ZONA — Survival Arena</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{overflow:hidden;font-family:'Segoe UI',system-ui,sans-serif;background:#0a0f14;color:#fff;user-select:none}
  #game{position:fixed;inset:0}
  canvas{display:block}

  /* ================= HUD ================= */
  #hud{display:none;position:fixed;inset:0;pointer-events:none;z-index:10}

  .hud-top{position:absolute;top:18px;left:50%;transform:translateX(-50%);display:flex;gap:14px}
  .hud-pill{
    background:linear-gradient(135deg,rgba(15,25,35,.85),rgba(10,18,26,.85));
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(77,246,210,.25);border-radius:14px;
    padding:10px 20px;display:flex;align-items:center;gap:10px;
    box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.05);
    font-size:14px;font-weight:600;letter-spacing:.5px;
  }
  .hud-pill .dot{width:8px;height:8px;border-radius:50%;background:#4df6d2;box-shadow:0 0 10px #4df6d2;animation:pulse 1.6s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

  .hud-stats{position:absolute;top:80px;left:20px;display:flex;flex-direction:column;gap:10px;width:220px}
  .stat-block{
    background:linear-gradient(135deg,rgba(15,25,35,.9),rgba(10,18,26,.85));
    backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.08);
    border-radius:12px;padding:10px 14px;box-shadow:0 6px 24px rgba(0,0,0,.35);
  }
  .stat-row{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px;letter-spacing:.8px;text-transform:uppercase}
  .stat-row .label{color:#8fa4b0}
  .bar-track{height:8px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;position:relative}
  .bar-fill{height:100%;border-radius:99px;transition:width .25s ease}
  #hpBar{background:linear-gradient(90deg,#ff4d6d,#ff8fa3);box-shadow:0 0 12px rgba(255,77,109,.6)}
  #stBar{background:linear-gradient(90deg,#4df6d2,#7fffe0);box-shadow:0 0 12px rgba(77,246,210,.6)}

  #miniMapWrap{position:absolute;top:18px;right:18px;background:rgba(10,18,26,.85);backdrop-filter:blur(14px);border:1px solid rgba(77,246,210,.3);border-radius:16px;padding:8px;box-shadow:0 8px 32px rgba(0,0,0,.5)}
  #miniMap{display:block;border-radius:10px}
  .map-label{text-align:center;font-size:10px;font-weight:700;letter-spacing:2px;color:#4df6d2;margin-top:6px}

  #killsBox{position:absolute;top:18px;right:260px;background:linear-gradient(135deg,rgba(255,77,109,.2),rgba(180,30,60,.2));backdrop-filter:blur(14px);border:1px solid rgba(255,120,140,.4);border-radius:14px;padding:12px 22px;text-align:center;box-shadow:0 8px 32px rgba(255,77,109,.15)}
  #killsBox .k-label{font-size:10px;letter-spacing:2px;color:#ffb3c1;font-weight:700}
  #killsBox .k-val{font-size:26px;font-weight:800;color:#fff;text-shadow:0 0 14px #ff4d6d}

  #toast{
    position:absolute;bottom:120px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,rgba(20,35,45,.95),rgba(10,20,28,.95));
    backdrop-filter:blur(16px);border:1px solid rgba(77,246,210,.4);
    border-radius:12px;padding:12px 24px;font-size:14px;font-weight:600;
    letter-spacing:.4px;opacity:0;transition:opacity .35s ease;white-space:nowrap;
    box-shadow:0 10px 40px rgba(77,246,210,.2);max-width:90vw;overflow:hidden;text-overflow:ellipsis;
  }

  .crosshair{position:absolute;top:50%;left:50%;width:22px;height:22px;transform:translate(-50%,-50%);pointer-events:none}
  .crosshair::before,.crosshair::after{content:'';position:absolute;background:rgba(77,246,210,.85);box-shadow:0 0 8px #4df6d2}
  .crosshair::before{width:2px;height:100%;left:50%;transform:translateX(-50%)}
  .crosshair::after{height:2px;width:100%;top:50%;transform:translateY(-50%)}
  .crosshair .ch-dot{position:absolute;top:50%;left:50%;width:4px;height:4px;background:#fff;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 6px #4df6d2}

  /* ================= MOBILE ================= */
  #mobileControls{display:none;position:fixed;inset:0;pointer-events:none;z-index:15}
  #joy{position:absolute;left:24px;bottom:24px;width:150px;height:150px;border-radius:50%;
    background:radial-gradient(circle,rgba(77,246,210,.15),rgba(77,246,210,.03));
    border:2px solid rgba(77,246,210,.35);pointer-events:auto;touch-action:none;
    box-shadow:inset 0 0 30px rgba(77,246,210,.15),0 0 30px rgba(0,0,0,.4)}
  #joy::after{content:'';position:absolute;top:50%;left:50%;width:56px;height:56px;border-radius:50%;
    background:radial-gradient(circle,#4df6d2,#2aa892);transform:translate(-50%,-50%);
    box-shadow:0 0 20px rgba(77,246,210,.6);transition:transform .05s}
  .action-btn{position:absolute;pointer-events:auto;border-radius:50%;border:2px solid rgba(255,255,255,.25);
    background:radial-gradient(circle,rgba(255,255,255,.15),rgba(255,255,255,.03));
    backdrop-filter:blur(8px);color:#fff;font-size:12px;font-weight:800;letter-spacing:1px;
    display:flex;align-items:center;justify-content:center;touch-action:none;
    box-shadow:0 6px 24px rgba(0,0,0,.4);text-shadow:0 1px 4px rgba(0,0,0,.6)}
  .action-btn:active{transform:scale(.93);background:radial-gradient(circle,rgba(77,246,210,.35),rgba(77,246,210,.1))}
  #fireBtn{right:32px;bottom:32px;width:88px;height:88px;border-color:rgba(255,77,109,.5);background:radial-gradient(circle,rgba(255,77,109,.25),rgba(255,77,109,.05))}
  #fireBtn:active{background:radial-gradient(circle,rgba(255,77,109,.5),rgba(255,77,109,.15))}
  #jumpBtn{right:36px;bottom:135px;width:66px;height:66px}
  #runBtn{right:130px;bottom:32px;width:66px;height:66px}

  /* ================= SCREENS ================= */
  .screen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:20;
    background:radial-gradient(ellipse at 30% 20%,rgba(20,80,90,.6),transparent 60%),
               radial-gradient(ellipse at 80% 80%,rgba(180,60,80,.35),transparent 55%),
               linear-gradient(135deg,#0a1218,#131f28 60%,#0a1218)}
  .screen::before{content:'';position:absolute;inset:0;background-image:
    linear-gradient(rgba(77,246,210,.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(77,246,210,.04) 1px,transparent 1px);
    background-size:60px 60px;mask-image:radial-gradient(circle,black,transparent 80%);pointer-events:none}

  .panel{position:relative;background:linear-gradient(160deg,rgba(20,32,42,.92),rgba(12,20,28,.95));
    backdrop-filter:blur(24px);border:1px solid rgba(77,246,210,.25);border-radius:26px;
    padding:48px 56px;max-width:560px;width:92vw;text-align:center;
    box-shadow:0 24px 80px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.06)}
  .panel::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:2px;
    background:linear-gradient(90deg,transparent,#4df6d2,transparent);filter:blur(.5px)}

  .title-badge{display:inline-block;font-size:11px;font-weight:800;letter-spacing:4px;color:#4df6d2;
    background:rgba(77,246,210,.1);border:1px solid rgba(77,246,210,.3);padding:6px 16px;border-radius:99px;margin-bottom:18px}
  .game-title{font-size:clamp(38px,7vw,64px);font-weight:900;letter-spacing:-2px;line-height:1;
    background:linear-gradient(135deg,#fff 30%,#4df6d2 70%,#2aa892);
    -webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:14px;
    filter:drop-shadow(0 0 30px rgba(77,246,210,.4))}
  .subtitle{font-size:15px;color:#8fa4b0;line-height:1.6;margin-bottom:32px;font-weight:500}

  .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;
    padding:16px 28px;border:none;border-radius:14px;font-size:16px;font-weight:800;letter-spacing:1px;
    cursor:pointer;transition:all .2s ease;text-transform:uppercase;margin-bottom:12px}
  .btn-primary{background:linear-gradient(135deg,#4df6d2,#2aa892);color:#04181a;
    box-shadow:0 8px 32px rgba(77,246,210,.4)}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(77,246,210,.6)}
  .btn-primary:active{transform:translateY(0) scale(.98)}
  .btn-ghost{background:rgba(255,255,255,.05);color:#cfdde4;border:1px solid rgba(255,255,255,.12)}
  .btn-ghost:hover{background:rgba(255,255,255,.1);border-color:rgba(77,246,210,.4)}

  .feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
  .feature{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 8px}
  .feature .ico{font-size:22px;margin-bottom:6px}
  .feature .name{font-size:10px;font-weight:700;letter-spacing:1px;color:#8fa4b0}

  #endScreen{display:none}
  .end-title{font-size:clamp(32px,6vw,52px);font-weight:900;letter-spacing:-1px;margin-bottom:12px}
  .end-title.win{background:linear-gradient(135deg,#4df6d2,#7fffe0,#2aa892);-webkit-background-clip:text;background-clip:text;color:transparent}
  .end-title.lose{background:linear-gradient(135deg,#ff4d6d,#ff8fa3);-webkit-background-clip:text;background-clip:text;color:transparent}
  .end-stats{font-size:18px;font-weight:700;color:#4df6d2;letter-spacing:2px;margin-bottom:8px}
  .end-text{font-size:14px;color:#8fa4b0;margin-bottom:28px;line-height:1.6}

  @media(max-width:600px){
    .hud-stats{width:160px;top:70px;left:12px}
    #miniMapWrap{top:12px;right:12px;padding:6px}
    #miniMap{width:120px!important;height:120px!important}
    #killsBox{top:70px;right:12px;padding:8px 14px}
    #killsBox .k-val{font-size:18px}
    .panel{padding:32px 24px}
    .feature-grid{gap:8px}
    .hud-top{top:12px;gap:8px}
    .hud-pill{padding:7px 12px;font-size:11px}
  }
</style>
</head>
<body>
<div id="game"></div>

<!-- HUD -->
<div id="hud">
  <div class="hud-top">
    <div class="hud-pill"><span class="dot"></span>ZONA<span id="zoneTime">01:00</span></div>
    <div class="hud-pill">👥 <span id="alive">12</span> TIRIK</div>
  </div>

  <div class="hud-stats">
    <div class="stat-block">
      <div class="stat-row"><span class="label">❤ SOG'LIQ</span><span id="hpText">100 / 100</span></div>
      <div class="bar-track"><div class="bar-fill" id="hpBar" style="width:100%"></div></div>
    </div>
    <div class="stat-block">
      <div class="stat-row"><span class="label">⚡ STAMINA</span><span id="stText">100%</span></div>
      <div class="bar-track"><div class="bar-fill" id="stBar" style="width:100%"></div></div>
    </div>
  </div>

  <div id="killsBox">
    <div class="k-label">KILLS</div>
    <div class="k-val" id="kills">0</div>
  </div>

  <div id="miniMapWrap">
    <canvas id="miniMap" width="180" height="180"></canvas>
    <div class="map-label">TACTICAL MAP</div>
  </div>

  <div class="crosshair"><div class="ch-dot"></div></div>
  <div id="toast"></div>
</div>

<!-- Mobile Controls -->
<div id="mobileControls">
  <div id="joy"></div>
  <div class="action-btn" id="fireBtn">OTISH</div>
  <div class="action-btn" id="jumpBtn">SAKRASH</div>
  <div class="action-btn" id="runBtn">YUGURISH</div>
</div>

<!-- Start Screen -->
<div class="screen" id="startScreen">
  <div class="panel">
    <div class="title-badge">SURVIVAL ARENA · 3D</div>
    <h1 class="game-title">ZONA</h1>
    <p class="subtitle">Torayib borayotgan zonada omon qoling.<br>Raqiblarni yo'q qiling, jihozlarni yig'ing va maydonning yagona qahramoniga aylaning.</p>

    <div class="feature-grid">
      <div class="feature"><div class="ico">🎯</div><div class="name">NISHON</div></div>
      <div class="feature"><div class="ico">💎</div><div class="name">JIHOZ</div></div>
      <div class="feature"><div class="ico">🔥</div><div class="name">ZONA</div></div>
    </div>

    <button class="btn btn-primary" id="startBtn">▶ JANGNI BOSHLASH</button>
    <button class="btn btn-ghost" id="howBtn">BOSHQARUV QO'LLANMASI</button>
  </div>
</div>

<!-- End Screen -->
<div class="screen" id="endScreen">
  <div class="panel">
    <h1 class="end-title" id="endTitle">G'ALABA!</h1>
    <div class="end-stats" id="endStats">0 KILL · 0 JIHOZ</div>
    <p class="end-text" id="endText"></p>
    <button class="btn btn-primary" id="againBtn">🔄 QAYTA O'YNASH</button>
    <button class="btn btn-ghost" id="menuBtn">ASOSIY MENYU</button>
  </div>
</div>

<script type="module">
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const mount = document.getElementById('game');
const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');
const hud = document.getElementById('hud');
const toastEl = document.getElementById('toast');
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
if (isTouch) document.getElementById('mobileControls').style.display = 'block';

let renderer, scene, camera, clock, player, zoneMesh;
let enemies=[], loot=[], keys={}, particles=[];
let running=false, gameOver=false, pointerLocked=false;
let hp=100, stamina=100, kills=0, elapsed=0, zoneRadius=105, zoneStartDelay=35, zoneShrinkTime=130;
let fireCooldown=0, toastTimer=0, lootCount=0, lastHit=0, screenShake=0;
const WORLD=240;
const moveInput={x:0,y:0}, joyState={active:false,id:null,x:0,y:0,originX:0,originY:0};

const mat=(color,roughness=0.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const materials={
 grass:mat('#4c7652'), sand:mat('#b8a36f'), road:mat('#303a40'), concrete:mat('#8b9894'),
 white:mat('#e6dfc8'), blue:mat('#1e6879'), terracotta:mat('#b96f4b'), dark:mat('#172832'),
 roof:mat('#8e5540'), glass:new THREE.MeshStandardMaterial({color:'#5fc9cf',roughness:.25,metalness:.2}),
 player:mat('#25d8b7'), enemy:mat('#bd5a45'), skin:mat('#d7a57c'), loot:mat('#f8d66d',.3,.2)
};

function box(w,h,d,material,x,y,z,parent=scene){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function showToast(msg){toastEl.textContent=msg;toastEl.style.opacity=1;toastTimer=2.2;}
function random(min,max){return min+Math.random()*(max-min);}
function randomPoint(radius=90){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*radius;return new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r);}

/* ============================================================
   REALISTIK ODAM MODELI YARATISH
   ============================================================ */
function createHumanModel(opts){
  const {
    bodyColor='#25d8b7', skinColor='#d7a57c', shirtColor=null,
    pantsColor='#2a3540', isPlayer=false, hasGun=false, markerColor='#ff7a63'
  } = opts;

  const g = new THREE.Group();

  // RANG MATERIALS
  const skinMat = mat(skinColor, .9, 0);
  const shirtMat = mat(shirtColor || bodyColor, .85, 0);
  const pantsMat = mat(pantsColor, .9, 0);
  const shoeMat = mat('#1a1f24', .7, .1);
  const hairMat = mat('#2b1d14', .95, 0);
  const eyeMat = mat('#0a0a0a', .3, 0);

  // ==== OYOQLAR (yelka bo'g'inlari bilan) ====
  // Chap oyoq
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.22, 0.85, 0);
  g.add(leftLegGroup);
  const leftThigh = box(0.32, 0.5, 0.34, pantsMat, 0, -0.25, 0, leftLegGroup);
  const leftKneeGroup = new THREE.Group();
  leftKneeGroup.position.set(0, -0.5, 0);
  leftLegGroup.add(leftKneeGroup);
  const leftShin = box(0.3, 0.48, 0.3, pantsMat, 0, -0.24, 0, leftKneeGroup);
  const leftShoe = box(0.34, 0.16, 0.42, shoeMat, 0, -0.5, 0.06, leftKneeGroup);

  // O'ng oyoq
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.22, 0.85, 0);
  g.add(rightLegGroup);
  const rightThigh = box(0.32, 0.5, 0.34, pantsMat, 0, -0.25, 0, rightLegGroup);
  const rightKneeGroup = new THREE.Group();
  rightKneeGroup.position.set(0, -0.5, 0);
  rightLegGroup.add(rightKneeGroup);
  const rightShin = box(0.3, 0.48, 0.3, pantsMat, 0, -0.24, 0, rightKneeGroup);
  const rightShoe = box(0.34, 0.16, 0.42, shoeMat, 0, -0.5, 0.06, rightKneeGroup);

  // ==== TANA (ko'krak qafasi) ====
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.85, 0);
  g.add(torsoGroup);

  // Pastki tana
  const hips = box(0.62, 0.35, 0.36, pantsMat, 0, 0.05, 0, torsoGroup);
  // Yuqori tana (yelka kengroq)
  const chest = box(0.72, 0.55, 0.38, shirtMat, 0, 0.5, 0, torsoGroup);
  // Yelka burchaklari (yumaloq)
  const shoulderL = box(0.22, 0.2, 0.38, shirtMat, -0.36, 0.7, 0, torsoGroup);
  const shoulderR = box(0.22, 0.2, 0.38, shirtMat, 0.36, 0.7, 0, torsoGroup);
  // Bo'yin
  const neck = box(0.22, 0.12, 0.22, skinMat, 0, 0.82, 0, torsoGroup);

  // ==== QO'LLAR ====
  // Chap qo'l
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.48, 0.72, 0);
  torsoGroup.add(leftArmGroup);
  const leftUpperArm = box(0.22, 0.44, 0.22, shirtMat, 0, -0.22, 0, leftArmGroup);
  const leftElbowGroup = new THREE.Group();
  leftElbowGroup.position.set(0, -0.44, 0);
  leftArmGroup.add(leftElbowGroup);
  const leftForearm = box(0.2, 0.4, 0.2, skinMat, 0, -0.2, 0, leftElbowGroup);
  const leftHand = box(0.2, 0.16, 0.14, skinMat, 0, -0.44, 0, leftElbowGroup);

  // O'ng qo'l
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.48, 0.72, 0);
  torsoGroup.add(rightArmGroup);
  const rightUpperArm = box(0.22, 0.44, 0.22, shirtMat, 0, -0.22, 0, rightArmGroup);
  const rightElbowGroup = new THREE.Group();
  rightElbowGroup.position.set(0, -0.44, 0);
  rightArmGroup.add(rightElbowGroup);
  const rightForearm = box(0.2, 0.4, 0.2, skinMat, 0, -0.2, 0, rightElbowGroup);
  const rightHand = box(0.2, 0.16, 0.14, skinMat, 0, -0.44, 0, rightElbowGroup);

  // ==== BOSH ====
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.02, 0);
  torsoGroup.add(headGroup);

  // Bosh (yumaloq)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), skinMat);
  head.scale.set(1, 1.1, 0.95);
  head.castShadow = true;
  headGroup.add(head);

  // Soch
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 14, 0, Math.PI*2, 0, Math.PI*0.6), hairMat);
  hair.position.y = 0.02;
  hair.scale.set(1, 1, 0.98);
  headGroup.add(hair);

  // Ko'zlar
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeMat);
  eyeL.position.set(-0.09, 0.02, 0.23);
  headGroup.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeMat);
  eyeR.position.set(0.09, 0.02, 0.23);
  headGroup.add(eyeR);

  // Burun
  const nose = box(0.05, 0.06, 0.06, skinMat, 0, -0.02, 0.26, headGroup);

  // ==== QUROL (agar o'yinchi bo'lsa) ====
  let gun = null;
  if (hasGun) {
    gun = new THREE.Group();
    gun.position.set(0.1, -0.5, 0.05);
    rightElbowGroup.add(gun);
    // Qurol tanasi
    const gunBody = box(0.1, 0.12, 0.7, mat('#1a2228', .4, .7), 0, 0, 0.2, gun);
    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8), mat('#2a3238', .3, .8));
    barrel.rotation.x = Math.PI/2;
    barrel.position.set(0, 0.03, 0.55);
    gun.add(barrel);
    // Tutqich
    const grip = box(0.09, 0.16, 0.1, mat('#0e1216', .6, .3), 0, -0.12, 0.05, gun);
    // Magazin
    const mag = box(0.08, 0.18, 0.08, mat('#1a2228', .5, .5), 0, -0.13, 0.22, gun);
  }

  // ==== RAQIB BELGISI (dushman uchun) ====
  let marker = null;
  if (!isPlayer) {
    marker = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), mat(markerColor, .3, .3));
    marker.position.y = 1.55;
    marker.rotation.x = Math.PI;
    g.add(marker);
  }

  return {
    group: g,
    parts: {
      leftLegGroup, leftKneeGroup, rightLegGroup, rightKneeGroup,
      leftArmGroup, leftElbowGroup, rightArmGroup, rightElbowGroup,
      torsoGroup, headGroup, hair, gun, marker
    }
  };
}

/* ============================================================
   INIT
   ============================================================ */
function init(){
  renderer=new THREE.WebGLRenderer({antialias:!isTouch,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=!isTouch;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  mount.appendChild(renderer.domElement);

  scene=new THREE.Scene();
  scene.background=new THREE.Color('#8fc8d0');
  scene.fog=new THREE.FogExp2('#8fc8d0',0.0037);

  camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,500);
  clock=new THREE.Clock();

  const hemi=new THREE.HemisphereLight('#d9f8ff','#46533a',2.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff0ce',3.1);
  sun.position.set(-55,90,45);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-130;sun.shadow.camera.right=130;
  sun.shadow.camera.top=130;sun.shadow.camera.bottom=-130;
  scene.add(sun);

  buildWorld();
  createPlayer();
  createEnemies(11);
  createLoot(28);
  createZone();

  window.addEventListener('resize',resize);
  document.addEventListener('keydown',e=>{
    keys[e.code]=true;
    if(['Space','Tab'].includes(e.code))e.preventDefault();
    if(e.code==='KeyE')pickupLoot();
    if(e.code==='Escape'&&running&&!isTouch)document.exitPointerLock?.();
  });
  document.addEventListener('keyup',e=>keys[e.code]=false);

  renderer.domElement.addEventListener('click',()=>{
    if(running&&!isTouch&&!pointerLocked)renderer.domElement.requestPointerLock?.();
    else if(running)shoot();
  });
  document.addEventListener('pointerlockchange',()=>{
    pointerLocked=document.pointerLockElement===renderer.domElement;
  });
  document.addEventListener('mousemove',e=>{
    if(running&&pointerLocked){
      player.yaw-=e.movementX*.0024;
      player.pitch=THREE.MathUtils.clamp(player.pitch-e.movementY*.0018,-.45,.5);
    }
  });

  setupTouch();
  animate();
}

/* ============================================================
   WORLD BUILDING
   ============================================================ */
function buildWorld(){
  const
