// スタート画面の制御
let isGameStarted = false;
window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const overlay = document.getElementById('start-overlay');
  if (startBtn && overlay) {
    overlay.classList.add('active');
    startBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.classList.remove('active');
      setTimeout(() => { overlay.style.display = 'none'; }, 600);
      if (!isGameStarted) {
        init3D();
        isGameStarted = true;
      } else {
        resetGame();
      }
    });
  }
});
// ゲームリセット処理
function resetGame() {
  // ブロック復活
  if (blocks && blocks.length > 0) {
    blocks.forEach(b => b.visible = true);
  }
  // ボールリセット
  if (ball) {
    ball.position.set(0, 0, 18);
  }
  if (typeof ballVelocity === 'object') {
    ballVelocity.x = 0.18 * (Math.random() > 0.5 ? 1 : -1);
    ballVelocity.z = -0.22;
  }
  isGameOver = false;
  isGameClear = false;
  hideMessage();
}
// ゲーム状態
let isGameOver = false;
let isGameClear = false;

// メッセージ表示
function showMessage(text) {
  let msg = document.getElementById('game-message');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'game-message';
    msg.style.position = 'absolute';
    msg.style.top = '50%';
    msg.style.left = '50%';
    msg.style.transform = 'translate(-50%, -50%)';
    msg.style.fontSize = '2.2rem';
    msg.style.color = '#fff';
    msg.style.textShadow = '0 2px 8px #000a';
    msg.style.zIndex = '20';
    msg.style.pointerEvents = 'none';
    document.getElementById('game-container').appendChild(msg);
  }
  msg.textContent = text;
  msg.style.display = 'block';
}

function hideMessage() {
  const msg = document.getElementById('game-message');
  if (msg) msg.style.display = 'none';
}
// パドル操作（マウス・タッチ）
function setupPaddleControl() {
  // マウス操作
  window.addEventListener('mousemove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    // -14〜14の範囲でパドルを動かす
    paddle.position.x = Math.max(-14, Math.min(14, x * 14));
  });
  // タッチ操作
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
      paddle.position.x = Math.max(-14, Math.min(14, x * 14));
    }
  }, { passive: false });

  // キーボード操作（左右）
  let keyLeft = false, keyRight = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      e.preventDefault();
      if (e.code === 'ArrowLeft') keyLeft = true;
      if (e.code === 'ArrowRight') keyRight = true;
    }
  }, { passive: false });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keyLeft = false;
    if (e.code === 'ArrowRight') keyRight = false;
  });

  function movePaddleByKey() {
    if (keyLeft) paddle.position.x = Math.max(-14, paddle.position.x - 0.5);
    if (keyRight) paddle.position.x = Math.min(14, paddle.position.x + 0.5);
    requestAnimationFrame(movePaddleByKey);
  }
  movePaddleByKey();
}
// Three.jsによる3Dブロック崩しの初期化
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.min.js';

