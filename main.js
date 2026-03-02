// ============================================================
//  STAR BREAKER — Star Wars Themed Block Breaker (Three.js)
// ============================================================
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.min.js';

// ─── 定数 ───────────────────────────────────────
const FIELD_W  = 24;           // フィールド幅（-12〜12）
const FIELD_D  = 34;           // フィールド奥行
const PADDLE_W = 6;
const PADDLE_H = 0.35;
const BALL_R   = 0.45;
const BALL_SPEED_INIT = 0.26;
const BALL_SPEED_MAX  = 0.45;
const BLOCK_W   = 3.0;
const BLOCK_H   = 1.2;
const BLOCK_D   = 1.0;
const BLOCK_GAP = 0.4;
const WALL_L = -FIELD_W / 2;
const WALL_R =  FIELD_W / 2;
const WALL_TOP   = -FIELD_D / 2 + 2;
const PADDLE_Z   =  FIELD_D / 2 - 5;
const DEAD_Z     =  FIELD_D / 2 + 2;
const MAX_LIVES  = 3;

// ─── ステージ定義 ────────────────────────────────
const STAGES = [
  {
    name: 'TATOOINE', desc: '砂漠の惑星', cols: 7, rows: 4,
    speed: 0.26, maxSpeed: 0.40,
    colors: [
      { color: 0xddb866, emissive: 0x886633 },
      { color: 0xccaa55, emissive: 0x775522 },
      { color: 0xeebb55, emissive: 0x997733 },
      { color: 0xbb9944, emissive: 0x664411 },
    ],
    layout: 'grid',
    durableRate: 0,
  },
  {
    name: 'HOTH', desc: '氷の惑星', cols: 7, rows: 5,
    speed: 0.27, maxSpeed: 0.42,
    colors: [
      { color: 0x88ccff, emissive: 0x3366aa },
      { color: 0xaaddff, emissive: 0x4477bb },
      { color: 0x77bbee, emissive: 0x225599 },
      { color: 0x99ccee, emissive: 0x3366aa },
      { color: 0x66aadd, emissive: 0x114488 },
    ],
    layout: 'grid',
    durableRate: 0.1,
  },
  {
    name: 'DAGOBAH', desc: '沼地の惑星', cols: 7, rows: 5,
    speed: 0.28, maxSpeed: 0.43,
    colors: [
      { color: 0x44aa44, emissive: 0x226622 },
      { color: 0x55bb55, emissive: 0x337733 },
      { color: 0x338833, emissive: 0x115511 },
      { color: 0x66cc66, emissive: 0x448844 },
      { color: 0x2a7a2a, emissive: 0x104410 },
    ],
    layout: 'checker',
    durableRate: 0.15,
  },
  {
    name: 'CLOUD CITY', desc: '雲の都市', cols: 7, rows: 5,
    speed: 0.29, maxSpeed: 0.44,
    colors: [
      { color: 0xcc88ff, emissive: 0x6633aa },
      { color: 0xffcc44, emissive: 0xaa8811 },
      { color: 0xbb77ee, emissive: 0x5522aa },
      { color: 0xeebb33, emissive: 0x997711 },
      { color: 0xaa66dd, emissive: 0x441199 },
    ],
    layout: 'diamond',
    durableRate: 0.2,
  },
  {
    name: 'ENDOR', desc: '森林の衛星', cols: 7, rows: 5,
    speed: 0.30, maxSpeed: 0.45,
    colors: [
      { color: 0x558833, emissive: 0x334411 },
      { color: 0x886644, emissive: 0x553311 },
      { color: 0x66aa44, emissive: 0x447722 },
      { color: 0x775533, emissive: 0x442200 },
      { color: 0x44882a, emissive: 0x225511 },
    ],
    layout: 'pyramid',
    durableRate: 0.25,
  },
  {
    name: 'MUSTAFAR', desc: '炎の惑星', cols: 7, rows: 6,
    speed: 0.31, maxSpeed: 0.46,
    colors: [
      { color: 0xff4422, emissive: 0xcc1100 },
      { color: 0xff6600, emissive: 0xcc3300 },
      { color: 0xff3311, emissive: 0xbb0000 },
      { color: 0xee5500, emissive: 0xbb2200 },
      { color: 0xff2200, emissive: 0xaa0000 },
      { color: 0xdd4400, emissive: 0x991100 },
    ],
    layout: 'cross',
    durableRate: 0.3,
  },
  {
    name: 'SCARIF', desc: '熱帯の惑星', cols: 7, rows: 6,
    speed: 0.32, maxSpeed: 0.47,
    colors: [
      { color: 0x33bbdd, emissive: 0x117799 },
      { color: 0xeedd66, emissive: 0xaa9933 },
      { color: 0x22aacc, emissive: 0x006688 },
      { color: 0xddcc55, emissive: 0x998822 },
      { color: 0x44ccee, emissive: 0x228899 },
      { color: 0xccbb44, emissive: 0x887711 },
    ],
    layout: 'inverted',
    durableRate: 0.35,
  },
  {
    name: 'DEATH STAR', desc: '最終決戦', cols: 7, rows: 6,
    speed: 0.33, maxSpeed: 0.48,
    colors: [
      { color: 0xff3333, emissive: 0xcc0000 },
      { color: 0xaabbcc, emissive: 0x556688 },
      { color: 0xff4444, emissive: 0xbb0000 },
      { color: 0x7799bb, emissive: 0x445566 },
      { color: 0xff3333, emissive: 0xcc0000 },
      { color: 0x556677, emissive: 0x334455 },
    ],
    layout: 'fortress',
    durableRate: 0.45,
  },
];

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
let currentStage = 0;
let stageSpeed   = BALL_SPEED_INIT;
let stageMaxSpeed = BALL_SPEED_MAX;

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
const hudStage   = document.getElementById('hud-stage');
const hudStageName = document.getElementById('hud-stage-name');
const hudCombo   = document.getElementById('hud-combo');
const comboCount = document.getElementById('combo-count');
const msgBox     = document.getElementById('game-message');
const msgTitle   = document.getElementById('msg-title');
const msgSub     = document.getElementById('msg-sub');
const msgBtn     = document.getElementById('msg-btn');
const stageTransition = document.getElementById('stage-transition');

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
  camera.lookAt(0, 0, 4);

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
  currentStage = 0;
  createBlocks();

  // ─ 操作 ─
  setupControls();

  // ─ リサイズ & 画面回転対応 ─
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(onResize, 150);  // 回転アニメ完了後に再計算
  });
  onResize();

  // ─ HUD初期化 ─
  updateHUD();

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
  // 既存ブロックをシーンから除去
  blocks.forEach(b => {
    scene.remove(b);
    b.geometry.dispose();
    b.material.dispose();
  });
  blocks = [];

  const stage = STAGES[currentStage];
  const cols = stage.cols;
  const rows = stage.rows;
  const totalW = cols * (BLOCK_W + BLOCK_GAP) - BLOCK_GAP;
  const startX = -totalW / 2 + BLOCK_W / 2;
  const startZ = WALL_TOP + 5;

  // レイアウトマップ生成（1=通常, 2=耐久, 0=空）
  const map = generateLayout(stage.layout, rows, cols, stage.durableRate);

  for (let r = 0; r < rows; r++) {
    const rc = stage.colors[r % stage.colors.length];
    for (let c = 0; c < cols; c++) {
      const cell = map[r][c];
      if (cell === 0) continue;

      const isDurable = cell >= 2;
      const hp = isDurable ? cell : 1;
      const geo = new THREE.BoxGeometry(BLOCK_W, BLOCK_H, BLOCK_D);
      const mat = new THREE.MeshPhysicalMaterial({
        color: isDurable ? 0x888899 : rc.color,
        metalness: isDurable ? 0.95 : 0.85,
        roughness: isDurable ? 0.1 : 0.15,
        emissive: isDurable ? 0x334455 : rc.emissive,
        emissiveIntensity: isDurable ? 0.6 : 0.45,
        clearcoat: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        startX + c * (BLOCK_W + BLOCK_GAP),
        -0.3,
        startZ + r * (BLOCK_D + BLOCK_GAP + 0.2),
      );
      mesh.userData = {
        row: r, col: c,
        points: (rows - r) * 10 * (isDurable ? 3 : 1),
        hp: hp,
        maxHp: hp,
        originalColor: isDurable ? 0x888899 : rc.color,
        originalEmissive: isDurable ? 0x334455 : rc.emissive,
      };
      scene.add(mesh);
      blocks.push(mesh);

      // 上面にうっすら光るエッジ
      const edgeColor = isDurable ? 0xff6644 : C.blue;
      const edgeGeo = new THREE.BoxGeometry(BLOCK_W + 0.05, 0.02, BLOCK_D + 0.05);
      const edgeMat = new THREE.MeshBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: isDurable ? 0.35 : 0.18,
        depthWrite: false,
      });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.y = BLOCK_H / 2;
      mesh.add(edge);

      // 耐久ブロックにマーク表示
      if (isDurable) {
        const markGeo = new THREE.BoxGeometry(BLOCK_W * 0.3, 0.03, BLOCK_D * 0.3);
        const markMat = new THREE.MeshBasicMaterial({
          color: 0xff4422,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        });
        const mark = new THREE.Mesh(markGeo, markMat);
        mark.position.y = BLOCK_H / 2 + 0.02;
        mesh.add(mark);
      }
    }
  }

  // ステージ速度設定
  stageSpeed = stage.speed;
  stageMaxSpeed = stage.maxSpeed;
}

