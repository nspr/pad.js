var playState = {
    
	create: function () {
        game.time.advancedTiming = true;
        game.renderer.antialias = false;
        var graphics = game.add.graphics(0,0);
        
        
        
        class Board {
            // In Unity, origin (0,0) is at the bottom left rather than top left like in Phaser.
            // Therefore this.orbs[0] will be the bottom left orb. this.orbs[last] will be at the top right.
            
            constructor(width, height) {
                this.width = width;
                this.height = height;
                this.orbs = new Array(this.width*this.height);
                this.falls = new Array(this.orbs.length);
                
                
                this.padding = .1;
                this.scale = 105;
                var tileBG = game.add.tileSprite(game.width/2, game.height-this.scale * 3.5, this.scale*this.width, this.scale*this.height, 'tileBG');
                
                this.animationStep = 300;
                
                tileBG.anchor.set(0.5);
                // Array of sprites for all orbs on the board and being skyfalled;
                this.orbSprites = new Array(this.orbs.length);
                this.fallTweens = new Array(this.orbs.length);
                
                for(var i=0; i < this.orbs.length; i++) {
                    this.orbs[i] = game.rnd.between(1,2);
                    this.orbSprites[i] = game.add.sprite(0,0,'transparent');
                }
                
//                this.orbs = ([
////                    1,1,1,2,2,2,
////                    2,2,2,3,2,3,
////                    2,3,3,2,3,2,
////                    2,2,2,1,1,1,
////                    1,1,1,2,2,2,
//                    1,2,2,1,2,1,
//                    2,1,1,2,1,2,
//                    1,2,1,1,1,1,
//                    1,1,1,2,2,2,
//                    1,2,1,2,1,2,
//                ]);
            }
            
            // Displays any board-shaped array in readable rows
            printBoard(board) {
                for(var i=board.length/this.width-1; i >= 0; i--)
                    console.log(board.slice(i*this.width, (i+1)*this.width));
            }
            
            match(minLineMatch, minGlobMatch) {
                // Board overlay with orbs to clear. if clears[i], which is an orb, is part of the nth combo - then clears[i] = n
                // this.falls stores the distance each orb has to fall after matching so sprites can be tweened to their new position.
                var clears = new Array(this.orbs.length);
                for(var i=0; i < this.orbs.length; i++)
                    clears[i] = 0;
                // List of the combos matched, each element is a combo object
                // [color, number of orbs matched, enhances, TPA?, row?, 5o1e?, cross?]
                var combos = [];
                var comboNumber = 0;
                
                
                // Calculate matches in 2 parts. First find all orbs to be matched and cleared and flag with -1.
                // Then go through the entire board, for each orb N, floodfill all spaces that are marked -1 AND the same color as orb N.
                // Use positive integer ComboNumber to mark orbs part of the comboNumber-th combo
                
                // Part 1: Traverse the board horizontally and vertically looking for n-matches.
                // Mark orbs belonging to a match on clears with -1.
                var enhancedRows = findMatchesInLine(this.orbs, this.orbs.length, this.width, this.width, 1);
                var enhancedColumns = findMatchesInLine(this.orbs, this.width, 1, this.orbs.length, this.width);
                
                // Part 2: Starting from origin floodfill every orb that is flagged with -1, marking it with a new combo after every fill.
                for(var i=0; i < this.orbs.length; i++) {
                    if(clears[i] == -1) {
                        combos.push(new ComboData);
                        floodFill(i, clears, this.orbs, this.width, combos.length, combos[combos.length-1]);
                    }
                }
                
                // BEGIN METHODS
                
                // Goes through board in a given orientation and finds matches greater than minLineMatch, in that orientation.
                function findMatchesInLine(orbs, outMax, outStep, inLimit, inStep) {
                    var fullLines = new Array(outMax/outStep);
                    for(var i=0; i < fullLines.length; i++)
                        fullLines[i] = -1;
                    for(var i=0; i < outMax; i+=outStep) {
                        var consecutiveOrbs = 1;
                        var j=0;
                        while(j < inLimit) {
                            if(j+inStep < inLimit && orbs[i+j] == orbs[i+j+inStep])
                                consecutiveOrbs++;
                            else {
                                if(consecutiveOrbs >= minLineMatch)
                                    for(var k=0; k < consecutiveOrbs*inStep; k+=inStep)
                                        clears[i+j-k] = -1;
                                if(consecutiveOrbs == inLimit)
                                    fullLines[i/outStep] = orbs[i];
                                consecutiveOrbs = 1;
                            }
                            j += inStep;
                        }
                    }
                    return fullLines;
                }
                
                // recursively flags all orbs connected to origin that are: marked -1 in clears AND same color as origin.
                // returns a ComboData
                function floodFill(origin, clears, orbs, width, flag, comboData) {
                    clears[origin] = flag;
                    comboData.type = orbs[origin];
                    comboData.size++;
                    
                    if(origin % width > 0 && orbs[origin-1] == orbs[origin] && origin % width < width-1 && orbs[origin+1] == orbs[origin] && origin >= width && orbs[origin-width] == orbs[origin] && origin+width < orbs.length && orbs[origin+width] == orbs[origin])
                        comboData.mightBeCross = true;
                    
                    if(origin % width > 0 && clears[origin-1] == -1 && orbs[origin-1] == orbs[origin])
                        floodFill(origin-1, clears, orbs, width, flag, comboData);
                    if(origin % width < width-1 && clears[origin+1] == -1 && orbs[origin+1] == orbs[origin])
                        floodFill(origin+1, clears, orbs, width, flag, comboData);
                    if(origin >= width && clears[origin-width] == -1 && orbs[origin-width] == orbs[origin])
                        floodFill(origin-width, clears, orbs, width, flag, comboData);
                    if(origin+width < orbs.length && clears[origin+width] == -1 && orbs[origin+width] == orbs[origin])
                        floodFill(origin+width, clears, orbs, width, flag, comboData);
                }
                
                // Containers
                
                // Make one of these for each combo counted; holds info about that combo
                function ComboData() {
                    this.type = -1;
                    this.size = 0;
                    this.mightBeCross = false;
                    this.isTPA = function() {return this.size == 4;}
                    this.is5o1e = function() {return this.size == 5 && this.enhances > 0;}
                    this.isCross = function () {return this.size == 5 && this.mightBeCross;}
                }
                
                // Container for all the info match() spits out. All the data generated from a player's board solve is in here.
                function matchData(comboData, enhancedRows, enhancedColumns, clears) {
                    this.comboData = comboData;
                    this.enhancedRows = enhancedRows;
                    this.enhancedColumns = enhancedColumns;
                    this.clears = clears;
                }
                
                return new matchData(combos, enhancedRows, enhancedColumns, clears);
            }
            
            clear(clears,buffs) {
                var comboIndex = 0;
                
                this.draw();
                
                for(var i=0; i < this.orbs.length; i++) {
                    // Part 1: clearing matched orbs, calculate how far unmatched orbs must fall
                    // Replace with floodfill later
                    this.falls[i] = 0;
                    if(clears[i] > comboIndex) {
                        for(var j=0; j < this.orbs.length; j++) {
                            if(clears[j] == clears[i]) {
                                this.orbs[j] = -1;
                                // COSMETIC: Add tweens to every orb in the nth combo, staggering start times
                                var tween = game.add.tween(this.orbSprites[j])
                                    .to({alpha: 0}, this.animationStep, Phaser.Easing.Linear.None, true, comboIndex*this.animationStep);
                            }
                        }
                        comboIndex++;
                    } else if (clears[i] == 0) {
                        for(var j = i-this.width; j >= 0; j -= this.width)
                            if(clears[j] > 0)
                                this.falls[i]++;
                    }
                }
                
                for(var i=0; i < this.orbs.length; i++) {
                    // Part 2: Make orbs currently on the board fall down.
                    if(this.falls[i] > 0){
                        this.orbs[i-this.falls[i]*this.width] = this.orbs[i];
                        this.orbs[i] = -1;
                        this.falls[i-this.falls[i]*this.width] = this.falls[i];
                        this.falls[i] = 0;
                    }
                }
                
                
                for(var i=0; i < this.orbs.length; i++) {
                    // Part 3: Generate skyfalls and note how far they need to fall.
                    if(this.orbs[i] == -1){
                        this.orbs[i] = game.rnd.between(4,5);
                        // Don't overwrite an already calculated fall distance.
                        if(this.falls[i] < 1)
                            // Do the entire column at once, all skyfall orbs fall the same distance as they spawn in a stacked column
                            for(var j=i; j<this.orbs.length && this.falls[j] < 1; j+=this.width)
                                // Distance an orb must fall
                                this.falls[j] = 1 + Math.floor((this.orbs.length - i - 1)/this.width);                        
                    }
                }
            }

            fall() {
                this.draw();
                // Part 4: Generate animations for falling orbs with Phaser.Tween
                for(var i=0; i < this.orbs.length; i++) {
                    if(this.falls[i] > 0) {
                        // fallDist needs some tweaking as they don't appear to spawn exactly in a column in pad - confirm??
                        var fallDist = this.orbSprites[i].position.y - this.scale*this.falls[i];
                        this.fallTweens[i] = game.add.tween(this.orbSprites[i]);
                        this.fallTweens[i].from({y: fallDist}, this.animationStep, Phaser.Easing.Linear.None, true, 0);
                    }
                }
            }
            
            // MORE COSMETICS:
            draw() {
                for(var i=0;i<this.orbs.length;i++) {
                    var type = this.orbs[i];
                    switch(type) {
                        case 0:
                            this.orbSprites[i].loadTexture('heart',0);
                            break;
                        case 1:
                            this.orbSprites[i].loadTexture('fire',0);
                            break;
                        case 2:
                            this.orbSprites[i].loadTexture('water',0);
                            break;
                        case 3:
                            this.orbSprites[i].loadTexture('wood',0);
                            break;
                        case 4:
                            this.orbSprites[i].loadTexture('light',0);
                            break;
                        case 5:
                            this.orbSprites[i].loadTexture('dark',0);
                            break;
                        default:
                            this.orbSprites[i].loadTexture('transparent',0);
                    }
                    this.orbSprites[i].alpha = 1;
                    this.orbSprites[i].anchor.set(0.5);
                    this.orbSprites[i].position.x = (i % this.width - 2.5) * this.scale + game.width/2;
                    this.orbSprites[i].position.y = (-Math.floor(i/this.width) - .5)*this.scale + game.height-this.scale;
                }
            }
        }
        
        this.board = new Board(6,5);
        this.matchData = this.board.match(3,3);
        this.board.clear(this.matchData.clears);
        console.log(this.matchData);
        
	},
 
	update: function () {
        if(game.input.activePointer.isDown)
            this.board.fall();
	},
    
    
    render: function () {
        
    },
};