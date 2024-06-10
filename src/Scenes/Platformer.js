class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.foodCounter = 0;
        this.jumps = 0; 
        this.canDoubleJump = false; 
        this.lastWalkingSoundTime = 0;
        this.PlayerScore = 0;
        this.playercheckpoint = false;
        this.isOverlappingSign = false; 
    }

    init() {
        // variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 1000;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.ORIGINAL_SCALE = 1;
    }

    createShield() {
        this.shield = this.add.sprite(my.sprite.player.x + 20, my.sprite.player.y, "umbrella");
        this.shield.setScale(3); 
        this.shield.setVisible(false);
        this.shield.setFlipY(true);
        this.shield.setPosition(-100, -100);
        this.physics.add.existing(this.shield, false);
        this.shield.body.setAllowGravity(false);
        this.shield.body.immovable = true;
    }

    hideShield() {
        this.shield.setVisible(false);
        this.shield.setPosition(-100, -100);
        this.shieldActive = false;
        this.shieldCooldown = true;

        this.time.delayedCall(3000, () => {
            this.shieldCooldown = false;
        }, [], this);
    }

    createFood() {
        let camera = this.cameras.main;
        let xMin = camera.worldView.x;
        let xMax = camera.worldView.x + camera.width;

        let xPosition = Phaser.Math.Between(xMin, xMax);
        
        let food = this.physics.add.sprite(xPosition, 0, "food");
        food.setVelocity(0, 100);
        food.setInteractive();
        this.physics.add.collider(food, this.groundLayer, function (food) {
            food.destroy();
        });
        this.physics.add.overlap(my.sprite.player, food, this.eatFood, null, this);
        this.physics.add.collider(this.shield, food, (shield, food) => {
            food.destroy();
            this.sound.play("umbrellaSound", { volume: 1 });
        }, null, this);
    }

    onPlayerGroundCollision() {
        this.jumps = 0;
        this.canDoubleJump = true;
    }

    preload() {
       /* this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');*/
    }

    create() {
        document.getElementById('description').innerHTML = '<br>Collect Coin and get to the flag // Arrow Left: left // Arrow Right: right // Space: umbrella blocks rain // Arrow Down: Jumping jacks help lose weight';

        this.map = this.add.tilemap("platformer-level-1", 18, 18, 3600, 522);

        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.foodtileset = this.map.addTilesetImage("foodtilemap_packed", "foodtilemap_packed");

        this.bgLayer = this.map.createLayer("background", this.tileset, 0, 0);

        const tintLayer = this.add.graphics();
        tintLayer.fillStyle(0xf70539, 0.6);
        tintLayer.fillRect(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        


        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.foodtileset, 0, 0);
        this.waterlayer = this.map.createLayer("waterlayer", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({ collides: true });



        //Turtorial sign text
        this.tutorialText = this.add.text(100, 100, "Press UP ARROW to jump once or double jump!", {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: null
        });
        this.tutorialText.setScrollFactor(0);
        this.tutorialText.setVisible(false);



        this.tutorialText2 = this.add.text(100, 100, "Watch out for the TORTA rain!", {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: null
        });
        this.tutorialText2.setScrollFactor(0);
        this.tutorialText2.setVisible(false);


        this.tutorialText3 = this.add.text(100, 100, "Press SPACE to pull out UMBRELLA", {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: null
        });
        this.tutorialText3.setScrollFactor(0);
        this.tutorialText3.setVisible(false);

      //  this.animatedTiles.init(this.map);

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "foodtilemap_sheet",
            frame: 15
        });

        this.checkpoint = this.map.createFromObjects("Objects", {
            name: "checkpoint",
            key: "tilemap_sheet",
            frame: 111
        });
        

        this.ravioli = this.map.createFromObjects("Objects", {
            name: "ravioli",
            key: "foodtilemap_sheet",
            frame: 87
        });

        this.water = this.map.createFromObjects("Water", {
            name: "water",
            key: "tilemap_sheet",
            frame: 73
        });

        this.spike = this.map.createFromObjects("Spikes", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 68
        });

        this.flag = this.map.createFromObjects("Finish", {
            name: "flag",
            key: "foodtilemap_sheet",
            frame: 105
        });

        this.sign1 = this.map.createFromObjects("Signs", {
            name: "sign1",
            key: "tilemap_sheet",
            frame: 86
        });

        this.sign2 = this.map.createFromObjects("Signs", {
            name: "sign2",
            key: "tilemap_sheet",
            frame: 86
        });

        this.sign3 = this.map.createFromObjects("Signs", {
            name: "sign3",
            key: "tilemap_sheet",
            frame: 86
        });


        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.physics.world.enable(this.checkpoint, Phaser.Physics.Arcade.STATIC_BODY);
        this.checkpointGroup = this.add.group(this.checkpoint);

        this.physics.world.enable(this.ravioli, Phaser.Physics.Arcade.STATIC_BODY);
        this.ravioliGroup = this.add.group(this.ravioli);

        this.physics.world.enable(this.water, Phaser.Physics.Arcade.STATIC_BODY);
        this.waterGroup = this.add.group(this.water);

        this.physics.world.enable(this.spike, Phaser.Physics.Arcade.STATIC_BODY);
        this.spikeGroup = this.add.group(this.spike);

        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);
        this.flagGroup = this.add.group(this.flag);

        this.physics.world.enable(this.sign1, Phaser.Physics.Arcade.STATIC_BODY);
        this.sign1Group = this.add.group(this.sign1);

        this.physics.world.enable(this.sign2, Phaser.Physics.Arcade.STATIC_BODY);
        this.sign2Group = this.add.group(this.sign2);

        this.physics.world.enable(this.sign3, Phaser.Physics.Arcade.STATIC_BODY);
        this.sign3Group = this.add.group(this.sign3);




        my.sprite.player = this.physics.add.sprite(30, 660, "platformer_characters", "tile_0009.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.physics.add.collider(my.sprite.player, this.groundLayer, this.onPlayerGroundCollision, null, this);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.foodCounter = 0;
            my.sprite.player.setScale(1, 1);
            this.PlayerScore = 1 + this.PlayerScore;
            this.sound.play("coinSound", { volume: 1 });
        });

        this.physics.add.overlap(my.sprite.player, this.checkpointGroup, (obj1, obj2) => {
            this.playercheckpoint = true;
        });

        this.physics.add.overlap(my.sprite.player, this.ravioliGroup, (obj1, obj2) => {
            obj2.destroy();
            this.foodCounter = 0;
            my.sprite.player.setScale(1, 1);
            this.PlayerScore = 5 + this.PlayerScore;
            this.sound.play("coinSound", { volume: 1 });
            this.physics.world.gravity.y = 1000;
            
        });

        this.physics.add.overlap(my.sprite.player, this.flagGroup, (obj1, obj2) => {
            this.foodCounter = 0;
            my.sprite.player.setScale(1, 1);
            this.sound.play("coinSound", { volume: 1 });
            this.scene.start("endScreen", { score: this.PlayerScore });
        });


        this.physics.add.overlap(my.sprite.player, this.sign1Group, (player, sign) => {
            
            this.isOverlappingSign = true;
            if (!this.tutorialText.visible) {
                this.tutorialText.setVisible(true);
                this.tutorialText.setPosition(player.x + 225 , player.y - 150 );
            }
        });

        this.physics.add.overlap(my.sprite.player, this.sign2Group, (player, sign) => {
            
            this.isOverlappingSign = true;
            if (!this.tutorialText2.visible) {
                this.tutorialText2.setVisible(true);
                this.tutorialText2.setPosition(player.x + 225 , player.y - 150 );
            }
        });

        this.physics.add.overlap(my.sprite.player, this.sign3Group, (player, sign) => {
            
            this.isOverlappingSign = true;
            if (!this.tutorialText3.visible) {
                this.tutorialText3.setVisible(true);
                this.tutorialText3.setPosition(player.x -50 , player.y - 100);
            }
        });

        

        this.physics.add.overlap(my.sprite.player, this.waterGroup, this.playerHitWater, null, this);
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, this.playerHitWater, null, this);

        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            scale: { start: 0.03, end: 0.1 },
            lifespan: 350,
            alpha: { start: 1, end: 0.1 },
        });

        my.vfx.walking.stop();

        //Torta 2 Camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.08, 0.08); // Set the deadzone to 8% of the screen width and height
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.setLerp(.1); // Adjust the lerp value for smoother or faster follow

        this.createShield();

        this.foodTimer = this.time.addEvent({
            delay: 20,                // Spawn a food item every 2000 milliseconds (2 seconds)
            callback: this.createFood,
            callbackScope: this,
            loop: true
        });

        this.anims.create({
            key: "puff",
            frames: [
                { key: "explosion00" },
                { key: "explosion01" },
                { key: "explosion02" },
                { key: "explosion03" },
            ],
            framerate: 30,
            repeat: 5,
            hideOnComplete: true
        });

        this.shield.setVisible(false);
        this.shield.setPosition(-100, -100);
        this.shieldActive = false;
        this.shieldCooldown = false;

        this.physics.world.createDebugGraphic();
    }

    eatFood(player, food) {
        food.destroy();
        this.foodCounter += 1;
        player.setScale(player.scaleX + 0.1, player.scaleY + 0.1);
        this.sound.play("hurtSound", { volume: 1 });

        if (player.scaleX > 3) {
            if (this.playercheckpoint == false){
                this.physics.pause();
                this.sound.play("playerExplode", { volume: 1 });
                this.puff = this.add.sprite(player.x, player.y, "explosion03").setScale(0.25).play("puff");
                console.log(this.playercheckpoint);
                this.time.delayedCall(1000, () => this.scene.restart(), [], this);
    
            }
            else {
                player.x = 1265;
                player.y = 400;
                my.sprite.player.setScale(1,1);
            }
        }
    }

    playerHitWater(player, water) {
        if (this.playercheckpoint == false){
            this.physics.pause();
            this.sound.play("playerExplode", { volume: 1 });
            this.puff = this.add.sprite(player.x, player.y, "explosion03").setScale(0.25).play("puff");
            console.log(this.playercheckpoint);
            this.time.delayedCall(1000, () => this.scene.restart(), [], this);

        }
        else {
            player.x = 1265;
            player.y = 400;
            my.sprite.player.setScale(1,1);
        }
        
    }

    update() {
        let sizeFactor = my.sprite.player.scaleX;

        if (sizeFactor === this.ORIGINAL_SCALE) {
            this.acceleration = this.ACCELERATION;
            this.drag = this.DRAG;
            this.jumpVelocity = this.JUMP_VELOCITY;
        } else {
            this.acceleration = this.ACCELERATION / sizeFactor;
            this.drag = this.DRAG * sizeFactor;
            this.jumpVelocity = this.JUMP_VELOCITY / sizeFactor;
        }

        const currentTime = this.time.now;

        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.acceleration);
            my.sprite.player.resetFlip();

            console.log("Playing walk animation"); // Debugging log
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

            if (this.shield.visible) {
                this.shield.setPosition(my.sprite.player.x - 10, my.sprite.player.y - 5);
            }

            if (currentTime - this.lastWalkingSoundTime > 300) {
                this.sound.play("walkingSound", { volume: 1 });
                this.lastWalkingSoundTime = currentTime;
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.acceleration);
            my.sprite.player.setFlip(true, false);

            console.log("Playing walk animation"); // Debugging log
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, true);
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

            if (this.shield.visible) {
                this.shield.setPosition(my.sprite.player.x + 10, my.sprite.player.y - 5);
            }

            if (currentTime - this.lastWalkingSoundTime > 300) {
                this.sound.play("walkingSound", { volume: 1 });
                this.lastWalkingSoundTime = currentTime;
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.drag);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();

            if (this.shield.visible) {
                this.shield.setPosition(my.sprite.player.x + 10, my.sprite.player.y - 5);
            }
        }

        if (my.sprite.player.body.blocked.down) {
            this.jumps = 0;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (my.sprite.player.body.blocked.down || this.jumps < 1) {
                this.sound.play("jumping1", { volume: 1 });
                my.sprite.player.setVelocityY(this.jumpVelocity);
                this.jumps++;
                // Smoothly move the camera to the middle of the screen where the player is
                this.cameras.main.pan(my.sprite.player.x, this.cameras.main.midPoint.y, 500, 'Linear');
            } else if (this.jumps === 1 && this.canDoubleJump) {
                this.sound.play("jumping2", { volume: 1 });
                my.sprite.player.setVelocityY(this.jumpVelocity);
                this.jumps++;
                this.canDoubleJump = false;
                // Smoothly move the camera to the middle of the screen where the player is
                this.cameras.main.pan(my.sprite.player.x, this.cameras.main.midPoint.y, 500, 'Linear');
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if (cursors.down.isDown && my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jumpingJacks', true);

            if (my.sprite.player.scaleX > 1) {
                my.sprite.player.setScale(my.sprite.player.scaleX - 0.01, my.sprite.player.scaleY - 0.01);

                if (currentTime - this.lastWalkingSoundTime > 250) {
                    this.sound.play("jumpingJack1", { volume: 1 });
                    this.lastWalkingSoundTime = currentTime;
                }
            }
        } else {
           // my.sprite.player.anims.play('idle');
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.shieldActive && !this.shieldCooldown) {
            this.shield.setVisible(true);
            this.shieldActive = true;

            this.time.delayedCall(2000, () => {
                this.hideShield();
            }, [], this);
        }
        
        // Hide the tutorial text if the player is not overlapping the sign
        if (!this.isOverlappingSign) {
            this.tutorialText.setVisible(false);
            this.tutorialText2.setVisible(false);
            this.tutorialText3.setVisible(false);
        } else {
            this.isOverlappingSign = false; // Reset the flag for the next frame
        }
    }
}