// レイアウト生成
function generateLayout(type, rows, cols, durableRate) {
  const map = [];
  for (let r = 0; r < rows; r++) {
    map[r] = [];
    for (let c = 0; c < cols; c++) {
      map[r][c] = 1;
    }
  }

  switch (type) {
    case 'grid':
      // そのまま全ブロック
      break;

    case 'checker':
      // チェッカーパターン（互い違い）
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if ((r + c) % 2 === 1) map[r][c] = 0;
      break;

    case 'diamond':
      // ひし形
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const cr = Math.floor(rows / 2), cc = Math.floor(cols / 2);
          if (Math.abs(r - cr) + Math.abs(c - cc) > Math.max(cr, cc))
            map[r][c] = 0;
        }
      break;

    case 'pyramid':
      // ピラミッド（上から狭くなる）
      for (let r = 0; r < rows; r++) {
        const width = cols - r * 1;
        const start = Math.floor((cols - width) / 2);
        for (let c = 0; c < cols; c++)
          if (c < start || c >= start + width) map[r][c] = 0;
      }
      break;

    case 'cross':
      // 十字型
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const cc = Math.floor(cols / 2);
          const cr = Math.floor(rows / 2);
          if (Math.abs(c - cc) > 1 && Math.abs(r - cr) > 1)
            map[r][c] = 0;
        }
      break;

    case 'inverted':
      // 逆ピラミッド
      for (let r = 0; r < rows; r++) {
        const width = r + 3;
        const capped = Math.min(width, cols);
        const start = Math.floor((cols - capped) / 2);
        for (let c = 0; c < cols; c++)
          if (c < start || c >= start + capped) map[r][c] = 0;
      }
      break;

    case 'fortress':
      // 要塞型（外周＋中央）
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
          const isCenter = Math.abs(c - Math.floor(cols / 2)) <= 1 &&
                           Math.abs(r - Math.floor(rows / 2)) <= 1;
          if (!isEdge && !isCenter) map[r][c] = 0;
        }
      break;
  }

  // 耐久ブロック配置
  if (durableRate > 0) {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (map[r][c] === 1 && Math.random() < durableRate)
          map[r][c] = 2; // HP2
  }

  return map;
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
    Math.cos(angle) * stageSpeed,
    0,
    Math.sin(angle) * stageSpeed,
  );
  // Z方向は必ず奥へ
  if (ballVel.z > 0) ballVel.z *= -1;
}

