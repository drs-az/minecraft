// game.js - adds on-screen touch controls for tablets/mobile

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.backgroundWidth = 800;
    this.segmentCount = 0;
    this.gameStarted = false;
    this.timeRemaining = 60;
    this.health = 3;
    this.maxHealth = 3;
    this.heartIcons = [];
    this.playerFacingRight = true;
    this.touchControls = { left: false, right: false, up: false };
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('steve', 'assets/steve.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.image('zombie', 'assets/zombie.png');
    this.load.image('heart', 'assets/heart.png');
    this.load.audio('coinSound', 'assets/coin.mp3');
    this.load.audio('bgm', 'assets/bgm.mp3');
  }

  create() {
    this.backgrounds = [];
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.group();
    this.zombies = this.physics.add.group();
    this.coinSound = this.sound.add('coinSound');
    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });

    for (let i = 0; i < 4; i++) this.addSegment(i);

    this.player = this.physics.add.sprite(100, 470, 'steve');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(1);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.collider(this.zombies, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.zombies, this.handleZombieCollision, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600);
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600);

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#000' }).setScrollFactor(0).setDepth(10);
    this.timerText = this.add.text(650, 16, 'Time: 60', { fontSize: '24px', fill: '#000' }).setScrollFactor(0).setDepth(10);

    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.image(750 - i * 30, 50, 'heart').setScrollFactor(0).setDepth(10).setScale(0.5);
      this.heartIcons.push(heart);
    }

    this.createRestartButton();
    this.setupStartButton();
    this.setupTouchControls();
  }

  updateHearts() {
    this.heartIcons.forEach((heart, i) => heart.setVisible(i < this.health));
  }

  setupStartButton() {
    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.style.display = 'block';
      startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        this.startGame();
      }, { once: true });
    }
  }

  createRestartButton() {
    const button = document.createElement('button');
    button.innerText = 'Restart';
    Object.assign(button.style, {
      position: 'absolute',
      left: '50%',
      top: 'calc(50% + 60px)',
      transform: 'translate(-50%, -50%)',
      fontSize: '24px',
      padding: '12px 24px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'none',
      zIndex: '100'
    });
    button.id = 'restart-button';
    document.getElementById('game-container').appendChild(button);
    button.addEventListener('click', () => window.location.reload());
  }

  setupTouchControls() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      const container = document.getElementById('game-container');

      const makeButton = (id, text, left) => {
        const btn = document.createElement('button');
        btn.id = id;
        btn.innerText = text;
        Object.assign(btn.style, {
          touchAction: 'none',
          position: 'absolute',
          bottom: '20px',
          left,
          width: '60px',
          height: '60px',
          fontSize: '20px',
          zIndex: '100'
        });
        container.appendChild(btn);
        return btn;
      };

      const leftBtn = makeButton('btn-left', '←', '20px');
      const upBtn = makeButton('btn-up', '↑', '100px');
      const rightBtn = makeButton('btn-right', '→', '180px');

      leftBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.touchControls.left = true;
      });
      leftBtn.addEventListener('pointerup', e => {
        e.preventDefault();
        this.touchControls.left = false;
      });
      leftBtn.addEventListener('touchend', () => this.touchControls.left = false);

      rightBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.touchControls.right = true;
      });
      rightBtn.addEventListener('pointerup', e => {
        e.preventDefault();
        this.touchControls.right = false;
      });
      rightBtn.addEventListener('touchend', () => this.touchControls.right = false);

      upBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.touchControls.up = true;
      });
      upBtn.addEventListener('pointerup', e => {
        e.preventDefault();
        this.touchControls.up = false;
      });
      upBtn.addEventListener('touchend', () => this.touchControls.up = false);
    }
  }

  startGame() {
    this.gameStarted = true;
    this.bgm.play();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeRemaining--;
        this.timerText.setText('Time: ' + this.timeRemaining);
        if (this.timeRemaining <= 0) {
          this.scene.pause();
          if (this.bgm?.isPlaying) this.bgm.stop();
          this.showGameOverText('You win!');
          document.getElementById('restart-button').style.display = 'block';
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  addSegment(index) {
    const bg = this.add.image(this.backgroundWidth * index + 400, 300, 'background');
    bg.setDepth(-1);
    this.backgrounds.push(bg);

    for (let i = 0; i < 3; i++) {
      const x = this.backgroundWidth * index + 200 + i * 200;
      this.platforms.create(x, 580, 'platform').setScale(1.5).setOrigin(0.5, 1).refreshBody();
      if (i % 2 === 0) this.platforms.create(x, 400 - (i * 20), 'platform').setOrigin(0.5, 1).refreshBody();
      this.coins.create(x + 50, 200, 'coin');
    }

    if (index % 2 === 0) {
      const zombie = this.zombies.create(this.backgroundWidth * index + 600, 540, 'zombie');
      zombie.setCollideWorldBounds(true);
      zombie.setBounce(0);
      zombie.setVelocityX(-40);
    }

    this.segmentCount++;
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.coinSound.play();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  handleZombieCollision(player, zombie) {
    zombie.disableBody(true, true);
    this.health--;
    this.updateHearts();
    if (this.health <= 0) {
      this.scene.pause();
      if (this.bgm?.isPlaying) this.bgm.stop();
      this.showGameOverText('Game Over - You ran out of health!');
      document.getElementById('restart-button').style.display = 'block';
    }
  }

  showGameOverText(message) {
    this.add.text(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2,
      message,
      { fontSize: '48px', fill: '#800000' }
    ).setOrigin(0.5).setDepth(20);
  }

  update() {
    if (!this.gameStarted) return;

    const onGround = this.player.body.blocked.down;
    const left = this.cursors.left.isDown || this.touchControls.left;
    const right = this.cursors.right.isDown || this.touchControls.right;
    const jump = (this.cursors.up.isDown || this.cursors.space.isDown || this.touchControls.up) && onGround;

    if (left) {
      this.player.setVelocityX(-160);
      if (this.playerFacingRight) {
        this.player.toggleFlipX();
        this.playerFacingRight = false;
      }
    } else if (right) {
      this.player.setVelocityX(160);
      if (!this.playerFacingRight) {
        this.player.toggleFlipX();
        this.playerFacingRight = true;
      }
    } else {
      this.player.setVelocityX(0);
    }

    if (jump) {
      this.player.setVelocityY(-450);
    }

    this.zombies.children.iterate(zombie => {
      if (!zombie.active || !this.player.active) return;
      const dx = this.player.x - zombie.x;
      zombie.setVelocityX(dx > 0 ? 40 : -40);
      zombie.setFlipX(dx < 0);
      if (Phaser.Math.Between(0, 1000) > 995 && zombie.body.blocked.down) {
        zombie.setVelocityY(-400);
      }
    });

    const neededSegments = Math.floor(this.player.x / this.backgroundWidth) + 2;
    while (this.segmentCount < neededSegments) {
      this.addSegment(this.segmentCount);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 500 }, debug: false }
  },
  scene: MainScene
};

const game = new Phaser.Game(config);
