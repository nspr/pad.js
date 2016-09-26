var playState = {
    
	create: function () {
        game.time.advancedTiming = true;
        game.renderer.antialias = false;
        var graphics = game.add.graphics(0,0);
//        game.time.desiredfps = 30;
        
//        this.createBoard(5,6);
        
        class Board {
            // In Unity, origin (0,0) is at the bottom left rather than top left like in Phaser.
            // Therefore this.orbs[0] will be the bottom left orb. this.orbs[last] will be at the top right.
            
            constructor(width, height) {
                this.width = width;
                this.height = height;
                
                this.orbs = new Array(width*height);
                for(var i=0; i < this.orbs.length; i++)
                    this.orbs[i] = -1;
//                this.setOrb(0,0,3);
//                this.setOrb(1,0,3);
//                this.setOrb(2,0,3);
//                
//                this.setOrb(3,0,3);
//                this.setOrb(4,0,3);
//                this.setOrb(5,0,3);
//                
//                this.setOrb(3,1,3);
//                this.setOrb(4,1,3);
//                this.setOrb(5,1,3);
//                
//                this.setOrb(0,2,4);
//                
//                this.setOrb(1,1,4);
//                this.setOrb(1,2,4);
//                this.setOrb(2,1,4);
//                this.setOrb(2,2,4);
//                this.setOrb(3,2,4);
//                this.setOrb(2,3,4);
//                this.setOrb(3,3,4);
//                
//                this.setOrb(4,2,2);
//                this.setOrb(5,2,2);
//                this.setOrb(4,3,2);
//                this.setOrb(5,3,2);
//                this.setOrb(4,4,2);
//                this.setOrb(5,4,2);
            }
            
            // Returns the x position of the nth orb of orbs
            nthX(n) {
                return n % this.width;
            }
            // Returns the y position of the nth orb of orbs
            nthY(n) {
                return (n - n%this.width)/this.width;
            }
            xy(x,y) {
                return (x + y*this.width);
            }
            // Gets the type of orb at x,y
            getOrb(x,y) {
                return this.orbs[x + y*this.width];
            }
            
            // Sets the type of orb at x,y
            setOrb(x,y,val) {
                this.orbs[x + y*this.width] = val;
            }
            
            match(minMatch) {
                // Board overlay with orbs to clear. if clears[i] is part of the nth combo then clears[i] = n
                var clears = new Array(this.orbs.length);
                for(var i=0; i < this.orbs.length; i++)
                    clears[i]=0;
                var comboCount = 1;
                
                // List of the combos matched, each element is a combo object
                // [color, number of orbs matched, enhances, TPA?, row?, 5o1e?, cross?]
                var combos = [];
                
                for(var i=0; i < this.orbs.length; i++) {
                    var hCount = 1;                    
                    while(this.orbs[i]>-1 && this.orbs[i] == this.orbs[i+hCount] && ((i+hCount)%this.width >= 1))
                        hCount++;
                    if(hCount >= minMatch) {
                        var comboNumber = comboCount;
                        for(var j=0; j < hCount; j++)
                            for(var k=-1; k < 1; k++)
                                if(clears[i+j+k*this.width] != 0 && this.orbs[i+j+k*this.width] == this.orbs[i+j])
                                    comboNumber = clears[i+j+k*this.width];
                        for(var j=0; j < hCount; j++)
                            clears[i+j] = comboNumber;
                        if(comboNumber == comboCount)
                            comboCount++;
                    }
                    
                    var vCount = 1;
                    while(this.orbs[i]>-1 && this.orbs[i] == this.orbs[i+vCount*this.width] && (i/this.width+vCount)%this.height >= 1)
                        vCount++;
                    if(vCount >= minMatch) {
                        var comboNumber = comboCount;
                        for(var j=0; j < vCount; j++)
                            for(var k=-1; k < 1; k++)
                                if(clears[i+j*this.width+k] != 0 && this.orbs[i+j*this.width+k] == this.orbs[i+j*this.width])
                                    comboNumber = clears[i+j*this.width+k];
                        for(var j=0; j < vCount; j++)
                            clears[i+j*this.width] = comboNumber;
                        if(comboNumber == comboCount)
                            comboCount++;
                    }
                }
                console.log(clears);
                console.log(combos);
                return clears;
            }
            
            clear(clears) {
                for(var i=0; i < this.orbs.length; i++)
                    if(clears[i] != 0)
                        this.orbs[i] = -1;
                for(var i=this.width; i < this.orbs.length; i++) {
                    if(this.orbs[i] != -1) {
                        var fallDistance=0;
                        while(this.orbs[i-(1+fallDistance)*this.width] == -1)
                            fallDistance++;
                        if(fallDistance > 0)
                        {
                            this.orbs[i-fallDistance*this.width] = this.orbs[i];
                            this.orbs[i] = -1;
                        }
                    }
                }
            }
            draw(x,y) {
                var boardOrigin = new Phaser.Point(x,y);
                for(var i=0;i<this.orbs.length;i++)
                    this.drawOrb(this.nthX(i),this.nthY(i),boardOrigin);
            }
            drawOrb(x,y,boardOrigin) {
                var orb = this.getOrb(x,y);
                switch (orb) {
                    case 0:
                        graphics.beginFill(0xFF4080);
                        break;
                    case 1:
                        graphics.beginFill(0xFF0000);
                        break;
                    case 2:
                        graphics.beginFill(0x0000FF);
                        break;
                    case 3:
                        graphics.beginFill(0x00FF00);
                        break;
                    case 4:
                        graphics.beginFill(0xFFFF00);
                        break;
                    case 5:
                        graphics.beginFill(0x800080);
                        break;
                    default:
                        graphics.beginFill(0x222222);
                        break;
                }
                var scale = game.width / (this.width);
                graphics.drawCircle(boardOrigin.x + (.5+x)*scale,boardOrigin.y + game.height - (.5+y)*scale, scale);
            }
            skyfall(buffs) {
                console.log(buffs);
                for(var i=0; i < this.orbs.length; i++) {
                    if(this.orbs[i] < 0)
                        this.orbs[i] = game.rnd.between(0,5);
                }
            }
        }
        
        var board = new Board(6,5);
        board.skyfall([0.15,0.15,0,0,0,0,0]);
        board.draw(0,-.53*game.height);
        board.clear(board.match(3));
        board.draw(0,0);
	},
 
	update: function () {
//        this.drawBoard(board);
	},
    
    
    render: function () {
//        game.debug.text("Shit werks",100,100);
    },
    
//    createBoard: function(boardWidth, boardHeight) {
//        var board = new Array(boardWidth);
//        for (var i = 0; i < board.length; i++) {
//            board[i] = new Array(boardHeight);
//            for(var j = 0; j < board[i].length; j++) {
//                board[i][j] = 0;
//            }
//        }   
//    },
//    
//    drawBoard: function (board) {
//        board.length = boardWidth;
//        board[i].height = boardHeight
//    },
//    
//    drawOrb: function () {
//        
//        console.log('urmom');
//    },
};