function resetGame() {
  // ステージリセット
  currentStage = 0;
  createBlocks();
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

// ステージクリア → 次ステージへ
function advanceStage() {
  currentStage++;
  if (currentStage >= STAGES.length) {
    // 全ステージクリア！
    gameClear = true;
    showMessage('ALL CLEAR!', `THE FORCE IS STRONG WITH YOU — SCORE: ${score}`, true);
    return;
  }
  // ステージ遷移演出
  showStageTransition(() => {
    createBlocks();
    combo = 0;
    updateHUD();
    launchBall();
  });
}

// ステージ遷移演出
function showStageTransition(callback) {
  const stage = STAGES[currentStage];
  stageTransition.querySelector('.stage-num').textContent = `STAGE ${currentStage + 1}`;
  stageTransition.querySelector('.stage-planet').textContent = stage.name;
  stageTransition.querySelector('.stage-desc').textContent = stage.desc;
  stageTransition.classList.add('active');

  setTimeout(() => {
    stageTransition.classList.remove('active');
    callback();
  }, 2200);
}

// ================================================================
//  HUD 更新
// ================================================================
function updateHUD() {
  hudScore.textContent = score;
  // ステージ表示
  hudStage.textContent = `STAGE ${currentStage + 1}`;
  hudStageName.textContent = STAGES[currentStage].name;
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
    if (spd > stageMaxSpeed) {
      ballVel.x *= stageMaxSpeed / spd;
      ballVel.z *= stageMaxSpeed / spd;
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
      // 反射方向決定
      if (dx / (BLOCK_W / 2) > dz / (BLOCK_D / 2)) {
        ballVel.x *= -1;
      } else {
        ballVel.z *= -1;
      }

      // HP減少
      blk.userData.hp--;
      if (blk.userData.hp <= 0) {
        // 破壊
        blk.visible = false;
        // スコア & コンボ
        combo++;
        const pts = blk.userData.points * (combo >= 2 ? combo : 1);
        score += pts;
        // パーティクル
        spawnParticles(blk.position.clone(), blk.material.color.getHex(), 14);
      } else {
        // 耐久ブロック：ダメージ表現（色を変えてフラッシュ）
        blk.material.color.setHex(0xff6644);
        blk.material.emissive.setHex(0xff2200);
        setTimeout(() => {
          if (blk.userData.hp > 0) {
            // 少しダメージを受けた色に変化
            blk.material.color.setHex(
              lerpColor(blk.userData.originalColor, 0xff4422, 1 - blk.userData.hp / blk.userData.maxHp)
            );
            blk.material.emissive.setHex(blk.userData.originalEmissive);
          }
        }, 100);
        // ヒットエフェクト
        spawnParticles(blk.position.clone(), 0xff6644, 6);
        combo++;
        score += 5 * (combo >= 2 ? combo : 1);
      }

      updateHUD();
      // 少し加速
      const spd = Math.sqrt(ballVel.x ** 2 + ballVel.z ** 2);
      const newSpd = Math.min(spd * 1.01, stageMaxSpeed);
      ballVel.multiplyScalar(newSpd / spd);
      break; // 1フレーム1ブロック
    }
  }

  // クリア判定
  if (blocks.every(b => !b.visible)) {
    advanceStage();
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
  const w = container.clientWidth;
  const h = container.clientHeight;
  const aspect = w / h;
  if (!renderer || !camera) return;
  renderer.setSize(w, h);
  camera.aspect = aspect;

  if (aspect < 0.55) {
    camera.fov = 75;
    camera.position.set(0, 17, 35);
  } else if (aspect < 0.75) {
    camera.fov = 75;
    camera.position.set(0, 17, 30);
  } else if (aspect < 1.0) {
    camera.fov = 70;
    camera.position.set(0, 18, 36);
  } else if (aspect < 1.4) {
    camera.fov = 60;
    camera.position.set(0, 14, 30);
  } else if (h < 420) {
    camera.fov = 62;
    camera.position.set(0, 15, 32);
  } else {
    camera.fov = 55;
    camera.position.set(0, 12, 26);
  }
  camera.lookAt(0, 0, h < 420 ? 6 : 4);
  camera.updateProjectionMatrix();

  // フォグを画面サイズに応じて調整（縦長ほど薄く＝遠くまで見える）
  if (scene.fog) {
    scene.fog.density = aspect < 0.75 ? 0.005 : 0.008;
  }
}

// ================================================================
//  ユーティリティ
// ================================================================
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// 色補間（hex同士を0〜1のtで混ぜる）
function lerpColor(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}


