var bootState = {

	preload: function () {
		game.load.image('progressBar', 'assets/progressBar.png');
        game.load.image('heart', 'assets/heart.png');
        game.load.image('fire', 'assets/fire.png');
        game.load.image('water', 'assets/water.png');
        game.load.image('wood', 'assets/wood.png');
        game.load.image('light', 'assets/light.png');
        game.load.image('dark', 'assets/dark.png');
        game.load.image('transparent', 'assets/transparent.png');
        game.load.image('tileBG', 'assets/tileBG.png');
	},

	create: function() { 
		// Set a background color and the physic system
		game.stage.backgroundColor = '#000000';
        game.renderer.renderSession.roundPixels = true;
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.state.start('load');
	}
};