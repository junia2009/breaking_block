// Three.jsによる3Dブロック崩しの初期化
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.min.js';

const container = document.getElementById('game-container');
let renderer, scene, camera;

function init3D() {
  // レンダラー
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x222222, 1);
  // 既存canvasを非表示
  const oldCanvas = document.getElementById('game-canvas');
  if (oldCanvas) oldCanvas.style.display = 'none';
  container.appendChild(renderer.domElement);

  // シーン
  scene = new THREE.Scene();

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

  // 床
  const floorGeo = new THREE.PlaneGeometry(30, 50);
  const floorMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);

  // パドル
  const paddleGeo = new THREE.BoxGeometry(6, 0.7, 1.2);
  const paddleMat = new THREE.MeshPhongMaterial({ color: 0x2196f3 });
  const paddle = new THREE.Mesh(paddleGeo, paddleMat);
  paddle.position.set(0, -1.5, 20);
  scene.add(paddle);

  // ボール
  const ballGeo = new THREE.SphereGeometry(0.6, 32, 32);
  const ballMat = new THREE.MeshPhongMaterial({ color: 0xffeb3b });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(0, 0, 18);
  scene.add(ball);

  // ブロック
  const blocks = [];
  const blockRows = 5;
  const blockCols = 7;
  const blockW = 3.2;
  const blockH = 1.2;
  const blockD = 1;
  for (let r = 0; r < blockRows; r++) {
    for (let c = 0; c < blockCols; c++) {
      const blockGeo = new THREE.BoxGeometry(blockW, blockH, blockD);
      const blockMat = new THREE.MeshPhongMaterial({ color: 0xe57373 });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.x = (c - (blockCols - 1) / 2) * (blockW + 0.4);
      block.position.y = 0.5;
      block.position.z = 6 - r * (blockD + 0.5);
      scene.add(block);
      blocks.push(block);
    }
  }

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init3D);
