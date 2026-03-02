// ============================================================
//  STAR BREAKER — Star Wars Themed Block Breaker (Three.js)
// ============================================================
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.min.js';

// ─── 定数 ───────────────────────────────────────
const FIELD_W  = 30;           // フィールド幅（-15〜15）
const FIELD_D  = 34;           // フィールド奥行
const PADDLE_W = 6;
const PADDLE_H = 0.35;
const BALL_R   = 0.45;
const BALL_SPEED_INIT = 0.26;
const BALL_SPEED_MAX  = 0.45;
const BLOCK_ROWS = 5;
const BLOCK_COLS = 8;
const BLOCK_W   = 3.2;
const BLOCK_H   = 1.2;
const BLOCK_D   = 1.0;
const BLOCK_GAP = 0.3;
const WALL_L = -FIELD_W / 2;
const WALL_R =  FIELD_W / 2;
const WALL_TOP   = -FIELD_D / 2 + 2;
const PADDLE_Z   =  FIELD_D / 2 - 5;
const DEAD_Z     =  FIELD_D / 2 + 2;
const MAX_LIVES  = 3;

// ─── カラーパレット ──────────────────────────────
const C = {
  yellow:    0xFFE81F,
  blue:      0x4FC3F7,
  blueDark:  0x0A2540,
  red:       0xFF3333,
  green:     0x66FF66,
  white:     0xFFFFFF,
  imperial:  0x556677,
  panelDark: 0x1a2a3a,
};

// ─── ゲーム状態 ──────────────────────────────────
let started   = false;
let paused    = false;
let gameOver  = false;
let gameClear = false;
let score     = 0;
let combo     = 0;
let lives     = MAX_LIVES;

// ─── Three.js 変数 ───────────────────────────────
let renderer, scene, camera, clock;
let paddle, ball, ballGlow;
let ballVel    = new THREE.Vector3();
let blocks     = [];
let particles  = [];
let trailParts = [];
let starField;

// ─── DOM ─────────────────────────────────────────
const container  = document.getElementById('game-container');
const overlay    = document.getElementById('start-overlay');
const startBtn   = document.getElementById('start-btn');
const hud        = document.getElementById('hud');
const hudScore   = document.getElementById('hud-score');
const hudCombo   = document.getElementById('hud-combo');
const comboCount = document.getElementById('combo-count');
const msgBox     = document.getElementById('game-message');
const msgTitle   = document.getElementById('msg-title');
const msgSub     = document.getElementById('msg-sub');
const msgBtn     = document.getElementById('msg-btn');

// ================================================================
//  スタート画面
// ================================================================
startBtn.addEventListener('click', () => {
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
    if (!started) {
      initGame();
      started = true;
    } else {
      resetGame();
    }
    hud.classList.add('visible');
  }, 800);
});

msgBtn.addEventListener('click', () => {
  hideMessage();
  resetGame();
});

// ================================================================
//  初期化
// ================================================================
function initGame() {
  clock = new THREE.Clock();

  // ─ レンダラー ─
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const cvs = renderer.domElement;
  cvs.style.position = 'absolute';
  cvs.style.inset = '0';
  cvs.style.width = '100%';
  cvs.style.height = '100%';
  cvs.style.zIndex = '2';
  container.appendChild(cvs);

  // ─ シーン ─
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000011, 0.008);

  // ─ カメラ ─
  camera = new THREE.PerspectiveCamera(
    60, container.clientWidth / container.clientHeight, 0.1, 500
  );
  camera.position.set(0, 14, 28);
  camera.lookAt(0, 0, 0);

  // ─ ライト ─
  scene.add(new THREE.AmbientLight(0x223344, 0.6));
  const dir = new THREE.DirectionalLight(0xaaccff, 0.8);
  dir.position.set(5, 20, 15);
  scene.add(dir);

  // 淡いブルーのポイントライト
  const pl1 = new THREE.PointLight(C.blue, 0.6, 60);
  pl1.position.set(0, 8, 0);
  scene.add(pl1);

  // ─ 宇宙背景 ─
  createStarField();
  createNebula();

  // ─ フィールド ─
  createField();

  // ─ パドル ─
  createPaddle();

  // ─ ボール ─
  createBall();

  // ─ ブロック ─
  createBlocks();

  // ─ 操作 ─
  setupControls();

  // ─ リサイズ ─
  window.addEventListener('resize', onResize);
  onResize();

  // ─ ボール初期速度 ─
  launchBall();

  // ─ ループ開始 ─
  animate();
}

