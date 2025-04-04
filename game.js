// game.js

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets (ensure these files exist or update paths accordingly)
    this.load.image('background', 'assets/background.png');  // Optional background image
    this.load.image('platform', 'assets/platform.png');      // Platform image
    this.load.image('steve', 'assets/steve.png');            // Steve's sprite image
  }

  create() {
    // If you have a background image, add it (adjust the coordinates if needed)
    if (this.textures.exists('background')) {
      this.add.image(400, 300, 'background');
    } else {
      // Alternatively, set a background color
      this.cameras.main.setBackgroundColor('#87CEEB');
    }

    // Create a static group for platforms
    const platforms = this.physics.add.staticGroup();

    // Create ground platform (scales to fill the bottom of the screen)
    platforms.create(400, 580, 'platform').setScale(2).refreshBody();

    // Additional floating platforms
    platforms.create(600, 400, 'platform');
    platforms.create(50, 250, 'platform');
    platforms.create(750, 220, 'platform');

    // Create the player (Steve)
    this.player = this.physics.add.sprite(100, 450, 'steve');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Enable collision between Steve and platforms
    this.physics.add.collider(this.player, platforms);

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // Jumping (only if touching the ground)
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: MainScene
};

// Initialize the game
const game = new Phaser.Game(config);
