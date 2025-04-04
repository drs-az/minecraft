// game.js - extended world with looping background, more platforms, and collectibles

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('steve', 'assets/steve.png');
    this.load.image('coin', 'assets/coin.png'); // Collectible
  }

  create() {
    // Create scrolling backgrounds
    this.backgrounds = [];
    for (let i = 0; i < 4; i++) {
      let bg = this.add.image(800 * i + 400, 300, 'background');
      this.backgrounds.push(bg);
    }

    // Static platforms
    const platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 10; i++) {
      platforms.create(i * 300, 580, 'platform').setScale(1.5).refreshBody();
    }
    platforms.create(600, 400, 'platform');
    platforms.create(900, 350, 'platform');
    platforms.create(1200, 300, 'platform');
    platforms.create(1500, 250, 'platform');

    // Player setup
    this.player = this.physics.add.sprite(100, 450, 'steve');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Collide player with platforms
    this.physics.add.collider(this.player, platforms);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Camera follow for side scrolling
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, 3200, 600); // Extended world bounds

    // World bounds
    this.physics.world.setBounds(0, 0, 3200, 600);

    // Collectibles
    this.coins = this.physics.add.group({ key: 'coin', repeat: 19, setXY: { x: 100, y: 0, stepX: 150 } });
    this.coins.children.iterate(child => {
      child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.6));
    });

    // Collide coins with platforms
    this.physics.add.collider(this.coins, platforms);

    // Overlap detection for player collecting coins
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // Score tracking
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#000'
    }).setScrollFactor(0);
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  update() {
    const isTouchingGround = this.player.body.blocked.down;

    // Movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump (higher jump)
    if ((this.cursors.up.isDown || this.cursors.space.isDown) && isTouchingGround) {
      this.player.setVelocityY(-450);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