// ================================================================
//  宇宙背景
// ================================================================
function createStarField() {
  const count = 600;
  const geo = new THREE.BufferGeometry();
  const pos  = new Float32Array(count * 3);
  const cols = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 200;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 200 - 40;
    const brightness = 0.5 + Math.random() * 0.5;
    const blueShift  = Math.random() * 0.3;
    cols[i * 3]     = brightness;
    cols[i * 3 + 1] = brightness;
    cols[i * 3 + 2] = brightness + blueShift;
    sizes[i] = 0.3 + Math.random() * 0.7;
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(cols, 3));
  geo.setAttribute('size',     new THREE.Float32BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
  });
  starField = new THREE.Points(geo, mat);
  scene.add(starField);
}

function createNebula() {
  // 薄い青紫のフォグ的な大きな半透明球
  const geo = new THREE.SphereGeometry(80, 32, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0a1530,
    transparent: true,
    opacity: 0.35,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const nebula = new THREE.Mesh(geo, mat);
  scene.add(nebula);
}

// ================================================================
//  フィールド（プレイエリア）
// ================================================================
function createField() {
  // 床面
  const floorGeo = new THREE.PlaneGeometry(FIELD_W, FIELD_D);
  const floorMat = new THREE.MeshPhysicalMaterial({
    color: 0x060e18,
    metalness: 0.8,
    roughness: 0.15,
    clearcoat: 0.5,
    emissive: 0x0a1a2f,
    emissiveIntensity: 0.15,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);

  // グリッドライン（ホログラム風）
  const grid = new THREE.GridHelper(FIELD_W, 20, 0x112233, 0x0a1520);
  grid.position.y = -1.95;
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  // 境界線（青く光るライン）
  const borderMat = new THREE.LineBasicMaterial({
    color: C.blue,
    transparent: true,
    opacity: 0.35,
  });
  // 左壁
  addBorderLine(
    [WALL_L, -1.9, WALL_TOP], [WALL_L, -1.9, DEAD_Z], borderMat
  );
  // 右壁
  addBorderLine(
    [WALL_R, -1.9, WALL_TOP], [WALL_R, -1.9, DEAD_Z], borderMat
  );
  // 奥壁
  addBorderLine(
    [WALL_L, -1.9, WALL_TOP], [WALL_R, -1.9, WALL_TOP], borderMat
  );
}

function addBorderLine(a, b, mat) {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...a), new THREE.Vector3(...b),
  ]);
  scene.add(new THREE.Line(geo, mat));
}

// ================================================================
//  パドル（ライトセーバー風）
// ================================================================
function createPaddle() {
  const group = new THREE.Group();

  // 本体 — 横長のバー
  const geo = new THREE.BoxGeometry(PADDLE_W, PADDLE_H, 0.4);
  const mat = new THREE.MeshPhysicalMaterial({
    color: C.blue,
    metalness: 0.6,
    roughness: 0.2,
    emissive: C.blue,
    emissiveIntensity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.92,
  });
  const bar = new THREE.Mesh(geo, mat);
  group.add(bar);

  // グロー（横長のスプライト的な板）
  const glowGeo = new THREE.PlaneGeometry(PADDLE_W + 1.5, 1.8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: C.blue,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.1;
  group.add(glow);

  // 端に光る丸
  [-PADDLE_W / 2, PADDLE_W / 2].forEach(x => {
    const capGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const capMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(x, 0, 0);
    group.add(cap);
  });

  // ポイントライト
  const light = new THREE.PointLight(C.blue, 1.2, 12);
  light.position.y = 1;
  group.add(light);

  group.position.set(0, -1.2, PADDLE_Z);
  scene.add(group);
  paddle = group;
}

// ================================================================
//  ボール
// ================================================================
function createBall() {
  const group = new THREE.Group();

  const geo = new THREE.SphereGeometry(BALL_R, 24, 24);
  const mat = new THREE.MeshPhysicalMaterial({
    color: C.yellow,
    metalness: 0.4,
    roughness: 0.2,
    emissive: C.yellow,
    emissiveIntensity: 0.6,
    clearcoat: 1.0,
  });
  const sphere = new THREE.Mesh(geo, mat);
  group.add(sphere);

  // 発光
  const glowGeo = new THREE.SphereGeometry(BALL_R * 1.8, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: C.yellow,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });
  ballGlow = new THREE.Mesh(glowGeo, glowMat);
  group.add(ballGlow);

  // ポイントライト
  const light = new THREE.PointLight(C.yellow, 0.8, 10);
  group.add(light);

  group.position.set(0, -0.8, PADDLE_Z - 2);
  scene.add(group);
  ball = group;
}

