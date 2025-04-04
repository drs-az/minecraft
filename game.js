// game.js - fix character/platform alignment and add Steve flip based on direction

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

    for (let i = 0; i < 4; i++) {
      this.addSegment(i);
    }

    this.player = this.physics.add.sprite(100, 450, 'steve');
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
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#000'
    }).setScrollFactor(0).setDepth(10);

    this.timerText = this.add.text(650, 16, 'Time: 60', {
      fontSize: '24px',
      fill: '#000'
    }).setScrollFactor(0).setDepth(10);

    for (let i = 0; i < this.maxHealth; i++) {
      let heart = this.add.image(750 - i * 30, 50, 'heart').setScrollFactor(0).setDepth(10).setScale(0.5);
      this.heartIcons.push(heart);
    }

    this.createRestartButton();
    this.setupStartButton();
  }

  updateHearts() {
    for (let i = 0; i < this.heartIcons.length; i++) {
      this.heartIcons[i].setVisible(i < this.health);
    }
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
    button.style.position = 'absolute';
    button.style.left = '50%';
    button.style.top = 'calc(50% + 60px)';
    button.style.transform = 'translate(-50%, -50%)';
    button.style.fontSize = '24px';
    button.style.padding = '12px 24px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.display = 'none';
    button.style.zIndex = '100';
    button.id = 'restart-button';
    document.getElementById('game-container').appendChild(button);

    button.addEventListener('click', () => {
      window.location.reload();
    });
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
          if (this.bgm && this.bgm.isPlaying) this.bgm.stop();
          this.showGameOverText('You win!');
          document.getElementById('restart-button').style.display = 'block';
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  addSegment(index) {
    let bg = this.add.image(this.backgroundWidth * index + 400, 300, 'background');
    bg.setDepth(-1);
    this.backgrounds.push(bg);

    for (let i = 0; i < 3; i++) {
      let x = this.backgroundWidth * index + 200 + i * 200;
      this.platforms.create(x, 580, 'platform').setScale(1.5).setOrigin(0.5, 1).refreshBody();
      if (i % 2 === 0) {
        this.platforms.create(x, 400 - (i * 20), 'platform').setOrigin(0.5, 1).refreshBody();
      }
      this.coins.create(x + 50, 200, 'coin');
    }

    if (index % 2 === 0) {
      let zombie = this.zombies.create(this.backgroundWidth * index + 600, 520, 'zombie');
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
      if (this.bgm && this.bgm.isPlaying) this.bgm.stop();
      this.showGameOverText('Game Over - You ran out of health!');
      document.getElementById('restart-button').style.display = 'block';
    }
  }

  showGameOverText(message) {
    this.add.text(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2,
      message,
      {
        fontSize: '48px',
        fill: '#800000'
      }
    ).setOrigin(0.5).setDepth(20);
  }

  update() {
    if (!this.gameStarted) return;

    const isTouchingGround = this.player.body.blocked.down;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      if (this.playerFacingRight) {
        this.player.toggleFlipX();
        this.playerFacingRight = false;
      }
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      if (!this.playerFacingRight) {
        this.player.toggleFlipX();
        this.playerFacingRight = true;
      }
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.up.isDown || this.cursors.space.isDown) && isTouchingGround) {
      this.player.setVelocityY(-450);
    }

    this.zombies.children.iterate(zombie => {
      if (zombie.active && this.player.active) {
        const dx = this.player.x - zombie.x;
        const speed = 40;
        if (Math.abs(dx) > 5) {
          zombie.setVelocityX(dx > 0 ? speed : -speed);
          zombie.setFlipX(dx < 0);
        }

        if (Phaser.Math.Between(0, 1000) > 995 && zombie.body.blocked.down) {
          zombie.setVelocityY(-400);
        }
      }
    });

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
