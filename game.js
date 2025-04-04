// game.js - fixed layering so Steve stays visible in front of background

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.backgroundWidth = 800;
    this.segmentCount = 0;
    this.gameStarted = false;
    this.timeRemaining = 60;
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('steve', 'assets/steve.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.audio('coinSound', 'assets/coin.mp3');
  }

  create() {
    this.backgrounds = [];
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.group();
    this.coinSound = this.sound.add('coinSound');

    for (let i = 0; i < 4; i++) {
      this.addSegment(i);
    }

    this.player = this.physics.add.sprite(100, 450, 'steve');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(1);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600);
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600);

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#000'
    }).setScrollFactor(0).setDepth(10);

    this.timerText = this.add.text(650, 16, 'Time: 60', {
      fontSize: '24px',
      fill: '#000'
    }).setScrollFactor(0).setDepth(10);

    this.setupStartButton();
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

  startGame() {
    this.gameStarted = true;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeRemaining--;
        this.timerText.setText('Time: ' + this.timeRemaining);
        if (this.timeRemaining <= 0) {
          this.scene.pause();
          this.add.text(this.player.x - 100, 300, 'Game Over!', {
            fontSize: '48px',
            fill: '#ff0000'
          });
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  addSegment(index) {
    let bg = this.add.image(this.backgroundWidth * index + 400, 300, 'background');
    bg.setDepth(-1); // ensure background goes behind player and platforms
    this.backgrounds.push(bg);

    for (let i = 0; i < 3; i++) {
      let x = this.backgroundWidth * index + 200 + i * 200;
      this.platforms.create(x, 580, 'platform').setScale(1.5).refreshBody();
      if (i % 2 === 0) {
        this.platforms.create(x, 400 - (i * 20), 'platform').refreshBody();
      }
      this.coins.create(x + 50, 200, 'coin');
    }

    this.segmentCount++;
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.coinSound.play();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  update() {
    if (!this.gameStarted) return;

    const isTouchingGround = this.player.body.blocked.down;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.up.isDown || this.cursors.space.isDown) && isTouchingGround) {
      this.player.setVelocityY(-450);
    }

    const playerX = this.player.x;
    const neededSegments = Math.floor(playerX / this.backgroundWidth) + 2;
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
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: MainScene
};

const game = new Phaser.Game(config);