// ================================================================
//  ブロック
// ================================================================
function createBlocks() {
  blocks = [];
  const totalW = BLOCK_COLS * (BLOCK_W + BLOCK_GAP) - BLOCK_GAP;
  const startX = -totalW / 2 + BLOCK_W / 2;
  const startZ = WALL_TOP + 3;

  // 色パターン — 帝国カラー（行ごとに変化）
  const rowColors = [
    { color: 0xff3333, emissive: 0xcc0000, name: 'red'  },    // 赤
    { color: 0xaabbcc, emissive: 0x556688, name: 'grey' },    // 帝国グレー
    { color: 0xff4444, emissive: 0xbb0000, name: 'red'  },    // 赤
    { color: 0x7799bb, emissive: 0x445566, name: 'steel' },   // スチール
    { color: 0x556677, emissive: 0x334455, name: 'dark' },    // ダーク
  ];

  for (let r = 0; r < BLOCK_ROWS; r++) {
    const rc = rowColors[r % rowColors.length];
    for (let c = 0; c < BLOCK_COLS; c++) {
      const geo = new THREE.BoxGeometry(BLOCK_W, BLOCK_H, BLOCK_D);
      const mat = new THREE.MeshPhysicalMaterial({
        color: rc.color,
        metalness: 0.85,
        roughness: 0.15,
        emissive: rc.emissive,
        emissiveIntensity: 0.45,
        clearcoat: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        startX + c * (BLOCK_W + BLOCK_GAP),
        -0.3,
        startZ + r * (BLOCK_D + BLOCK_GAP + 0.2),
      );
      mesh.userData = { row: r, col: c, points: (BLOCK_ROWS - r) * 10 };
      scene.add(mesh);
      blocks.push(mesh);

      // 上面にうっすら光るエッジ
      const edgeGeo = new THREE.BoxGeometry(BLOCK_W + 0.05, 0.02, BLOCK_D + 0.05);
      const edgeMat = new THREE.MeshBasicMaterial({
        color: C.blue,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.y = BLOCK_H / 2;
      mesh.add(edge);
    }
  }
}

// ================================================================
//  操作
// ================================================================
function setupControls() {
  // マウス
  window.addEventListener('mousemove', e => {
    if (gameOver || gameClear || !renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const target = nx * (FIELD_W / 2 - PADDLE_W / 2 + 0.5);
    paddle.position.x = clamp(target, WALL_L + PADDLE_W / 2, WALL_R - PADDLE_W / 2);
  });

  // タッチ
  window.addEventListener('touchmove', e => {
    if (gameOver || gameClear || !renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const nx = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
    const target = nx * (FIELD_W / 2 - PADDLE_W / 2 + 0.5);
    paddle.position.x = clamp(target, WALL_L + PADDLE_W / 2, WALL_R - PADDLE_W / 2);
  }, { passive: true });

  // キーボード
  const keys = {};
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      e.preventDefault();
      keys[e.code] = true;
    }
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  (function keyLoop() {
    if (paddle && !gameOver && !gameClear) {
      const speed = 0.55;
      if (keys['ArrowLeft'])
        paddle.position.x = Math.max(WALL_L + PADDLE_W / 2, paddle.position.x - speed);
      if (keys['ArrowRight'])
        paddle.position.x = Math.min(WALL_R - PADDLE_W / 2, paddle.position.x + speed);
    }
    requestAnimationFrame(keyLoop);
  })();
}

// ================================================================
//  ボール発射 & リセット
// ================================================================
function launchBall() {
  ball.position.set(paddle.position.x, -0.8, PADDLE_Z - 2);
  const angle = (Math.random() - 0.5) * 0.8 - Math.PI / 2; // ほぼ上向き
  ballVel.set(
    Math.cos(angle) * BALL_SPEED_INIT,
    0,
    Math.sin(angle) * BALL_SPEED_INIT,
  );
  // Z方向は必ず奥へ
  if (ballVel.z > 0) ballVel.z *= -1;
}

function resetGame() {
  // ブロック復活
  blocks.forEach(b => { b.visible = true; });
  // ステート
  score     = 0;
  combo     = 0;
  lives     = MAX_LIVES;
  gameOver  = false;
  gameClear = false;
  updateHUD();
  hideMessage();
  launchBall();
  hud.classList.add('visible');
}

// ================================================================
//  HUD 更新
// ================================================================
function updateHUD() {
  hudScore.textContent = score;
  // ライフ表示
  const lifeDots = document.querySelectorAll('.life');
  lifeDots.forEach((dot, i) => {
    dot.classList.toggle('active', i < lives);
    if (i >= lives) dot.classList.remove('lost');
  });
  // コンボ
  if (combo >= 2) {
    hudCombo.classList.remove('hidden');
    comboCount.textContent = combo;
    hudCombo.classList.add('pop');
    setTimeout(() => hudCombo.classList.remove('pop'), 150);
  } else {
    hudCombo.classList.add('hidden');
  }
}

// ================================================================
//  メッセージ
// ================================================================
function showMessage(title, sub, showBtn = false) {
  msgTitle.textContent = title;
  msgSub.textContent   = sub;
  msgBtn.classList.toggle('hidden', !showBtn);
  msgBox.classList.remove('hidden');
}

function hideMessage() {
  msgBox.classList.add('hidden');
}

// ================================================================
//  パーティクル（ブロック破壊エフェクト）
// ================================================================
function spawnParticles(pos, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.userData.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.4,
      Math.random() * 0.3 + 0.1,
      (Math.random() - 0.5) * 0.4,
    );
    mesh.userData.life = 1.0;
    mesh.userData.decay = 0.01 + Math.random() * 0.02;
    scene.add(mesh);
    particles.push(mesh);
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.position.add(p.userData.vel);
    p.userData.vel.y -= 0.005; // 重力
    p.userData.life -= p.userData.decay;
    p.material.opacity = Math.max(0, p.userData.life);
    p.rotation.x += 0.1;
    p.rotation.z += 0.08;
    if (p.userData.life <= 0) {
      scene.remove(p);
      p.geometry.dispose();
      p.material.dispose();
      particles.splice(i, 1);
    }
  }
}

// ================================================================
//  ボールトレイル
// ================================================================
function spawnTrail() {
  const geo = new THREE.SphereGeometry(BALL_R * 0.5, 8, 8);
  const mat = new THREE.MeshBasicMaterial({
    color: C.yellow,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const t = new THREE.Mesh(geo, mat);
  t.position.copy(ball.position);
  t.userData.life = 1.0;
  scene.add(t);
  trailParts.push(t);
}

function updateTrail() {
  for (let i = trailParts.length - 1; i >= 0; i--) {
    const t = trailParts[i];
    t.userData.life -= 0.06;
    t.material.opacity = t.userData.life * 0.25;
    t.scale.setScalar(t.userData.life);
    if (t.userData.life <= 0) {
      scene.remove(t);
      t.geometry.dispose();
      t.material.dispose();
      trailParts.splice(i, 1);
    }
  }
}

// ================================================================
//  メインロジック — ボール更新
// ================================================================
function updateBall() {
  if (gameOver || gameClear || paused) return;

  ball.position.x += ballVel.x;
  ball.position.z += ballVel.z;

  // 壁反射（左右）
  if (ball.position.x < WALL_L + BALL_R) {
    ballVel.x = Math.abs(ballVel.x);
    ball.position.x = WALL_L + BALL_R;
    spawnWallSpark(ball.position, 'left');
  }
  if (ball.position.x > WALL_R - BALL_R) {
    ballVel.x = -Math.abs(ballVel.x);
    ball.position.x = WALL_R - BALL_R;
    spawnWallSpark(ball.position, 'right');
  }

  // 壁反射（奥）
  if (ball.position.z < WALL_TOP + BALL_R) {
    ballVel.z = Math.abs(ballVel.z);
    ball.position.z = WALL_TOP + BALL_R;
    spawnWallSpark(ball.position, 'top');
  }

  // パドル反射
  const paddleHalfW = PADDLE_W / 2 + 0.3;
  if (
    ballVel.z > 0 &&
    ball.position.z > paddle.position.z - 0.8 &&
    ball.position.z < paddle.position.z + 0.8 &&
    ball.position.x > paddle.position.x - paddleHalfW &&
    ball.position.x < paddle.position.x + paddleHalfW
  ) {
    ballVel.z = -Math.abs(ballVel.z);
    // パドル上のヒット位置で角度変化
    const offset = (ball.position.x - paddle.position.x) / paddleHalfW;
    ballVel.x += offset * 0.08;
    // 速度上限
    const spd = Math.sqrt(ballVel.x ** 2 + ballVel.z ** 2);
    if (spd > BALL_SPEED_MAX) {
      ballVel.x *= BALL_SPEED_MAX / spd;
      ballVel.z *= BALL_SPEED_MAX / spd;
    }
    combo = 0; // パドルに戻るとコンボリセット
    updateHUD();
    // パドルヒットの光フラッシュ
    flashPaddle();
  }

  // ブロック当たり判定
  for (let i = blocks.length - 1; i >= 0; i--) {
    const blk = blocks[i];
    if (!blk.visible) continue;
    const dx = Math.abs(ball.position.x - blk.position.x);
    const dz = Math.abs(ball.position.z - blk.position.z);
    if (dx < BLOCK_W / 2 + BALL_R * 0.7 && dz < BLOCK_D / 2 + BALL_R * 0.7) {
      // 破壊
      blk.visible = false;
      // 反射方向決定
      if (dx / (BLOCK_W / 2) > dz / (BLOCK_D / 2)) {
        ballVel.x *= -1;
      } else {
        ballVel.z *= -1;
      }
      // スコア & コンボ
      combo++;
      const pts = blk.userData.points * (combo >= 2 ? combo : 1);
      score += pts;
      updateHUD();
      // パーティクル
      spawnParticles(blk.position.clone(), blk.material.color.getHex(), 14);
      // 少し加速
      const spd = Math.sqrt(ballVel.x ** 2 + ballVel.z ** 2);
      const newSpd = Math.min(spd * 1.01, BALL_SPEED_MAX);
      ballVel.multiplyScalar(newSpd / spd);
      break; // 1フレーム1ブロック
    }
  }

  // クリア判定
  if (blocks.every(b => !b.visible)) {
    gameClear = true;
    showMessage('VICTORY', `THE FORCE IS WITH YOU — SCORE: ${score}`, true);
  }

  // 落下 → ライフ減少
  if (ball.position.z > DEAD_Z) {
    lives--;
    updateHUD();
    // ライフロストアニメ
    const lifeDots = document.querySelectorAll('.life');
    if (lifeDots[lives]) {
      lifeDots[lives].classList.add('lost');
    }
    if (lives <= 0) {
      gameOver = true;
      showMessage('GAME OVER', `SCORE: ${score}`, true);
    } else {
      combo = 0;
      updateHUD();
      launchBall();
    }
  }
}

// ================================================================
//  小エフェクト
// ================================================================
function spawnWallSpark(pos, _side) {
  spawnParticles(pos.clone(), C.blue, 5);
}

function flashPaddle() {
  if (!paddle) return;
  const bar = paddle.children[0];
  if (!bar || !bar.material) return;
  const orig = bar.material.emissiveIntensity;
  bar.material.emissiveIntensity = 1.5;
  setTimeout(() => { bar.material.emissiveIntensity = orig; }, 100);
}

// ================================================================
//  アニメーションループ
// ================================================================
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  updateBall();
  updateParticles();

  // トレイル
  if (!gameOver && !gameClear) spawnTrail();
  updateTrail();

  // 星のゆっくり回転
  if (starField) starField.rotation.y += 0.00008;

  // ボールグロー脈動
  if (ballGlow) {
    const t = clock.getElapsedTime();
    ballGlow.material.opacity = 0.1 + Math.sin(t * 4) * 0.05;
  }

  renderer.render(scene, camera);
}

// ================================================================
//  リサイズ
// ================================================================
function onResize() {
  if (!renderer || !camera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;

  if (w / h < 0.8) {
    camera.fov = 72;
    camera.position.set(0, 18, 38);
  } else if (w / h < 1.2) {
    camera.fov = 60;
    camera.position.set(0, 14, 30);
  } else {
    camera.fov = 55;
    camera.position.set(0, 12, 26);
  }
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

// ================================================================
//  ユーティリティ
// ================================================================
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
