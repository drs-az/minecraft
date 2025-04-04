// game.js - updated with higher jump and camera follow for side-scrolling

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('steve', 'assets/steve.png');
  }

  create() {
    // Background
    this.add.image(400, 300, 'background');

    // Static platforms
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, 'platform').setScale(2).refreshBody();
    platforms.create(600, 400, 'platform');
    platforms.create(50, 250, 'platform');
    platforms.create(750, 220, 'platform');

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
    this.cameras.main.setBounds(0, 0, 1600, 600); // Example: scrolling up to 1600px wide world

    // World bounds
    this.physics.world.setBounds(0, 0, 1600, 600);
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
      this.player.setVelocityY(-450); // Increased jump height
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
