var menuState = {

	create: function() { 
		// Name of the game
		var nameLabel = game.add.text(game.world.centerX, 80, 'gg.js', { font: '50px Arial', fill: '#ffffff' });
		nameLabel.anchor.setTo(0.5, 0.5);

		// How to start the game
		var startLabel = game.add.text(game.world.centerX, game.world.height-80, 'press the up arrow key to start', { font: '25px Arial', fill: '#ffffff' });
		startLabel.anchor.setTo(0.5, 0.5);

		// Add a mute button
		this.muteButton = game.add.button(20, 20, 'mute', this.toggleSound, this);
		this.muteButton.input.useHandCursor = true;
		if (game.sound.mute) {
			this.muteButton.frame = 1;
		}
        this.game.state.start('play');
		// Start the game when the up arrow key is pressed
		var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
		upKey.onDown.addOnce(this.start, this);
	},

	toggleSound: function() {
		game.sound.mute = ! game.sound.mute;
		this.muteButton.frame = game.sound.mute ? 1 : 0;	
	},

	start: function() {
		game.state.start('board');	
	}
};