// 洗練された多重グラデーション背景テクスチャ生成
function createElegantGradientTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  // 多重グラデーション（中央の水色丸を削除）
  const grad = ctx.createRadialGradient(
    size/2, size/2, size/10,
    size/2, size/2, size/2
  );
  grad.addColorStop(0, '#232a4d');
  grad.addColorStop(0.25, '#2e3a6d');
  grad.addColorStop(0.5, '#3a2e6d');
  grad.addColorStop(0.7, '#181a2d');
  grad.addColorStop(1, '#090a18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

const container = document.getElementById('game-container');
let renderer, scene, camera;
let paddle, ball;
let ballVelocity = { x: 0.18, y: 0, z: -0.22 };
let blocks = [];

function init3D() {
  // レンダラー
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x222222, 1);
    // 既存canvasの上にThree.jsのcanvasを重ねる
    const oldCanvas = document.getElementById('game-canvas');
    if (oldCanvas) {
      oldCanvas.style.background = '#23272b';
      oldCanvas.style.display = 'block';
      oldCanvas.style.position = 'absolute';
      oldCanvas.style.top = '0';
      oldCanvas.style.left = '0';
      oldCanvas.style.width = '100%';
      oldCanvas.style.height = '100%';
      oldCanvas.style.zIndex = '1';
    }
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '2';
  container.appendChild(renderer.domElement);

  // シーン
  scene = new THREE.Scene();
  // 洗練された異世界感：多重グラデーション背景＋光のリング
  scene.background = createElegantGradientTexture();
  // 洗練された星パーティクル
  const starCount = 36;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = [];
  const starSizes = [];
  const starColors = [];
  for (let i = 0; i < starCount; i++) {
    // 床の外側にランダム配置
    const angle = Math.random() * Math.PI * 2;
    const radius = 22 + Math.random() * 10;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = -1.5 + Math.random() * 2.5;
    starPositions.push(x, y, z);
    starSizes.push(0.18 + Math.random() * 0.22);
    // 輝度ランダムな青白
    const c = 0.7 + Math.random() * 0.3;
    starColors.push(c, c, 1.0);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    sizeAttenuation: true
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // カメラ
  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 40);
  camera.lookAt(0, 0, 0);

  // ライト
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(0, 20, 20);
  scene.add(dirLight);

  // 床（上品な青グラデ＋控えめグリッド＋中央光ライン）
  const floorGeo = new THREE.PlaneGeometry(30, 50, 1, 1);
  const floorMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d2236,
    metalness: 0.7,
    roughness: 0.18,
    clearcoat: 0.8,
    clearcoatRoughness: 0.08,
    emissive: 0x003366,
    emissiveIntensity: 0.18
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);
  // 控えめなグリッド
  const grid = new THREE.GridHelper(30, 10, 0x225577, 0x223344);
  grid.position.y = -1.98;
  grid.material.opacity = 0.22;
  grid.material.transparent = true;
  scene.add(grid);
  // 中央に光るライン
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 6, transparent: true, opacity: 0.55 });
  const linePoints = [
    new THREE.Vector3(0, -1.95, 24),
    new THREE.Vector3(0, -1.95, -24)
  ];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  const line = new THREE.Line(lineGeo, lineMat);
  scene.add(line);
  // アークリアクター風ライト（淡く）
  const arcLight = new THREE.PointLight(0x00e5ff, 1.1, 30, 2);
  arcLight.position.set(0, 2, 20);
  scene.add(arcLight);

  // パドル（アイアンマンの胸アーク風：青メタリック）
  const paddleGeo = new THREE.BoxGeometry(6, 0.7, 1.2);
  const paddleMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    metalness: 0.7,
    roughness: 0.2,
    clearcoat: 0.7,
    clearcoatRoughness: 0.1,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.25
  });
  paddle = new THREE.Mesh(paddleGeo, paddleMat);
  paddle.position.set(0, -1.5, 20);
  scene.add(paddle);

  // ボール（アイアンマンのリパルサー風：白青発光）
  const ballGeo = new THREE.SphereGeometry(0.6, 32, 32);
  const ballMat = new THREE.MeshPhysicalMaterial({
    color: 0xeeeeff,
    metalness: 0.8,
    roughness: 0.15,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.7,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });
  ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(0, 0, 18);
  scene.add(ball);

  // ブロック
  const blockRows = 5;
  const blockCols = 7;
  const blockW = 3.2;
  const blockH = 1.2;
  const blockD = 1;
  for (let r = 0; r < blockRows; r++) {
    for (let c = 0; c < blockCols; c++) {
      const blockGeo = new THREE.BoxGeometry(blockW, blockH, blockD);
      // アイアンマンの装甲イメージ：赤・金メタリック
      const isGold = (c + r) % 2 === 0;
      const blockMat = new THREE.MeshPhysicalMaterial({
        color: isGold ? 0xffd700 : 0xb71c1c,
        metalness: 0.85,
        roughness: 0.18,
        clearcoat: 0.7,
        clearcoatRoughness: 0.08,
        emissive: isGold ? 0xffe082 : 0x880000,
        emissiveIntensity: isGold ? 0.18 : 0.12
      });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.x = (c - (blockCols - 1) / 2) * (blockW + 0.4);
      block.position.y = 0.5;
      block.position.z = 6 - r * (blockD + 0.5);
      scene.add(block);
      blocks.push(block);
    }
  }

  setupPaddleControl();
  animate();
}


  // ボール移動・壁反射・パドル反射
  function updateBall() {
    if (isGameOver || isGameClear) return;
    // 移動
    ball.position.x += ballVelocity.x;
    ball.position.z += ballVelocity.z;

    // 壁反射（左右）
    if (ball.position.x > 14 || ball.position.x < -14) {
      ballVelocity.x *= -1;
      ball.position.x = Math.max(Math.min(ball.position.x, 14), -14);
    }
    // 壁反射（上）
    if (ball.position.z < -23) {
      ballVelocity.z *= -1;
      ball.position.z = -23;
    }
    // パドル反射
    if (
      ball.position.z > paddle.position.z - 0.8 &&
      ball.position.z < paddle.position.z + 0.8 &&
      ball.position.x > paddle.position.x - 3.2 &&
      ball.position.x < paddle.position.x + 3.2 &&
      ballVelocity.z > 0
    ) {
      ballVelocity.z *= -1;
      // パドルの端で跳ね返るときに角度をつける
      const hitPos = (ball.position.x - paddle.position.x) / 3.2;
      ballVelocity.x += hitPos * 0.08;
      // 速度の上限
      ballVelocity.x = Math.max(Math.min(ballVelocity.x, 0.35), -0.35);
    }
    // ブロック当たり判定・消去
    let blockHit = false;
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i];
      if (!block.visible) continue;
      const dx = Math.abs(ball.position.x - block.position.x);
      const dz = Math.abs(ball.position.z - block.position.z);
      if (dx < 1.8 && dz < 1.1) {
        // ヒット時
        block.visible = false;
        ballVelocity.z *= -1;
        blockHit = true;
        break;
      }
    }
    // クリア判定
    if (blocks.every(b => !b.visible)) {
      isGameClear = true;
      showMessage('クリア！');
    }
    // 下に落ちたらゲームオーバー
    if (ball.position.z > 25) {
      isGameOver = true;
      showMessage('ゲームオーバー');
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    updateBall();
    renderer.render(scene, camera);
  }

  // ゲームオーバー・クリア時にスタート画面へ戻す
  window.addEventListener('pointerdown', () => {
    if (isGameOver || isGameClear) {
      // スタート画面再表示
      const overlay = document.getElementById('start-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.classList.add('active');
      }
      hideMessage();
    }
  });

// window.addEventListener('DOMContentLoaded', init3D); // スタート画面からのみ呼び出す
