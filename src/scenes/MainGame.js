export class MainGame extends Phaser.Scene {
  constructor() {
    super("MainGame");
    this.ballsCollected = 0;
    this.totalBalls = 21; // Changed to 21 to include the golf ball
    this.inventory = [];
    this.doorOpen = false;
    // Add keys collection to track unlocked doors
    this.keys = [];
    // Track unique ball types to prevent duplicates
    this.collectedBallTypes = new Set();
    // Track letters collected
    this.letters = [];
    // Track if inventory message was shown
    this.inventoryMessageShown = false;

    // Track family members who have completed challenges
    this.completedChallenges = new Set();
    // Track if we're currently showing a family challenge message
    this.challengeHasStarted = false;
    // Track different types of messages
    this.doorMessageActive = false;
    this.doorMessageTimer = null;
    // Track if we're currently in a family interaction
    this.familyInteractionActive = false;

    // Object dimensions for easy adjustment
    this.objectDimensions = {
      player: { width: 50, height: 60 },
      familyCharacter: { width: 64, height: 84 },
      commonBall: { width: 36, height: 36 }, // Increased size slightly
      rareBall: { width: 52, height: 52 }, // Increased size slightly
      superRareBall: { width: 52, height: 52 }, // Increased size slightly
      key: { width: 32, height: 32 },
      letter: { width: 32, height: 48 },
    };
  }

  init(data) {
    // Initialize any data passed from the Start scene
    this.playerSpeed = 80; // Reduced player speed for more immersive exploration
    this.stairsSlowdown = 0.6; // Changed from 0.8 to 0.6 as requested
    this.playerFrozen = false;
    // Add this to your constructor or init method
    this.lastNearDoor = null;
    this.doorMessageShown = false;

    // Standard sizes for sprites - now using the dimensions object
    this.standardSpriteSize = 64; // Standard size for most sprites
    this.playerSize = this.objectDimensions.player.width; // Using dimensions object
    this.ballSize = this.objectDimensions.commonBall.width; // Using dimensions object
    this.rareBallSize = this.objectDimensions.rareBall.width; // Using dimensions object
    this.superRareBallSize = this.objectDimensions.superRareBall.width; // Using dimensions object

    // Interaction settings
    this.interactionDistance = 64; // Distance for door interaction

    // Cleaning settings
    this.cleaningTime = 4; // Seconds required to clean a ball
    this.cleaningProgress = 0; // Current cleaning progress (0-1)

    // Ball name mappings for proper display - TRANSLATED
    this.ballNameMap = {
      first_ball: "Golfo Kamuolys",
      family_me: "Taupykle Kamuolys",
      family_youngest_brother: "Vonios Burbulo Kamuolys",
      family_middle_brother: "Kristalo Kamuolys",
      mom_family: "Kriaukles Kamuolys",
      football: "Futbolo Kamuolys",
      boob: "Papu Kamuolys",
      bowling: "Boulingo Kamuolys",
      cents: "Centu Kamuolys",
      plasma: "Plazmos Kamuolys",
      disco: "Disko Kamuolys",
      massage: "Masazo Kamuolys",
      rubber: "Gumyciu Kamuolys",
      letters: "Raidziu Kamuolys",
      magnetic: "Magnetinis Kamuolys",
      moon: "Menulio Kamuolys",
      rubics: "Rubiko Kamuolys",
      screws: "Varztu Kamuolys",
      sphero: "Sphero Kamuolys",
      electric: "Elektros Kamuolys",
      yoga: "Jogos Kamuolys",
    };

    // Family member data including birthdays - TRANSLATED MESSAGES
    this.familyData = {
      me_character: {
        name: "Majus",
        birthdate: { year: 2007, month: 9, day: 14 },
        message:
          "Tai buvo pats pirmas kamuoliukas kuri tau su pasididziavimu padovanojau, niekados to nepamirsiu",
        ballType: "family_me",
        keyType: "me_character_key",
        roomKey: "Pagrindinis Kambarys",
      },
      brother_middle: {
        name: "Tumas",
        birthdate: { year: 2009, month: 9, day: 22 },
        message:
          "As labai dziaugiuosi kad kolekcionavai kamuoliukus, tai padare musu namus zymiai idomensius",
        ballType: "family_middle_brother",
        keyType: "brother_middle_key",
        roomKey: "Tualetas",
      },
      brother_youngest: {
        name: "Aris",
        birthdate: { year: 2015, month: 8, day: 9 },
        message:
          "Tai buvo mano pirmas kamuoliukas kuri padovanojau, bet tikrai nepaskutinis",
        ballType: "family_youngest_brother",
        keyType: "brother_youngest_key",
        roomKey: "Virtuve",
      },
      mom_character: {
        name: "Mama",
        birthdate: { year: 1982, month: 12, day: 26 },
        message:
          "Per visus siuos metus tavo aistra kamuoliukams mus visus ikvepe. Sis ypatingas kamuoliukas yra dovana tau is manes su meile.",
        ballType: "mom_family",
        keyType: "mom_key",
        roomKey: "Vaiku Kambarys",
      },
    };

    // Challenge key for last door
    this.challengeKey = "challenge_key";

    // Outside door key for the first door (tutorial)
    this.outsideDoorKey = "outside_door_key";
  }

  preload() {
    // Load the tilemap JSON
    this.load.tilemapTiledJSON(
      "house_maze",
      "assets/map/house_maze_upgraded_v4.json"
    );

    // Load web font
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    // Load tileset images
    this.load.image("Brick", "assets/map/Brick.png");
    this.load.image("door_front", "assets/map/door_front.png");
    this.load.image("door_side", "assets/map/door_side.png");
    this.load.image("floor_wood", "assets/map/floor_wood.png");
    this.load.image("floor_wood_dark", "assets/map/floor_wood_dark.png");
    this.load.image("green_tiles_floor", "assets/map/green_tiles_floor.png");
    this.load.image("violet_rug", "assets/map/violet_rug.png");
    this.load.image("stairs", "assets/map/stairs.png");
    this.load.image("cement_floor", "assets/map/cement_floor.png");
    this.load.image("kids_floor", "assets/map/kids_floor.png");
    this.load.image("grass", "assets/map/grass.png");
    this.load.image("window", "assets/map/window.png");

    // Load spawn point images
    this.load.image("ball_spawn_point", "assets/map/ball_spawn_point.png");
    this.load.image("family_spawn_point", "assets/map/family_spawn_point.png");
    this.load.image(
      "special_key_spawn_point",
      "assets/map/special_key_spawn_point.png"
    );

    // Door types
    this.load.image("door_front_opened", "assets/map/door_front_opened.png");
    this.load.image("door_side_opened", "assets/map/door_side_opened.png");

    // Load player and character sprites
    this.load.image("player", "assets/characters/dad_player.png");
    this.load.image("me_character", "assets/characters/me_character.png");
    this.load.image("brother_middle", "assets/characters/brother_middle.png");
    this.load.image(
      "brother_youngest",
      "assets/characters/brother_youngest.png"
    );
    this.load.image("mom_character", "assets/characters/mom_character.png");

    // Load rusty ball sprites (from rustyballs folder)
    this.load.image(
      "rusty_ball_common",
      "assets/rustyballs/rusty_ball_common.png"
    );
    this.load.image(
      "rusty_ball_family",
      "assets/rustyballs/rusty_ball_family.png"
    );
    this.load.image(
      "super_rare_rusty_ball_first",
      "assets/rustyballs/super_rare_rusty_ball_first.png"
    );

    // Load specific ball types for variety (from balls folder)
    this.load.image("football", "assets/balls/football.png");
    this.load.image("boob", "assets/balls/boob.png");
    this.load.image("bowling", "assets/balls/bowling.png");
    this.load.image("cents", "assets/balls/cents.png");
    this.load.image("plasma", "assets/balls/plasma.png");
    this.load.image("disco", "assets/balls/disco.png");
    this.load.image("massage", "assets/balls/massage.png");
    this.load.image("rubber", "assets/balls/rubber.png");
    this.load.image("letters", "assets/balls/letters.png");
    this.load.image("magnetic", "assets/balls/magnetic.png");
    this.load.image("moon", "assets/balls/moon.png");
    this.load.image("rubics", "assets/balls/rubics.png");
    this.load.image("screws", "assets/balls/screws.png");
    this.load.image("sphero", "assets/balls/sphero.png");
    this.load.image("electric", "assets/balls/electric.png");
    this.load.image("yoga", "assets/balls/yoga.png");

    // Load family balls
    this.load.image("family_me", "assets/balls/family_me.png");
    this.load.image(
      "family_middle_brother",
      "assets/balls/family_middle_brother.png"
    );
    this.load.image(
      "family_youngest_brother",
      "assets/balls/family_youngest_brother.png"
    );
    this.load.image("mom_family", "assets/balls/mom_family.png");

    // Load first ball
    this.load.image("first_ball", "assets/balls/first_ball.png");

    // Load UI elements
    this.load.image("inventory_frame", "assets/ui/inventory_frame.png");
    this.load.image("cleaning_cloth", "assets/ui/cleaning_cloth.png");
    this.load.image("popup_background", "assets/ui/popup_background.png");
    this.load.image("inventory_icon", "assets/ui/inventory_icon.png");
    this.load.image("light_mask", "assets/ui/gradation.png");
    this.load.image("end_button", "assets/ui/end_button.png");

    // Load key icons
    this.load.image("key", "assets/ui/key.png");
    this.load.image("letter", "assets/ui/letter.png");

    // Load audio
    this.load.audio("background_music", "assets/audio/background_music.mp3");
    this.load.audio("ball_collect", "assets/audio/ball_collect.mp3");
    this.load.audio("cleaning_sound", "assets/audio/cleaning_sound.mp3");
    this.load.audio("door_open", "assets/audio/door_open.mp3");
  }

  create() {
    try {
      // Create the map
      this.createMap();

      // Create the player at bottom right
      this.createPlayer();

      // Set up camera immediately to follow player
      this.setupCamera();

      // Create light mask
      this.createLightMask();

      // Create doors (after player and map are created)
      this.createDoors();

      // Create the outside door key (tutorial)
      this.createOutsideDoorKey();

      // Create family characters
      this.createFamilyCharacters();

      // Create balls to collect
      this.createBalls();

      // Create the special key in the grass
      this.createSpecialKey();

      // Create UI elements
      this.createDOMUI();

      // Create letter in kids room
      this.createKidsRoomLetter();

      this.createDebugKeys();

      // Set up input controls
      this.cursors = this.input.keyboard.createCursorKeys();

      // Add key for inventory
      this.inventoryKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.I
      );

      // Add key for door interaction
      this.interactKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
      );

      // Add key for family member challenge
      this.challengeActivationKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.K
      );

      // Play background music
      this.backgroundMusic = this.sound.add("background_music", {
        volume: 0.5,
        loop: true,
      });
      this.backgroundMusic.play();

      // Add sound effects
      this.ballCollectSound = this.sound.add("ball_collect", { volume: 0.7 });
      this.cleaningSound = this.sound.add("cleaning_sound", { volume: 0.5 });
      this.doorOpenSound = this.sound.add("door_open", { volume: 0.7 });

      // Store initial spawn position
      this.initialSpawnX = this.map.widthInPixels - 200;
      this.initialSpawnY = this.map.heightInPixels - 200;
    } catch (error) {
      console.error("Error in create method:", error);
      this.showNarratorMessage("Ivyko klaida:( paleisk zaidima is naujo");
    }
  }

  createMap() {
    try {
      // Create the tilemap
      this.map = this.make.tilemap({ key: "house_maze" });

      // Add all tilesets
      const tilesets = [];

      try {
        tilesets.push(this.map.addTilesetImage("Brick", "Brick"));
        tilesets.push(this.map.addTilesetImage("door front ", "door_front"));
        tilesets.push(this.map.addTilesetImage("door side", "door_side"));
        tilesets.push(this.map.addTilesetImage("floor wood", "floor_wood"));
        tilesets.push(
          this.map.addTilesetImage("floor wood dark", "floor_wood_dark")
        );
        tilesets.push(
          this.map.addTilesetImage("green_tiles_floor", "green_tiles_floor")
        );
        tilesets.push(this.map.addTilesetImage("violet_rug", "violet_rug"));
        tilesets.push(this.map.addTilesetImage("stairs", "stairs"));
        tilesets.push(this.map.addTilesetImage("cement_floor", "cement_floor"));
        tilesets.push(this.map.addTilesetImage("kids floor", "kids_floor"));
        tilesets.push(this.map.addTilesetImage("grass", "grass"));
        tilesets.push(this.map.addTilesetImage("window", "window"));

        // Add spawn point tilesets
        tilesets.push(
          this.map.addTilesetImage("ball_spawn_point", "ball_spawn_point")
        );
        tilesets.push(
          this.map.addTilesetImage("family_spawn_point", "family_spawn_point")
        );
        tilesets.push(
          this.map.addTilesetImage(
            "special_key_spawn_point",
            "special_key_spawn_point"
          )
        );

        // Add door tilesets - make sure these are loaded correctly
        tilesets.push(
          this.map.addTilesetImage("door_front_opened", "door_front_opened")
        );
        tilesets.push(
          this.map.addTilesetImage("door_side_opened", "door_side_opened")
        );
      } catch (e) {
        console.warn("Some tilesets couldn't be loaded properly:", e);
      }

      // Filter out any null tilesets
      const validTilesets = tilesets.filter((tileset) => tileset !== null);

      // Create layers - handle both grouped and non-grouped layer formats
      try {
        // Try to create layers with group format first
        this.grassLayer =
          this.map.createLayer("Grass", validTilesets) ||
          this.map.createLayer("Walls/Grass", validTilesets);

        this.objectsLayer =
          this.map.createLayer("Objects", validTilesets) ||
          this.map.createLayer("Walls/Objects", validTilesets);

        this.wallsLayer =
          this.map.createLayer("Walls", validTilesets) ||
          this.map.createLayer("Walls/Walls", validTilesets);

        this.windowsLayer =
          this.map.createLayer("Windows", validTilesets) ||
          this.map.createLayer("Walls/Windows", validTilesets);

        // Create room layers
        this.outsideLayer =
          this.map.createLayer("Outside", validTilesets) ||
          this.map.createLayer("Floors/Outside", validTilesets);

        this.balconyLayer =
          this.map.createLayer("Balcony", validTilesets) ||
          this.map.createLayer("Floors/Balcony", validTilesets);

        this.kitchenLayer =
          this.map.createLayer("Kitchen", validTilesets) ||
          this.map.createLayer("Floors/Kitchen", validTilesets);

        this.toiletLayer =
          this.map.createLayer("Toilet", validTilesets) ||
          this.map.createLayer("Floors/Toilet", validTilesets);

        this.mainRoomLayer =
          this.map.createLayer("Main Room", validTilesets) ||
          this.map.createLayer("Floors/Main Room", validTilesets);

        this.kidsRoomLayer =
          this.map.createLayer("Kids Room", validTilesets) ||
          this.map.createLayer("Floors/Kids Room", validTilesets);

        this.closetLayer =
          this.map.createLayer("Closet", validTilesets) ||
          this.map.createLayer("Floors/Closet", validTilesets);

        // Create door layers - UPDATED APPROACH
        // Store both closed and opened door layers
        this.doorLayers = {};

        // Define door pairs based on the Tiled structure
        const doorPairs = [
          {
            closed: "Door First",
            opened: "Door First Opened",
            position: "Horizontal",
          },
          {
            closed: "Door Second",
            opened: "Door Second Opened",
            position: "Vertical",
          },
          {
            closed: "Door Third",
            opened: "Door Third Opened",
            position: "Horizontal",
          },
          {
            closed: "Door Fourth",
            opened: "Door Fourth Opened",
            position: "Vertical",
          },
          {
            closed: "Door Fifth",
            opened: "Door Fifth Opened",
            position: "Horizontal",
          },
          {
            closed: "Door Sixth",
            opened: "Door Sixth Opened",
            position: "Vertical",
          },
        ];

        // Process each door pair
        doorPairs.forEach((pair, index) => {
          // Try to create the closed door layer
          const closedLayer =
            this.map.createLayer(pair.closed, validTilesets) ||
            this.map.createLayer(`Doors/${pair.closed}`, validTilesets);

          // Try to create the opened door layer
          const openedLayer =
            this.map.createLayer(pair.opened, validTilesets) ||
            this.map.createLayer(`Doors/${pair.opened}`, validTilesets);

          if (closedLayer && openedLayer) {
            // Store both layers with their properties
            this.doorLayers[pair.closed] = {
              closedLayer: closedLayer,
              openedLayer: openedLayer,
              position: pair.position,
              index: index,
              state: "Closed", // Initial state
            };

            // Set collision for closed door layer
            closedLayer.setCollisionByExclusion([-1]);

            // Hide opened door layer initially
            openedLayer.setVisible(false);

            console.log(
              `Added door pair: ${pair.closed} / ${pair.opened} (${pair.position})`
            );
          } else {
            console.warn(
              `Could not create door layers for ${pair.closed} / ${pair.opened}`
            );
          }
        });

        // Get spawn point layers - these are tile layers, not object layers
        this.ballSpawnLayer =
          this.map.createLayer("Ball Spawn Point", validTilesets) ||
          this.map.createLayer(
            "Spawn Points/Ball Spawn Point",
            validTilesets
          ) ||
          this.map.createLayer("Ball Spawn Points", validTilesets);

        this.familySpawnLayer =
          this.map.createLayer("Family Spawn Point", validTilesets) ||
          this.map.createLayer(
            "Spawn Points/Family Spawn Point",
            validTilesets
          ) ||
          this.map.createLayer("Family Spawn Points", validTilesets);

        this.specialKeySpawnLayer =
          this.map.createLayer("Special Key Spawn Point", validTilesets) ||
          this.map.createLayer(
            "Spawn Points/Special Key Spawn Point",
            validTilesets
          ) ||
          this.map.createLayer("Special Key Spawn Points", validTilesets);

        // Hide the spawn point layers - they're just for placement
        if (this.ballSpawnLayer) this.ballSpawnLayer.setVisible(false);
        if (this.familySpawnLayer) this.familySpawnLayer.setVisible(false);
        if (this.specialKeySpawnLayer)
          this.specialKeySpawnLayer.setVisible(false);

        // Create a separate stairs layer for detection only (no rendering)
        this.stairsLayer = this.physics.add.group();

        // Find all stairs tiles in the Objects layer and add them to our stairs group
        if (this.objectsLayer) {
          this.objectsLayer.forEachTile((tile) => {
            // Check if the tile is a stairs tile (indices 413 and 414 in your tileset)
            if (tile && (tile.index === 413 || tile.index === 414)) {
              // Create an invisible physics object at the tile position
              const stairObj = this.stairsLayer.create(
                tile.pixelX + tile.width / 2,
                tile.pixelY + tile.height / 2,
                null // No texture
              );
              stairObj.setVisible(false);
              stairObj.body.setSize(tile.width, tile.height);
              stairObj.body.immovable = true;
            }
          });
        }

        // Set collision on walls - add null check
        if (this.wallsLayer) {
          this.wallsLayer.setCollisionByExclusion([-1]);
        }

        // Set collision on objects except stairs (413, 414) - add null check
        if (this.objectsLayer) {
          this.objectsLayer.setCollisionByExclusion([413, 414]);
        }

        // Log the layers that were successfully created
        console.log("Map layers created:", {
          grass: !!this.grassLayer,
          objects: !!this.objectsLayer,
          walls: !!this.wallsLayer,
          windows: !!this.windowsLayer,
          outside: !!this.outsideLayer,
          balcony: !!this.balconyLayer,
          kitchen: !!this.kitchenLayer,
          toilet: !!this.toiletLayer,
          mainRoom: !!this.mainRoomLayer,
          kidsRoom: !!this.kidsRoomLayer,
          closet: !!this.closetLayer,
          doorLayers: Object.keys(this.doorLayers).length,
          ballSpawn: !!this.ballSpawnLayer,
          familySpawn: !!this.familySpawnLayer,
          specialKeySpawn: !!this.specialKeySpawnLayer,
        });
      } catch (e) {
        console.error("Error creating map layers:", e);
        // Create a fallback background if layers fail
        this.add
          .rectangle(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels,
            0xf5f5dc
          )
          .setOrigin(0, 0);

        // Create collision walls manually
        this.createCollisionWalls();
      }
    } catch (error) {
      console.error("Error creating map:", error);
      // Create a fallback map if the tilemap fails to load
      this.createFallbackMap();
    }
  }

  createLightMask() {
    // Create a light mask for atmospheric effect
    if (this.player) {
      // Create a container for the light
      this.lightContainer = this.add.container(this.player.x, this.player.y);
      this.lightContainer.setDepth(20); // Above most elements but below UI

      // Create the light mask with original size and no filters
      this.lightMask = this.add.image(0, 0, "light_mask");
      this.lightMask.setDisplaySize(2880, 1660); // Original size as requested
      // No alpha adjustment as requested

      // Add to container
      this.lightContainer.add(this.lightMask);

      console.log("Light mask created");
    } else {
      console.warn("Cannot create light mask: player not initialized");
    }
  }

  // Add missing fallback methods
  createCollisionWalls() {
    console.log("Creating fallback collision walls");
    // Create a simple boundary around the game area
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create a physics group for walls
    this.fallbackWalls = this.physics.add.staticGroup();

    // Top wall
    this.fallbackWalls
      .create(width / 2, 0, null)
      .setDisplaySize(width, 20)
      .refreshBody();
    // Bottom wall
    this.fallbackWalls
      .create(width / 2, height, null)
      .setDisplaySize(width, 20)
      .refreshBody();
    // Left wall
    this.fallbackWalls
      .create(0, height / 2, null)
      .setDisplaySize(20, height)
      .refreshBody();
    // Right wall
    this.fallbackWalls
      .create(width, height / 2, null)
      .setDisplaySize(20, height)
      .refreshBody();

    // Add collision with player (if player exists)
    if (this.player) {
      this.physics.add.collider(this.player, this.fallbackWalls);
    }
  }

  createFallbackMap() {
    console.log("Creating fallback map");
    // Create a simple map with a background color
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create a background
    this.add.rectangle(0, 0, width, height, 0xf5f5dc).setOrigin(0, 0);

    // Create a simple house outline
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x000000, 1);
    graphics.strokeRect(100, 100, width - 200, height - 200);

    // Add some rooms
    graphics.strokeRect(100, 100, (width - 200) / 2, (height - 200) / 2);
    graphics.strokeRect(
      100 + (width - 200) / 2,
      100,
      (width - 200) / 2,
      (height - 200) / 2
    );
    graphics.strokeRect(
      100,
      100 + (height - 200) / 2,
      (width - 200) / 2,
      (height - 200) / 2
    );

    // Create collision walls
    this.createCollisionWalls();

    // Create a map object with basic properties
    this.map = {
      widthInPixels: width,
      heightInPixels: height,
    };
  }

  createPlayer() {
    // Create the player at the bottom right of the map
    const spawnX = this.map ? this.map.widthInPixels - 200 : 400;
    const spawnY = this.map ? this.map.heightInPixels - 200 : 400;

    this.player = this.physics.add.sprite(spawnX, spawnY, "player");

    // Set player size using dimensions object
    this.player.displayWidth = this.objectDimensions.player.width;
    this.player.displayHeight = this.objectDimensions.player.height;

    // Set player depth to be above most objects
    this.player.setDepth(10);

    // Enable physics
    this.player.setCollideWorldBounds(true);

    // Add collision with walls and objects if they exist
    if (this.wallsLayer) {
      this.physics.add.collider(this.player, this.wallsLayer);
    }

    if (this.objectsLayer) {
      this.physics.add.collider(this.player, this.objectsLayer);
    }

    // Add collision with fallback walls if they exist
    if (this.fallbackWalls) {
      this.physics.add.collider(this.player, this.fallbackWalls);
    }

    console.log(`Player created at (${spawnX}, ${spawnY})`);
  }

  setupCamera() {
    // Set up camera to follow player
    if (this.player) {
      this.cameras.main.startFollow(this.player);

      // Set zoom level to 2.0 as requested
      this.baseZoom = 2.0;
      this.cameras.main.setZoom(this.baseZoom);

      // Set camera bounds if map exists
      if (this.map) {
        this.cameras.main.setBounds(
          0,
          0,
          this.map.widthInPixels,
          this.map.heightInPixels
        );

        // Set world bounds to match map size - fix height to 1080
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, 1280);
        console.log(`World bounds set to: ${this.map.widthInPixels}x1280`);
      }
    }
  }

  // Updated createDoors method with proper collision logic
  createDoors() {
    console.log("Creating doors...");

    // Define door properties for each door pair
    const doorProperties = [
      {
        roomFrom: "Laukas",
        requiredKey: this.outsideDoorKey,
        targetRoom: "Balkono",
      },
      {
        roomFrom: "Balkonas",
        requiredKey: "brother_youngest_key",
        targetRoom: "Virtuves",
      },
      {
        roomFrom: "Virtuve",
        requiredKey: "brother_middle_key",
        targetRoom: "Tuoleto",
      },
      {
        roomFrom: "Virtuve",
        requiredKey: "me_character_key",
        targetRoom: "Pagrindinio kambario",
      },
      {
        roomFrom: "Pagrindinis kambarys",
        requiredKey: "mom_key",
        targetRoom: "Vaiku kambario",
      },
      {
        roomFrom: "Vaiku kambarys",
        requiredKey: this.challengeKey,
        targetRoom: "Spintos",
      },
    ];

    // Store door interaction areas
    this.doorInteractionAreas = [];

    // Process each door layer pair
    const doorLayerNames = Object.keys(this.doorLayers);

    doorLayerNames.forEach((layerName, index) => {
      const doorData = this.doorLayers[layerName];

      if (!doorData || !doorData.closedLayer || !doorData.openedLayer) {
        console.warn(`Missing layer data for door: ${layerName}`);
        return;
      }

      // Get the closed and opened layers
      const closedLayer = doorData.closedLayer;
      const openedLayer = doorData.openedLayer;

      // Get properties for this door
      const props = doorProperties[index] || {
        roomFrom: "Unknown",
        requiredKey: "Auto Key",
        targetRoom: "Unknown",
      };

      // Find all door tiles in the closed layer to create interaction areas
      closedLayer.forEachTile((tile) => {
        if (tile && tile.index !== -1) {
          // Create an interaction area for this door tile
          const interactionArea = {
            x: tile.pixelX + tile.width / 2,
            y: tile.pixelY + tile.height / 2,
            width: tile.width,
            height: tile.height,
            layerName: layerName,
            closedLayer: closedLayer,
            openedLayer: openedLayer,
            isOpen: false,
            roomFrom: props.roomFrom,
            requiredKey: props.requiredKey,
            targetRoom: props.targetRoom,
          };

          this.doorInteractionAreas.push(interactionArea);

          console.log(
            `Door interaction area created: ${props.roomFrom} -> ${props.targetRoom} (requires: ${props.requiredKey}) at (${interactionArea.x}, ${interactionArea.y})`
          );
        }
      });

      // Set collision for closed door layer - IMPORTANT: This makes the closed door solid
      closedLayer.setCollisionByExclusion([-1]);

      // Hide opened door layer initially
      openedLayer.setVisible(false);

      console.log(`Set up collision for door layers: ${layerName}`);
    });

    // Add collision between player and all door layers
    if (this.player) {
      // Add collision for all door layers (both closed and opened)
      doorLayerNames.forEach((layerName) => {
        const doorData = this.doorLayers[layerName];
        if (doorData && doorData.closedLayer) {
          this.physics.add.collider(this.player, doorData.closedLayer);
          console.log(`Added collision for closed door layer: ${layerName}`);
        }
        if (doorData && doorData.openedLayer) {
          this.physics.add.collider(this.player, doorData.openedLayer);
          console.log(`Added collision for opened door layer: ${layerName}`);
        }
      });
    }
  }

  // Modify the openDoor method to use our targeted approach
  openDoor(door) {
    console.log(
      `Opening door at (${door.x}, ${door.y}), layerName=${door.layerName}`
    );

    // Play door sound
    if (this.doorOpenSound) this.doorOpenSound.play();

    // Immediately clear all messages
    this.clearAllMessages();

    // Toggle layer visibility and collision
    if (door.closedLayer && door.openedLayer) {
      // Hide the closed door layer
      door.closedLayer.setVisible(false);

      // Disable collision for the closed door layer
      door.closedLayer.setCollisionByExclusion([]);
      console.log(
        `Disabled collision for closed door layer: ${door.layerName}`
      );

      // Show the opened door layer
      door.openedLayer.setVisible(true);

      // Make sure collision is enabled for the opened door layer
      door.openedLayer.setCollisionByExclusion([-1]);
      console.log(`Enabled collision for opened door layer: ${door.layerName}`);
    }

    // Mark door as open
    door.isOpen = true;

    // Clear only door prompts
    this.clearDoorPromptOnly();

    // AGGRESSIVE FIX: Remove this door from the interaction areas array
    this.doorInteractionAreas = this.doorInteractionAreas.filter(
      (d) => d.x !== door.x || d.y !== door.y
    );

    // Remove the key from inventory if it's not a special door
    if (door.requiredKey !== "Auto Key" && door.requiredKey !== "none") {
      // Find the key in the inventory and remove it
      const keyIndex = this.keys.indexOf(door.requiredKey);
      if (keyIndex !== -1) {
        this.keys.splice(keyIndex, 1);
        this.updateKeyCount();
        console.log(
          `Removed key ${door.requiredKey} from inventory after using it`
        );
      }
    }

    console.log(`Marked door as open: ${door.layerName}`);

    // Check if this is the closet door and add the first ball inside
    if (door.targetRoom === "Spintos" && !this.closetBallAdded) {
      // Check if player has collected at least 20 balls
      if (this.ballsCollected >= 20) {
        this.addFirstBallToCloset();
      } else {
        // Show message that player needs more balls
        this.showNarratorMessage(
          "Tau reikia surinkti bent 20 kamuoliu, kad galetum ieiti i spinta!"
        );

        // Close the door again
        door.closedLayer.setVisible(true);
        door.closedLayer.setCollisionByExclusion([-1]);
        door.openedLayer.setVisible(false);
        door.isOpen = false;
      }
    }
  }

  // New method to aggressively clear all door-related messages
  clearAllDoorMessages() {
    if (this.NarratorBox) {
      this.NarratorBox.destroy();
      this.NarratorText.destroy();
      if (this.narratorTimer) {
        this.time.removeEvent(this.narratorTimer);
        this.narratorTimer = null;
      }
      this.NarratorBox = null;
      this.NarratorText = null;
      this.isShowingDoorPrompt = false;
      this.isShowingNarratorMessage = false;
    }
  }

  createOutsideDoorKey() {
    // Create a key for the first door as a tutorial
    this.outsideDoorKeys = this.physics.add.group();

    // Position the key at the specified coordinates
    const keyX = 1552;
    const keyY = 1200;

    // Create the key
    const outsideDoorKey = this.outsideDoorKeys.create(keyX, keyY, "key");

    // Set size for the key using dimensions object
    outsideDoorKey.displayWidth = this.objectDimensions.key.width;
    outsideDoorKey.displayHeight = this.objectDimensions.key.height;

    // Store the key type
    outsideDoorKey.keyType = this.outsideDoorKey;

    // Add some visual effects to make it noticeable
    this.tweens.add({
      targets: outsideDoorKey,
      y: outsideDoorKey.y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add glow effect
    outsideDoorKey.preFX.addGlow(0xffff00, 4, 0, false, 0.1, 16);

    console.log(
      `Created outside door key at (${outsideDoorKey.x}, ${outsideDoorKey.y})`
    );

    // Add overlap detection with player
    if (this.player) {
      this.physics.add.overlap(
        this.player,
        this.outsideDoorKeys,
        this.collectKey,
        null,
        this
      );
    }

    // Show tutorial message
    this.time.delayedCall(1000, () => {
      this.showNarratorMessage(
        "Sveikas atvyke i musu senus namus! Surask ir nuvalyk visus 21 kamuoliukus, kad uzbaigtum savo kolekcija."
      );

      // Add check for player proximity to key
      this.keyMessageShown = false; // Add this at the top of the method

      // Then add this at the end of the method
      this.time.addEvent({
        delay: 100,
        callback: this.checkKeyProximity,
        callbackScope: this,
        loop: true,
      });
    });
  }

  checkKeyProximity() {
    // Skip if message already shown
    if (this.keyMessageShown || !this.player || !this.outsideDoorKeys) return;

    // Check distance to each key
    this.outsideDoorKeys.getChildren().forEach((key) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        key.x,
        key.y
      );

      // If player is within 2 tiles (128 pixels)
      if (distance < 64) {
        // Show the message
        this.showNarratorMessage(
          "Ziurek! Prie duru yra raktas. Paimk ji - tau jo reikes norint atrakinti duris"
        );
        this.keyMessageShown = true;

        // Freeze the player
        this.playerFrozen = true;

        // Stop any current movement
        if (this.player) {
          this.player.setVelocity(0, 0);
        }

        // Create a timer to unfreeze after 3 seconds
        this.time.delayedCall(5000, () => {
          this.playerFrozen = false;
        });
      }
    });
  }

  // Updated family character interaction to directly start ball cleaning
  createFamilyCharacters() {
    // Create family character group
    this.familyCharacters = this.physics.add.group();

    // Define the family character spawn positions manually to ensure correct placement
    const familyPositions = {
      me_character: { x: 1360, y: 80 },
      brother_middle: { x: 1584, y: 272 },
      mom_character: { x: 592, y: 784 },
      brother_youngest: { x: 1552, y: 1072 },
    };

    // For each family character in our data
    Object.keys(this.familyData).forEach((characterKey) => {
      // Get the correct position for this character
      const position = familyPositions[characterKey];

      if (position) {
        // Create the family character at the specified position
        const familyMember = this.familyCharacters.create(
          position.x,
          position.y,
          characterKey
        );

        // Set fixed size for family characters using dimensions object
        familyMember.displayWidth = this.objectDimensions.familyCharacter.width;
        familyMember.displayHeight =
          this.objectDimensions.familyCharacter.height;

        familyMember.setImmovable(true);

        // Apply character data
        familyMember.characterKey = characterKey;
        familyMember.characterData = this.familyData[characterKey];
        familyMember.message = this.familyData[characterKey].message;
        familyMember.ballType = this.familyData[characterKey].ballType;
        familyMember.keyType = this.familyData[characterKey].keyType;
        familyMember.roomKey = this.familyData[characterKey].roomKey;
        familyMember.setDepth(5);

        // Add flags to track interaction state
        familyMember.ballCollected = false;
        familyMember.keyCollected = false;
        familyMember.challengePromptShown = false;

        console.log(
          `Created ${characterKey} at (${familyMember.x}, ${familyMember.y})`
        );
      }
    });

    // Add overlap detection with player
    if (this.player && this.familyCharacters) {
      this.physics.add.overlap(
        this.player,
        this.familyCharacters,
        this.interactWithFamily,
        null,
        this
      );
    }
  }

createBalls() {
  // Create ball groups
  this.rustyBalls = this.physics.add.group();
  this.rareBalls = this.physics.add.group();
  this.superRareBall = this.physics.add.group();

  // Array of different ball types for variety
  const ballTypes = [
    "football",
    "boob",
    "bowling",
    "cents",
    "plasma",
    "disco",
    "massage",
    "rubber",
    "letters",
    "magnetic",
    "moon",
    "rubics",
    "screws",
    "sphero",
    "electric",
    "yoga",
  ];

  // Get ball spawn points from the ball spawn layer
  if (this.ballSpawnLayer) {
    console.log("Found ball spawn layer");

    // Find all ball spawn tiles in the layer
    const ballSpawnPoints = [];
    this.ballSpawnLayer.forEachTile((tile) => {
      if (tile && tile.index === 776) { // Only use tiles with index 776
        ballSpawnPoints.push({
          x: tile.pixelX + tile.width / 2,
          y: tile.pixelY + tile.height / 2,
        });
      }
    });

    console.log(`Found ${ballSpawnPoints.length} ball spawn points`);

    // Create balls at the spawn points (up to 16 total for common balls)
    const maxBalls = Math.min(16, ballSpawnPoints.length);

    for (let i = 0; i < maxBalls; i++) {
      const spawnPoint = ballSpawnPoints[i];

      const ballType = ballTypes[i % ballTypes.length];

      const ball = this.rustyBalls.create(
        spawnPoint.x,
        spawnPoint.y,
        "rusty_ball_common"
      );

      // Set fixed size for rusty balls using dimensions object
      ball.displayWidth = this.objectDimensions.commonBall.width;
      ball.displayHeight = this.objectDimensions.commonBall.height;

      // Store the true ball type for later reveal
      ball.trueBallType = ballType;

      ball.setAlpha(0.7); // Make them look rusty/faded
      ball.setDepth(1);

      console.log(
        `Created rusty ball (${ballType}) at (${ball.x}, ${ball.y})`
      );
    }
  } else {
    console.warn("No ball spawn layer found");
    // Fallback code remains the same...
  }

  // Add overlap detection with player
  if (this.player) {
    if (this.rustyBalls) {
      this.physics.add.overlap(
        this.player,
        this.rustyBalls,
        this.startBallCleaning,
        null,
        this
      );
    }

    if (this.superRareBall) {
      this.physics.add.overlap(
        this.player,
        this.superRareBall,
        this.startBallCleaning,
        null,
        this
      );
    }
  }
}

  createSpecialKey() {
    // Create the special key on the grass
    this.specialKeys = this.physics.add.group();

    // Get the special key spawn point from the special key spawn layer
    if (this.specialKeySpawnLayer) {
      console.log("Found special key spawn layer");

      // Find the first special key spawn tile in the layer
      let keySpawnPoint = null;
      this.specialKeySpawnLayer.forEachTile((tile) => {
        if (tile && tile.index !== -1 && !keySpawnPoint) {
          keySpawnPoint = {
            x: tile.pixelX + tile.width / 2,
            y: tile.pixelY + tile.height / 2,
          };
        }
      });

      if (keySpawnPoint) {
        console.log(
          `Found special key spawn point at (${keySpawnPoint.x}, ${keySpawnPoint.y})`
        );

        const specialKey = this.specialKeys.create(
          keySpawnPoint.x,
          keySpawnPoint.y,
          "key"
        );

        // Set size for the key using dimensions object
        specialKey.displayWidth = this.objectDimensions.key.width;
        specialKey.displayHeight = this.objectDimensions.key.height;

        // Store the key type
        specialKey.keyType = this.challengeKey;

        // Add some visual effects to make it noticeable
        this.tweens.add({
          targets: specialKey,
          y: specialKey.y - 5,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        // Add glow effect
        specialKey.preFX.addGlow(0xffff00, 4, 0, false, 0.1, 16);

        console.log(
          `Created special key at (${specialKey.x}, ${specialKey.y})`
        );
      } else {
        console.warn("No special key spawn point found in the layer");
      }
    } else {
      console.warn("No special key spawn layer found");
    }

    // Add overlap detection with player
    if (this.player && this.specialKeys) {
      this.physics.add.overlap(
        this.player,
        this.specialKeys,
        this.collectKey,
        null,
        this
      );
    }
  }

// Add this method to your MainGame class
createDOMUI() {
  console.log("Creating DOM UI elements");
  
  // Remove any existing UI
  const existingUI = document.getElementById('game-ui');
  if (existingUI) {
    existingUI.remove();
  }
  
  // Create UI container
  const uiContainer = document.createElement('div');
  uiContainer.id = 'game-ui';
  uiContainer.style.position = 'absolute';
  uiContainer.style.top = '0';
  uiContainer.style.left = '0';
  uiContainer.style.width = '100%';
  uiContainer.style.height = '100%';
  uiContainer.style.pointerEvents = 'none';
  uiContainer.style.zIndex = '1000';
  
  // Create ball count element
  const ballCount = document.createElement('div');
  ballCount.id = 'ball-count';
  ballCount.style.position = 'absolute';
  ballCount.style.top = '20px';
  ballCount.style.left = '20px';
  ballCount.style.color = 'white';
  ballCount.style.textShadow = '2px 2px 2px black';
  ballCount.style.fontFamily = 'Orbitron, sans-serif';
  ballCount.style.fontSize = '20px';
  ballCount.textContent = `Kamuoliai: ${this.ballsCollected}/${this.totalBalls}`;
  
  // Create key count element
  const keyCount = document.createElement('div');
  keyCount.id = 'key-count';
  keyCount.style.position = 'absolute';
  keyCount.style.top = '50px';
  keyCount.style.left = '20px';
  keyCount.style.color = 'yellow';
  keyCount.style.textShadow = '2px 2px 2px black';
  keyCount.style.fontFamily = 'Orbitron, sans-serif';
  keyCount.style.fontSize = '20px';
  keyCount.textContent = `Raktai: ${this.keys.length}/5`;
  
  // Create inventory icon
  const inventoryIcon = document.createElement('div');
  inventoryIcon.id = 'inventory-icon';
  inventoryIcon.style.position = 'absolute';
  inventoryIcon.style.bottom = '20px';
  inventoryIcon.style.left = '20px';
  inventoryIcon.style.width = '70px';
  inventoryIcon.style.height = '70px';
  inventoryIcon.style.backgroundImage = 'url("assets/ui/inventory_icon.png")';
  inventoryIcon.style.backgroundSize = 'contain';
  inventoryIcon.style.backgroundRepeat = 'no-repeat';
  inventoryIcon.style.pointerEvents = 'auto';
  inventoryIcon.style.cursor = 'pointer';
  
  // Add event listener for inventory
  inventoryIcon.addEventListener('click', () => {
    this.showInventory();
  });
  
  // Add elements to container
  uiContainer.appendChild(ballCount);
  uiContainer.appendChild(keyCount);
  uiContainer.appendChild(inventoryIcon);
  
  // Add container to document
  document.body.appendChild(uiContainer);
  
  // Store references for updating
  this.domBallCount = ballCount;
  this.domKeyCount = keyCount;
  
  console.log("DOM UI elements created");
  
  // Set up update function for DOM UI
  this.events.on('update', this.updateDOMUI, this);
}

// Add this method to update the DOM UI
updateDOMUI() {
  if (this.domBallCount) {
    this.domBallCount.textContent = `Kamuoliai: ${this.ballsCollected}/${this.totalBalls}`;
  }
  
  if (this.domKeyCount) {
    this.domKeyCount.textContent = `Raktai: ${this.keys.length}/5`;
  }
}

  createKidsRoomLetter() {
    // Create a letter in the kids room with a hint about the special key
    this.letterItems = this.physics.add.group();

    // Find the ball at position (368, 752) and place the letter 3 tiles above it
    const letterX = 368;
    const letterY = 752 - 96; // 3 tiles above (32 pixels per tile)

    const letter = this.letterItems.create(letterX, letterY, "letter");

    // Make it look like a letter using dimensions object
    letter.displayWidth = this.objectDimensions.letter.width;
    letter.displayHeight = this.objectDimensions.letter.height;
    letter.setAlpha(0.8);

    // Updated letter content in createKidsRoomLetter method
    letter.message =
      "Mielas Teti,\n\nPaslepiau spintos rakta lauke ant zoles. Jo reikes, kad rastum ipatinga kamuoliuka!\n\nSu meile, Tavo Sunus";

    // Add a glow effect to make it noticeable
    letter.preFX.addGlow(0xffffff, 2, 0, false, 0.1, 10);

    console.log(`Created letter at (${letter.x}, ${letter.y})`);

    // Add overlap detection with player
    if (this.player && this.letterItems) {
      this.physics.add.overlap(
        this.player,
        this.letterItems,
        this.readLetter,
        null,
        this
      );
    }
  }

  // Method to scale UI elements based on camera zoom
  scaleUIElements() {
    const zoom = this.cameras.main.zoom || this.baseZoom || 1.5;
    const zoomFactor = (this.baseZoom || 1.5) / zoom;

    // Scale text elements
    if (this.ballCountText) {
      this.ballCountText.setFontSize(Math.round(18 * zoomFactor));
    }

    if (this.keyCountText) {
      this.keyCountText.setFontSize(Math.round(18 * zoomFactor));
    }

    // Scale inventory icon
    if (this.inventoryIcon) {
      this.inventoryIcon.setDisplaySize(
        Math.round(50 * zoomFactor),
        Math.round(50 * zoomFactor)
      );
      this.inventoryIcon.x = 60;
      this.inventoryIcon.y = this.cameras.main.height - 60;
    }
  }

  // Updated updateKeyCount and updateBallCount methods
  updateKeyCount() {
    if (this.keyCountText) {
      this.keyCountText.setText(`Raktai: ${this.keys.length}/5`);
    }
  }

  updateBallCount() {
    // Update the ball count text
    if (this.ballCountText) {
      this.ballCountText.setText(
        `Kamuoliai: ${this.ballsCollected}/${this.totalBalls}`
      );
    }
  }

  showInventory() {
    // Don't show inventory if already in cleaning mode or inventory mode
    if (this.cleaningMode || this.inventoryMode) return;

    // Set inventory mode flag
    this.inventoryMode = true;

    // Stop player movement
    if (this.player) {
      this.player.setVelocity(0);
    }

    // Hide inventory icon while inventory is open
    if (this.inventoryIcon) {
      this.inventoryIcon.setVisible(false);
    }

    // Create inventory popup
    this.createInventoryPopup();
  }

  // Updated createInventoryPopup method with Lithuanian text
  createInventoryPopup() {
    // Create a semi-transparent background
    this.popupBackground = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    );
    this.popupBackground.setScrollFactor(0);
    this.popupBackground.setDepth(50);

    // Create popup panel
    this.popupPanel = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "popup_background"
    );
    this.popupPanel.setScrollFactor(0);
    this.popupPanel.setDepth(51);
    this.popupPanel.setDisplaySize(620, 600);

    // Add title
    this.inventoryTitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 225,
      "INVENOTORIUS",
      {
        font: "bold 24px Orbitron", // Adjusted for higher zoom
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      }
    );
    this.inventoryTitle.setOrigin(0.5);
    this.inventoryTitle.setScrollFactor(0);
    this.inventoryTitle.setDepth(52);

    // Create inventory tabs
    this.createInventoryTabs();

    // Display collected balls in a grid
    this.displayInventoryBalls();

    // Add close button
    this.closeButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 220,
      "Uzdaryti",
      {
        font: "bold 18px Orbitron", // Adjusted for higher zoom
        fill: "#ffffff",
        backgroundColor: "#4a4a4a",
        padding: { x: 20, y: 10 },
      }
    );
    this.closeButton.setOrigin(0.5);
    this.closeButton.setScrollFactor(0);
    this.closeButton.setDepth(52);
    this.closeButton.setInteractive({ useHandCursor: true });

    // Add hover effect
    this.closeButton.on("pointerover", () => {
      this.closeButton.setBackgroundColor("#6a6a6a");
    });

    this.closeButton.on("pointerout", () => {
      this.closeButton.setBackgroundColor("#4a4a4a");
    });

    // Add click handler
    this.closeButton.on("pointerdown", () => {
      this.closeInventoryPopup();
    });

    // Add click on background to close
    this.popupBackground.setInteractive();
    this.popupBackground.on("pointerdown", () => {
      this.closeInventoryPopup();
    });
  }

  // Updated createInventoryTabs method with Lithuanian text
  createInventoryTabs() {
    // Create tabs for balls, keys, and letters
    const tabWidth = 140;
    const tabHeight = 40;
    const tabY = this.cameras.main.height / 2 - 175;

    // Balls tab
    this.ballsTab = this.add.rectangle(
      this.cameras.main.width / 2 - tabWidth,
      tabY,
      tabWidth,
      tabHeight,
      0x4a4a4a
    );
    this.ballsTab.setScrollFactor(0);
    this.ballsTab.setDepth(52);
    this.ballsTab.setInteractive({ useHandCursor: true });

    this.ballsTabText = this.add.text(
      this.cameras.main.width / 2 - tabWidth,
      tabY,
      "Kamuoliai",
      {
        font: "bold 18px Orbitron",
        fill: "#ffffff",
      }
    );
    this.ballsTabText.setOrigin(0.5);
    this.ballsTabText.setScrollFactor(0);
    this.ballsTabText.setDepth(53);

    // Keys tab
    this.keysTab = this.add.rectangle(
      this.cameras.main.width / 2,
      tabY,
      tabWidth,
      tabHeight,
      0x333333
    );
    this.keysTab.setScrollFactor(0);
    this.keysTab.setDepth(52);
    this.keysTab.setInteractive({ useHandCursor: true });

    this.keysTabText = this.add.text(
      this.cameras.main.width / 2,
      tabY,
      "Raktai",
      {
        font: "bold 18px Orbitron",
        fill: "#cccccc",
      }
    );
    this.keysTabText.setOrigin(0.5);
    this.keysTabText.setScrollFactor(0);
    this.keysTabText.setDepth(53);

    // Letters tab
    this.lettersTab = this.add.rectangle(
      this.cameras.main.width / 2 + tabWidth,
      tabY,
      tabWidth,
      tabHeight,
      0x333333
    );
    this.lettersTab.setScrollFactor(0);
    this.lettersTab.setDepth(52);
    this.lettersTab.setInteractive({ useHandCursor: true });

    this.lettersTabText = this.add.text(
      this.cameras.main.width / 2 + tabWidth,
      tabY,
      "Laiskai",
      {
        font: "bold 18px Orbitron",
        fill: "#cccccc",
      }
    );
    this.lettersTabText.setOrigin(0.5);
    this.lettersTabText.setScrollFactor(0);
    this.lettersTabText.setDepth(53);

    // Set current tab
    this.currentTab = "balls";

    // Add click handlers
    this.ballsTab.on("pointerdown", () => {
      this.switchInventoryTab("balls");
    });

    this.keysTab.on("pointerdown", () => {
      this.switchInventoryTab("keys");
    });

    this.lettersTab.on("pointerdown", () => {
      this.switchInventoryTab("letters");
    });
  }

  switchInventoryTab(tab) {
    // Skip if already on this tab
    if (this.currentTab === tab) return;

    // Update tab visuals
    if (tab === "balls") {
      this.ballsTab.setFillStyle(0x4a4a4a);
      this.ballsTabText.setFill("#ffffff");
      this.keysTab.setFillStyle(0x333333);
      this.keysTabText.setFill("#cccccc");
      this.lettersTab.setFillStyle(0x333333);
      this.lettersTabText.setFill("#cccccc");
    } else if (tab === "keys") {
      this.ballsTab.setFillStyle(0x333333);
      this.ballsTabText.setFill("#cccccc");
      this.keysTab.setFillStyle(0x4a4a4a);
      this.keysTabText.setFill("#ffffff");
      this.lettersTab.setFillStyle(0x333333);
      this.lettersTabText.setFill("#cccccc");
    } else if (tab === "letters") {
      this.ballsTab.setFillStyle(0x333333);
      this.ballsTabText.setFill("#cccccc");
      this.keysTab.setFillStyle(0x333333);
      this.keysTabText.setFill("#cccccc");
      this.lettersTab.setFillStyle(0x4a4a4a);
      this.lettersTabText.setFill("#ffffff");
    }

    // Set current tab
    this.currentTab = tab;

    // Recreate the inventory container
    if (this.inventoryItemsContainer) {
      this.inventoryItemsContainer.destroy();
    }

    // Display appropriate items
    if (tab === "balls") {
      this.displayInventoryBalls();
    } else if (tab === "keys") {
      this.displayInventoryKeys();
    } else if (tab === "letters") {
      this.displayInventoryLetters();
    }
  }

  // Updated displayInventoryBalls method with Lithuanian text for empty inventory and improved spacing
  displayInventoryBalls() {
    // Create a container for the inventory balls
    this.inventoryItemsContainer = this.add.container(0, 0);
    this.inventoryItemsContainer.setDepth(52);
    this.inventoryItemsContainer.setScrollFactor(0);

    // If no balls collected yet
    if (this.inventory.length === 0) {
      const emptyText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Dar nesurinkai nei vieno kamuolio.\nTyrinek nama, kad atrastumete savo kamuolius!",
        {
          font: "18px Orbitron",
          fill: "#ffffff",
          align: "center",
        }
      );
      emptyText.setOrigin(0.5);
      emptyText.setScrollFactor(0);
      this.inventoryItemsContainer.add(emptyText);
      return;
    }

    // Display balls in a grid with better spacing and centering
    const gridStartX = this.cameras.main.width / 2 - 220; // Adjusted for better centering
    const gridStartY = this.cameras.main.height / 2 - 110;
    const ballSize = 50; // Increased size
    const padding = 40; // Increased padding
    const columns = 6; // Reduced columns for better spacing

    // Add each ball to the inventory display
    this.inventory.forEach((ballType, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      const x = gridStartX + col * (ballSize + padding);
      const y = gridStartY + row * (ballSize + padding + 20); // Added extra vertical spacing

      const ball = this.add.image(x, y, ballType);
      ball.setDisplaySize(ballSize, ballSize);

      // Add ball name below - use the mapping for proper names
      const ballName =
        this.ballNameMap[ballType] ||
        ballType.charAt(0).toUpperCase() + ballType.slice(1).replace(/_/g, " ");
      const nameText = this.add.text(x, y + ballSize / 2 + 10, ballName, {
        font: "12px Orbitron", // Slightly smaller font to fit more
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: 80 },
      });
      nameText.setOrigin(0.5, 0);
      nameText.setScrollFactor(0);

      this.inventoryItemsContainer.add(ball);
      this.inventoryItemsContainer.add(nameText);
    });
  }

  // Updated displayInventoryKeys method with Lithuanian text for empty inventory
  displayInventoryKeys() {
    // Create a container for the inventory keys
    this.inventoryItemsContainer = this.add.container(0, 0);
    this.inventoryItemsContainer.setDepth(52);
    this.inventoryItemsContainer.setScrollFactor(0);

    // If no keys collected yet
    if (this.keys.length === 0) {
      const emptyText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Dar nesurinkai nei vieno rakto.\nGauk raktus is seimos nariu ivykdant ju issukius!",
        {
          font: "18px Orbitron",
          fill: "#ffffff",
          align: "center",
        }
      );
      emptyText.setOrigin(0.5);
      emptyText.setScrollFactor(0);
      this.inventoryItemsContainer.add(emptyText);
      return;
    }

    // Display keys in a grid with increased spacing
    const gridStartX = this.cameras.main.width / 2 - 200;
    const gridStartY = this.cameras.main.height / 2 - 100;
    const keySize = 50;
    const padding = 60; // Increased padding for better spacing
    const columns = 2; // Reduced columns for better spacing

    // Updated key names in displayInventoryKeys method
    // Map key types to room names
    const keyNameMap = {
      outside_door_key: "Lauko Duru Raktas",
      me_character_key: "Pagrindinio Kambario Raktas",
      brother_middle_key: "Tualeto Raktas",
      brother_youngest_key: "Virtuves Raktas",
      mom_key: "Vaiku Kambario Raktas",
      challenge_key: "Spintos Raktas",
    };

    // Add each key to the inventory display
    this.keys.forEach((keyType, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      const x = gridStartX + col * (keySize + padding);
      const y = gridStartY + row * (keySize + padding);

      const key = this.add.image(x, y, "key");
      key.setDisplaySize(keySize, keySize);

      // Add different colors for different keys
      const keyColors = {
        outside_door_key: 0xffa500, // Orange
        me_character_key: 0x66ff66, // Green
        brother_middle_key: 0x6666ff, // Blue
        brother_youngest_key: 0xffff66, // Yellow
        mom_key: 0xff6666, // Red
        challenge_key: 0xff66ff, // Purple
      };

      // Apply tint to the key
      if (keyColors[keyType]) {
        key.setTint(keyColors[keyType]);
      }

      // Add key name below
      const keyName =
        keyNameMap[keyType] ||
        keyType.charAt(0).toUpperCase() + keyType.slice(1).replace(/_/g, " ");
      const nameText = this.add.text(x, y + keySize / 2 + 10, keyName, {
        font: "14px Orbitron",
        fill: "#ffffff",
        align: "center",
      });
      nameText.setOrigin(0.5, 0);
      nameText.setScrollFactor(0);

      this.inventoryItemsContainer.add(key);
      this.inventoryItemsContainer.add(nameText);
    });
  }

  // Updated displayInventoryLetters method with Lithuanian text for empty inventory
  displayInventoryLetters() {
    // Create a container for the inventory letters
    this.inventoryItemsContainer = this.add.container(0, 0);
    this.inventoryItemsContainer.setDepth(52);
    this.inventoryItemsContainer.setScrollFactor(0);

    // If no letters collected yet
    if (!this.letterRead) {
      const emptyText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Dar neradai nei vieno laisko.\nIeskok namuose, kad rastum laiskus!",
        {
          font: "18px Orbitron",
          fill: "#ffffff",
          align: "center",
        }
      );
      emptyText.setOrigin(0.5);
      emptyText.setScrollFactor(0);
      this.inventoryItemsContainer.add(emptyText);
      return;
    }

    // Display the letter
    const letterX = this.cameras.main.width / 2;
    const letterY = this.cameras.main.height / 2 - 100;

    // Add letter icon
    const letterIcon = this.add.image(letterX, letterY, "letter");
    letterIcon.setDisplaySize(64, 96);

    // Add letter content in a popup-style background
    const letterBackground = this.add.image(
      letterX,
      letterY + 150,
      "popup_background"
    );
    letterBackground.setDisplaySize(400, 200);

    // Add letter text with cursive font
    const letterText = this.add.text(
      letterX,
      letterY + 150,
      "Mielas Teti,\n\nPaslepiau spintos rakta lauke ant zoles. Jo reikes, kad rastum ipatinga kamuoliuka!\n\nSu meile, Tavo Sunus",
      {
        font: "italic 16px Orbitron",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: 350 },
      }
    );
    letterText.setOrigin(0.5);
    letterText.setScrollFactor(0);

    this.inventoryItemsContainer.add(letterIcon);
    this.inventoryItemsContainer.add(letterBackground);
    this.inventoryItemsContainer.add(letterText);
  }

  closeInventoryPopup() {
    // Remove all popup elements
    if (this.popupBackground) this.popupBackground.destroy();
    if (this.popupPanel) this.popupPanel.destroy();
    if (this.inventoryTitle) this.inventoryTitle.destroy();
    if (this.closeButton) this.closeButton.destroy();

    // Remove tab elements
    if (this.ballsTab) this.ballsTab.destroy();
    if (this.ballsTabText) this.ballsTabText.destroy();
    if (this.keysTab) this.keysTab.destroy();
    if (this.keysTabText) this.keysTabText.destroy();
    if (this.lettersTab) this.lettersTab.destroy();
    if (this.lettersTabText) this.lettersTabText.destroy();

    // Remove inventory container
    if (this.inventoryItemsContainer) {
      this.inventoryItemsContainer.destroy();
    }

    // Reset inventory mode
    this.inventoryMode = false;

    // Show inventory icon again
    if (this.inventoryIcon) {
      this.inventoryIcon.setVisible(true);
    }
  }

  // Updated letter reading to show letter before adding to inventory
  readLetter(player, letter) {
    // Don't process if already reading a letter
    if (this.readingLetter) return;

    // Set reading letter flag
    this.readingLetter = true;

    // Create a semi-transparent background
    const letterBackground = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    );
    letterBackground.setScrollFactor(0);
    letterBackground.setDepth(90);

    // Create letter popup
    const letterPopup = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "popup_background"
    );
    letterPopup.setScrollFactor(0);
    letterPopup.setDepth(91);
    letterPopup.setDisplaySize(500, 400);

    // Add letter icon
    const letterIcon = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 120,
      "letter"
    );
    letterIcon.setScrollFactor(0);
    letterIcon.setDepth(92);
    letterIcon.setDisplaySize(64, 96);

    // Add letter content
    const letterContent = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 25,
      letter.message,
      {
        font: "italic 18px Orbitron",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: 400 },
      }
    );
    letterContent.setOrigin(0.5);
    letterContent.setScrollFactor(0);
    letterContent.setDepth(92);

    // Add close button
    const closeButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      "Perskaiciau laiska",
      {
        font: "bold 18px Orbitron",
        fill: "#ffffff",
        backgroundColor: "#4a6c2a",
        padding: { x: 20, y: 10 },
      }
    );
    closeButton.setOrigin(0.5);
    closeButton.setScrollFactor(0);
    closeButton.setDepth(92);
    closeButton.setInteractive({ useHandCursor: true });

    // Add hover effects
    closeButton.on("pointerover", () => {
      closeButton.setBackgroundColor("#6a8c4a");
    });

    closeButton.on("pointerout", () => {
      closeButton.setBackgroundColor("#4a6c2a");
    });

    // Add click handler
    closeButton.on("pointerdown", () => {
      // Remove letter popup elements
      letterBackground.destroy();
      letterPopup.destroy();
      letterIcon.destroy();
      letterContent.destroy();
      closeButton.destroy();

      // Add letter to inventory
      if (!this.letterRead) {
        this.letterRead = true;
        // Updated letter added message in readLetter method
        this.showNarratorMessage("Laiskas pridetas i inventoriu!");
      }

      // Remove the letter from the game world
      letter.destroy();

      // Reset reading letter flag
      this.readingLetter = false;
    });
  }

  showNarratorMessage(message) {
    console.log("NARRATOR DEBUG | Attempting to show message:", message);

    // Clear any existing message and timer
    if (this.NarratorBox) {
      this.NarratorBox.destroy();
      this.NarratorText.destroy();

      // Clear any existing timer
      if (this.narratorTimer) {
        this.time.removeEvent(this.narratorTimer);
      }
    }

    // Create a semi-transparent background with extreme depth
    this.NarratorBox = this.add.rectangle(
      this.cameras.main.width / 2,
      120,
      600,
      120,
      0x000000,
      0.8
    );
    this.NarratorBox.setScrollFactor(0);
    this.NarratorBox.setDepth(1000); // Extremely high depth

    // Add text with even higher depth
    this.NarratorText = this.add.text(
      this.cameras.main.width / 2,
      320, // Centered in the box
      message,
      {
        font: "bold 20px Orbitron",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
        wordWrap: { width: 550 },
      }
    );
    this.NarratorText.setOrigin(0.5, 0.5); // Center text in box
    this.NarratorText.setScrollFactor(0);
    this.NarratorText.setDepth(1001); // Even higher depth

    // If this is a challenge prompt message, store a reference to it
    if (this.challengePromptMessage) {
      this.challengePromptBox = this.NarratorBox;
      this.challengePromptText = this.NarratorText;
    }

    // Auto-hide after 5 seconds with a timer we can reference
    this.narratorTimer = this.time.delayedCall(5000, () => {
      if (this.NarratorBox) {
        this.NarratorBox.destroy();
        this.NarratorText.destroy();
        this.NarratorBox = null;
        this.NarratorText = null;
        this.narratorTimer = null;

        // Reset challenge prompt references if this was a challenge prompt
        if (this.challengePromptMessage) {
          this.challengePromptBox = null;
          this.challengePromptText = null;
          this.challengePromptMessage = false;
        }
      }
    });
  }

  interactWithFamily(player, familyMember) {
    // If we're already in a family interaction, don't start another one
    if (this.familyInteractionActive) return;

    // If we haven't given a ball yet, give the ball first
    if (!familyMember.ballCollected) {
      // Set the interaction flag
      this.familyInteractionActive = true;

      // Show the family member's message
      this.showNarratorMessage(familyMember.message);

      // Mark this family member as already visited
      familyMember.ballCollected = true;

      // Create a temporary ball object to pass to the cleaning function
      const familyBall = {
        x: familyMember.x,
        y: familyMember.y,
        texture: { key: "rusty_ball_family" },
        trueBallType: familyMember.ballType,
        message: familyMember.message,
        destroy: function () {}, // Dummy destroy function
      };

      // Start cleaning the ball directly
      this.startBallCleaning(player, familyBall, true);

      // Show confirmation message
      this.showNarratorMessage(
        `${familyMember.characterData.name} dave tau surudijusi kamuoli. Nuvalyk ji, kad pamatytum, kas slypi viduje!`
      );
    }
    // If ball is collected but not key, show the challenge prompt
    else if (
      !familyMember.keyCollected &&
      !this.completedChallenges.has(familyMember.characterKey) &&
      !this.challengeHasStarted
    ) {
      // Set the interaction flag
      this.familyInteractionActive = true;

      // Store the current family member for the challenge
      this.currentFamilyMember = familyMember;

      // Show the challenge prompt using a special tag to identify it
      const roomName = familyMember.roomKey;

      // Clear any existing messages first
      this.clearAllMessages();

      // Create a special message that we can identify as a challenge prompt
      this.challengePromptMessage = true; // Add this flag to identify challenge prompts
      this.showNarratorMessage(
        `Norint gauti rakta i ${roomName} duris, paspausk K.`
      );

      // Reset the interaction flag after a delay
      this.time.delayedCall(3000, () => {
        this.familyInteractionActive = false;
      });
    }
  }

  collectKey(player, key) {
    // Add the key to the player's inventory
    this.keys.push(key.keyType);

    // Play sound effect
    this.ballCollectSound.play();

    // Show message with corrected translations
    if (key.keyType === this.outsideDoorKey) {
      this.showNarratorMessage("Radai Rakta I Lauko Duris!");
    } else if (key.keyType === this.challengeKey) {
      this.showNarratorMessage("Radai Rakta I Spintos Duris!");
    } else {
      this.showNarratorMessage(
        `Radai Rakta I ${key.keyType.replace(/_/g, " ")} Duris!`
      );
    }

    // Remove the key from the game
    key.destroy();

    // Update UI
    this.updateKeyCount();
  }

  // Updated ball cleaning to handle family balls and remove unnecessary messages
  startBallCleaning(player, ball, isFamily = false) {
    // If we're already cleaning a ball, don't start another one
    if (this.cleaningMode) return;

    // Set the current ball being cleaned
    this.currentBall = ball;
    this.cleaningMode = true;
    this.cleaningProgress = 0;
    this.isFamilyBall = isFamily;

    // Stop player movement
    if (this.player) {
      this.player.setVelocity(0);
    }

    // Hide inventory icon while cleaning
    if (this.inventoryIcon) {
      this.inventoryIcon.setVisible(false);
    }

    // Create cleaning popup
    this.createCleaningPopup(ball);
  }

  createCleaningPopup(ball) {
    // Create a semi-transparent background
    this.popupBackground = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    );
    this.popupBackground.setScrollFactor(0);
    this.popupBackground.setDepth(50);

    // Create popup panel
    this.popupPanel = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "popup_background"
    );
    this.popupPanel.setScrollFactor(0);
    this.popupPanel.setDepth(51);
    this.popupPanel.setDisplaySize(500, 380);

    // Add rusty ball to clean
    this.rustyBallDisplay = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 10,
      ball.texture.key // Use the actual rusty ball texture
    );
    this.rustyBallDisplay.setScrollFactor(0);
    this.rustyBallDisplay.setDepth(52);
    this.rustyBallDisplay.setDisplaySize(210, 200);

    // Create the true ball underneath (initially masked)
    this.trueBallDisplay = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 10,
      ball.trueBallType
    );
    this.trueBallDisplay.setScrollFactor(0);
    this.trueBallDisplay.setDepth(51);
    this.trueBallDisplay.setDisplaySize(150, 150);
    this.trueBallDisplay.setVisible(false); // Hide initially

    // Add cleaning cloth that follows mouse
    this.cleaningCloth = this.add.image(
      this.input.x,
      this.input.y,
      "cleaning_cloth"
    );
    this.cleaningCloth.setScrollFactor(0);
    this.cleaningCloth.setDepth(53);
    this.cleaningCloth.setDisplaySize(80, 80);
    this.cleaningCloth.setOrigin(0.5, 0.5);

    // Add instruction text
    this.cleaningText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 140,
      "Laikyk ir trink, kad kamuolys butu nuvalytas",
      {
        font: "18px Orbitron", // Adjusted for higher zoom
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      }
    );
    this.cleaningText.setScrollFactor(0);
    this.cleaningText.setDepth(52);
    this.cleaningText.setOrigin(0.5);

    // Initialize cleaning progress variables
    this.cleaningProgress = 0;
    this.cleaningTimer = 0;
    this.cleaningNeeded = this.cleaningTime; // Use the time in seconds from init
    this.lastCleaningTime = 0;

    // Add progress bar
    this.progressBarBackground = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 130,
      300,
      30,
      0x333333
    );
    this.progressBarBackground.setScrollFactor(0);
    this.progressBarBackground.setDepth(52);

    this.progressBar = this.add.rectangle(
      this.cameras.main.width / 2 - 150,
      this.cameras.main.height / 2 + 130,
      0,
      30,
      0x00ff00
    );
    this.progressBar.setScrollFactor(0);
    this.progressBar.setDepth(53);
    this.progressBar.setOrigin(0, 0.5);

    // Set up input for cleaning
    this.input.on("pointermove", this.updateCleaningCloth, this);
    this.input.on("pointerdown", this.startCleaning, this);
    this.input.on("pointerup", this.stopCleaning, this);
  }

  updateCleaningCloth(pointer) {
    if (this.cleaningCloth) {
      this.cleaningCloth.x = pointer.x;
      this.cleaningCloth.y = pointer.y;

      // If actively cleaning, update progress
      if (this.cleaning) {
        this.updateCleaningProgress(pointer.x, pointer.y);
      }
    }
  }

  updateCleaningProgress(x, y) {
    // Check if pointer is over the ball
    const distance = Phaser.Math.Distance.Between(
      x,
      y,
      this.rustyBallDisplay.x,
      this.rustyBallDisplay.y
    );

    if (distance < 75) {
      // Update cleaning timer
      const currentTime = this.time.now;
      if (this.lastCleaningTime > 0) {
        const deltaTime = (currentTime - this.lastCleaningTime) / 1000; // Convert to seconds
        this.cleaningTimer += deltaTime;

        // Update progress based on time
        this.cleaningProgress = Math.min(
          1,
          this.cleaningTimer / this.cleaningNeeded
        );

        // Update progress bar
        const width = this.cleaningProgress * 300;
        this.progressBar.width = width;

        // Gradually fade out the rusty ball as cleaning progresses
        this.rustyBallDisplay.setAlpha(1 - this.cleaningProgress);

        // Check if cleaning is complete
        if (this.cleaningProgress >= 1) {
          this.finishCleaning();
        }
      }

      this.lastCleaningTime = currentTime;
    }
  }

  startCleaning(pointer) {
    if (!this.cleaningMode) return;

    // Check if pointer is over the ball
    const distance = Phaser.Math.Distance.Between(
      pointer.x,
      pointer.y,
      this.rustyBallDisplay.x,
      this.rustyBallDisplay.y
    );

    if (distance < 75) {
      // If within the ball radius
      this.cleaning = true;

      // Play cleaning sound only when actually cleaning starts
      if (this.cleaningSound && !this.cleaningSound.isPlaying) {
        this.cleaningSound.play({ loop: true });
      }

      // Start updating progress
      this.updateCleaningProgress(pointer.x, pointer.y);
    }
  }

  stopCleaning() {
    this.cleaning = false;
    if (this.cleaningSound && this.cleaningSound.isPlaying) {
      this.cleaningSound.stop();
    }

    // Store the last cleaning time to pause progress
    this.lastCleaningTime = 0;
  }

  finishCleaning() {
    // Stop cleaning
    this.stopCleaning();

    // Hide the rusty ball and show the true ball
    this.rustyBallDisplay.setVisible(false);
    this.trueBallDisplay.setVisible(true);

    // Skip the "click to see" step and go directly to ball preview
    this.showBallPreview();
  }

  // Updated ball preview with better message spacing
  showBallPreview() {
    // Clear previous elements
    if (this.cleaningText) this.cleaningText.destroy();
    if (this.progressBarBackground) this.progressBarBackground.destroy();
    if (this.progressBar) this.progressBar.destroy();
    if (this.cleaningCloth) this.cleaningCloth.destroy();

    // Create new preview with adjusted positions
    const previewX = this.cameras.main.width / 2;
    const previewY = this.cameras.main.height / 2;

    this.popupPanel.setDisplaySize(500, 470);

    // Show the cleaned ball
    this.trueBallDisplay.setPosition(previewX, previewY - 50); // Moved up to make room for message
    this.trueBallDisplay.setDisplaySize(150, 150);
    this.trueBallDisplay.setDepth(52);

    // Add title - use the mapping for proper names
    const ballName =
      this.ballNameMap[this.currentBall.trueBallType] ||
      this.currentBall.trueBallType
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    this.ballTitle = this.add.text(
      previewX,
      previewY - 180, // Moved up to make room for message
      `Tu radai: ${ballName}!`,
      {
        font: "bold 20px Orbitron", // Adjusted for higher zoom
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      }
    );
    this.ballTitle.setOrigin(0.5);
    this.ballTitle.setScrollFactor(0);
    this.ballTitle.setDepth(52);

    // Add description if the ball has a message
    if (this.currentBall.message) {
      this.ballDescription = this.add.text(
        previewX,
        previewY + 170, // Adjusted position
        this.currentBall.message,
        {
          font: "16px Orbitron",
          fill: "#ffffff",
          align: "center",
          wordWrap: { width: 400 },
          padding: { top: 20, bottom: 20 }, // Added padding
        }
      );
      this.ballDescription.setOrigin(0.5);
      this.ballDescription.setScrollFactor(0);
      this.ballDescription.setDepth(52);
    }

    // Add collect button
    this.collectButton = this.add.text(
      previewX,
      previewY + 100, // Adjusted position
      "Prideti prie kolekcijos",
      {
        font: "bold 20px Orbitron", // Adjusted for higher zoom
        fill: "#ffffff",
        backgroundColor: "#4a6c2a",
        padding: { x: 20, y: 10 },
      }
    );
    this.collectButton.setOrigin(0.5);
    this.collectButton.setScrollFactor(0);
    this.collectButton.setDepth(52);
    this.collectButton.setInteractive({ useHandCursor: true });

    // Add hover effects and click handler
    this.collectButton.on("pointerover", () => {
      this.collectButton.setBackgroundColor("#6a8c4a");
    });

    this.collectButton.on("pointerout", () => {
      this.collectButton.setBackgroundColor("#4a6c2a");
    });

    this.collectButton.on("pointerdown", () => {
      this.collectCleanedBall();
    });
  }

  collectCleanedBall() {
    // Check if this ball type is already collected to prevent duplicates
    if (this.collectedBallTypes.has(this.currentBall.trueBallType)) {
      console.log(
        `Ball type ${this.currentBall.trueBallType} already collected, skipping`
      );
    } else {
      // Play collection sound
      if (this.ballCollectSound) {
        this.ballCollectSound.play();
      }

      // Add to inventory and mark as collected
      this.inventory.push(this.currentBall.trueBallType);
      this.collectedBallTypes.add(this.currentBall.trueBallType);

      // Update ball count
      this.ballsCollected++;
      this.updateBallCount();

      // Show message about inventory only once
      if (!this.inventoryMessageShown) {
        this.showNarratorMessage(
          "Nuvalei kamuoli ir pridejai ji prie savo kolekcijos! Paspausk I, kad pamatytum savo inventoriu."
        );
        this.inventoryMessageShown = true;
      }
    }

    // Remove the ball from the game if it's not a family ball
    if (!this.isFamilyBall) {
      this.currentBall.destroy();
    }

    // Close the popup
    this.closeCleaningPopup();

    // Check if all balls are collected
    this.checkGameCompletion();
  }

  closeCleaningPopup() {
    // Remove all popup elements
    if (this.popupBackground) this.popupBackground.destroy();
    if (this.popupPanel) this.popupPanel.destroy();

    // Remove ball preview elements if they exist
    if (this.ballTitle) this.ballTitle.destroy();
    if (this.ballDescription) this.ballDescription.destroy();
    if (this.collectButton) this.collectButton.destroy();

    // Remove cleaning elements if they still exist
    if (this.rustyBallDisplay) this.rustyBallDisplay.destroy();
    if (this.trueBallDisplay) this.trueBallDisplay.destroy();
    if (this.cleaningText) this.cleaningText.destroy();
    if (this.progressBarBackground) this.progressBarBackground.destroy();
    if (this.progressBar) this.progressBar.destroy();
    if (this.cleaningCloth) this.cleaningCloth.destroy();

    // Remove input listeners
    this.input.off("pointermove", this.updateCleaningCloth, this);
    this.input.off("pointerdown", this.startCleaning, this);
    this.input.off("pointerup", this.stopCleaning, this);

    // Reset cleaning mode
    this.cleaningMode = false;
    this.isFamilyBall = false;
    this.currentBall = null;

    // Show inventory icon again
    if (this.inventoryIcon) {
      this.inventoryIcon.setVisible(true);
    }

    // Reset the family interaction flag
    this.familyInteractionActive = false;

    // REMOVED the challenge message code from here
  }

  startBirthdateChallenge(familyMember) {
    // Clear all messages, especially challenge prompts
    this.clearAllMessages();

    // Reset the challenge prompt flag
    this.challengePromptMessage = false;

    // Reset the family interaction flag
    this.familyInteractionActive = false;

    // Check if this family member's challenge has already been completed
    if (this.completedChallenges.has(familyMember.characterKey)) {
      this.showNarratorMessage("Tu jau gavai rakta is sio seimos nario!");
      return;
    }

    this.challengeHasStarted = true;

    // Set challenge mode flag
    this.challengeMode = true;

    // Reset the current family member for challenge
    this.currentFamilyMember = null;

    // Store the family member for the challenge
    this.challengeFamilyMember = familyMember;

    // Disable player movement
    if (this.player) {
      this.player.setVelocity(0);
    }

    // Create the challenge UI
    this.createBirthdateChallengeUI(familyMember);
  }

  createBirthdateChallengeUI(familyMember) {
    // Create a semi-transparent background
    this.challengeBackground = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    );
    this.challengeBackground.setScrollFactor(0);
    this.challengeBackground.setDepth(50);

    // Create popup panel
    this.challengePanel = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "popup_background"
    );
    this.challengePanel.setScrollFactor(0);
    this.challengePanel.setDepth(51);
    this.challengePanel.setDisplaySize(600, 500);

    // Add title
    this.challengeTitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 210,
      `${familyMember.characterData.name} Gimtadieno Issukis`,
      {
        font: "bold 24px Orbitron",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      }
    );
    this.challengeTitle.setOrigin(0.5);
    this.challengeTitle.setScrollFactor(0);
    this.challengeTitle.setDepth(52);

    // Add instructions
    this.challengeInstructions = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 160,
      "Atpesk gimimo data kad gautum duru rakta!\nIvesk metus, menesi ir diena.",
      {
        font: "18px Orbitron",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      }
    );
    this.challengeInstructions.setOrigin(0.5);
    this.challengeInstructions.setScrollFactor(0);
    this.challengeInstructions.setDepth(52);

    // Add character image
    this.challengeCharacterImage = this.add.image(
      this.cameras.main.width / 2 - 200,
      this.cameras.main.height / 2 - 30,
      familyMember.characterKey
    );
    this.challengeCharacterImage.setScrollFactor(0);
    this.challengeCharacterImage.setDepth(52);
    this.challengeCharacterImage.setDisplaySize(90, 150);

    // Create input fields directly in the game
    this.createFixedBirthdateInputFields(familyMember);

    // Add submit button
    this.submitButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      "Pateikti",
      {
        font: "bold 20px Orbitron",
        fill: "#ffffff",
        backgroundColor: "#4a6c2a",
        padding: { x: 20, y: 10 },
      }
    );
    this.submitButton.setOrigin(0.5);
    this.submitButton.setScrollFactor(0);
    this.submitButton.setDepth(52);
    this.submitButton.setInteractive({ useHandCursor: true });

    // Add hover effects
    this.submitButton.on("pointerover", () => {
      this.submitButton.setBackgroundColor("#6a8c4a");
    });

    this.submitButton.on("pointerout", () => {
      this.submitButton.setBackgroundColor("#4a6c2a");
    });

    // Add click handler
    this.submitButton.on("pointerdown", () => {
      this.checkBirthdateChallenge(familyMember);
    });

    // Add cancel button
    this.cancelButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 160,
      "Atsaukti",
      {
        font: "bold 18px Orbitron",
        fill: "#ffffff",
        backgroundColor: "#8b0000",
        padding: { x: 15, y: 8 },
      }
    );
    this.cancelButton.setOrigin(0.5);
    this.cancelButton.setScrollFactor(0);
    this.cancelButton.setDepth(52);
    this.cancelButton.setInteractive({ useHandCursor: true });

    // Add hover effects
    this.cancelButton.on("pointerover", () => {
      this.cancelButton.setBackgroundColor("#ab2020");
    });

    this.cancelButton.on("pointerout", () => {
      this.cancelButton.setBackgroundColor("#8b0000");
    });

    // Add click handler
    this.cancelButton.on("pointerdown", () => {
      this.closeChallenge();
    });

    // Add result text (initially hidden)
    this.challengeResultText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      "",
      {
        font: "bold 20px Orbitron",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      }
    );
    this.challengeResultText.setOrigin(0.5);
    this.challengeResultText.setScrollFactor(0);
    this.challengeResultText.setDepth(52);
    this.challengeResultText.setVisible(false);
  }

  createFixedBirthdateInputFields(familyMember) {
    // Define positions for better alignment - moved everything up by adjusting startY
    const labelX = this.cameras.main.width / 2 - 50;
    const inputX = this.cameras.main.width / 2 + 70;
    const startY = this.cameras.main.height / 2 - 80; // Moved up from -50 to -80
    const spacing = 60; // Spacing between fields

    // Create labels directly (not in container for better positioning)
    this.yearLabel = this.add.text(labelX, startY, "Metai:", {
      font: "18px Orbitron",
      fill: "#ffffff",
    });
    this.yearLabel.setScrollFactor(0);
    this.yearLabel.setDepth(52);
    this.yearLabel.setOrigin(1, 0.5); // Right align

    this.monthLabel = this.add.text(labelX, startY + spacing, "Menesis:", {
      font: "18px Orbitron",
      fill: "#ffffff",
    });
    this.monthLabel.setScrollFactor(0);
    this.monthLabel.setDepth(52);
    this.monthLabel.setOrigin(1, 0.5); // Right align

    this.dayLabel = this.add.text(labelX, startY + spacing * 2, "Diena:", {
      font: "18px Orbitron",
      fill: "#ffffff",
    });
    this.dayLabel.setScrollFactor(0);
    this.dayLabel.setDepth(52);
    this.dayLabel.setOrigin(1, 0.5); // Right align

    // Create input fields directly (not in container)
    // Year input
    this.yearInputBg = this.add.rectangle(inputX, startY, 140, 40, 0x333333);
    this.yearInputBg.setScrollFactor(0);
    this.yearInputBg.setDepth(52);
    this.yearInputBg.setInteractive({ useHandCursor: true });

    this.yearInput = this.add.text(inputX, startY, "____", {
      font: "18px Orbitron",
      fill: "#ffffff",
    });
    this.yearInput.setOrigin(0.5);
    this.yearInput.setScrollFactor(0);
    this.yearInput.setDepth(53);

    // Month input
    this.monthInputBg = this.add.rectangle(
      inputX,
      startY + spacing,
      140,
      40,
      0x333333
    );
    this.monthInputBg.setScrollFactor(0);
    this.monthInputBg.setDepth(52);
    this.monthInputBg.setInteractive({ useHandCursor: true });

    this.monthInput = this.add.text(inputX, startY + spacing, "__", {
      font: "18px Orbitron",
      fill: "#ffffff",
    });
    this.monthInput.setOrigin(0.5);
    this.monthInput.setScrollFactor(0);
    this.monthInput.setDepth(53);

    // Day input
    this.dayInputBg = this.add.rectangle(
      inputX,
      startY + spacing * 2,
      140,
      40,
      0x333333
    );
    this.dayInputBg.setScrollFactor(0);
    this.dayInputBg.setDepth(52);
    this.dayInputBg.setInteractive({ useHandCursor: true });

    this.dayInput = this.add.text(inputX, startY + spacing * 2, "__", {
      font: "18px Orbitron",
      fill: "#ffffff",
    });
    this.dayInput.setOrigin(0.5);
    this.dayInput.setScrollFactor(0);
    this.dayInput.setDepth(53);

    // Initialize input values
    this.yearInputValue = "";
    this.monthInputValue = "";
    this.dayInputValue = "";
    this.activeInput = null;

    // Add click handlers for inputs
    this.yearInputBg.on("pointerdown", () => {
      this.activateInput("year");
    });

    this.monthInputBg.on("pointerdown", () => {
      this.activateInput("month");
    });

    this.dayInputBg.on("pointerdown", () => {
      this.activateInput("day");
    });

    // Add click handler on background to deactivate inputs
    this.challengeBackground.setInteractive();
    this.challengeBackground.on("pointerdown", () => {
      this.deactivateInput();
    });

    // Prevent event propagation from inputs to background
    this.yearInputBg.on("pointerdown", (pointer) => {
      pointer.event.stopPropagation();
    });
    this.monthInputBg.on("pointerdown", (pointer) => {
      pointer.event.stopPropagation();
    });
    this.dayInputBg.on("pointerdown", (pointer) => {
      pointer.event.stopPropagation();
    });
  }

  activateInput(inputType) {
    // Deactivate any active input first
    this.deactivateInput();

    // Set the active input
    this.activeInput = inputType;

    // Set the appropriate background color
    if (inputType === "year") {
      this.yearInputBg.setFillStyle(0x555555);
      // Start with current value or empty
      this.yearInputValue =
        this.yearInput.text !== "____" ? this.yearInput.text : "";
      // Show cursor
      this.yearInput.setText(this.yearInputValue + "▌");

      // Make sure keyboard is enabled
      this.input.keyboard.enabled = true;
      this.input.keyboard.on("keydown", this.handleKeyInput, this);
    } else if (inputType === "month") {
      this.monthInputBg.setFillStyle(0x555555);
      this.monthInputValue =
        this.monthInput.text !== "__" ? this.monthInput.text : "";
      this.monthInput.setText(this.monthInputValue + "▌");

      // Make sure keyboard is enabled
      this.input.keyboard.enabled = true;
      this.input.keyboard.on("keydown", this.handleKeyInput, this);
    } else if (inputType === "day") {
      this.dayInputBg.setFillStyle(0x555555);
      this.dayInputValue =
        this.dayInput.text !== "__" ? this.dayInput.text : "";
      this.dayInput.setText(this.dayInputValue + "▌");

      // Make sure keyboard is enabled
      this.input.keyboard.enabled = true;
      this.input.keyboard.on("keydown", this.handleKeyInput, this);
    }
  }

  deactivateInput() {
    if (!this.activeInput) return;

    // Reset all input backgrounds
    this.yearInputBg.setFillStyle(0x333333);
    this.monthInputBg.setFillStyle(0x333333);
    this.dayInputBg.setFillStyle(0x333333);

    // Format and update text based on current values
    if (this.yearInputValue === "") {
      this.yearInput.setText("____");
    } else {
      this.yearInput.setText(this.yearInputValue);
    }

    if (this.monthInputValue === "") {
      this.monthInput.setText("__");
    } else {
      this.monthInput.setText(this.monthInputValue.padStart(2, "0"));
    }

    if (this.dayInputValue === "") {
      this.dayInput.setText("__");
    } else {
      this.dayInput.setText(this.dayInputValue.padStart(2, "0"));
    }

    // Remove keyboard listener
    this.input.keyboard.off("keydown", this.handleKeyInput, this);

    // Clear active input
    this.activeInput = null;
  }

  handleKeyInput(event) {
    // Only process if we have an active input
    if (!this.activeInput) return;

    // Handle number keys
    if (/^\d$/.test(event.key)) {
      if (this.activeInput === "year") {
        if (this.yearInputValue.length < 4) {
          this.yearInputValue += event.key;
          this.yearInput.setText(this.yearInputValue + "▌");
        }
      } else if (this.activeInput === "month") {
        if (this.monthInputValue.length < 2) {
          this.monthInputValue += event.key;
          this.monthInput.setText(this.monthInputValue + "▌");
        }
      } else if (this.activeInput === "day") {
        if (this.dayInputValue.length < 2) {
          this.dayInputValue += event.key;
          this.dayInput.setText(this.dayInputValue + "▌");
        }
      }
    }
    // Handle backspace
    else if (event.key === "Backspace") {
      if (this.activeInput === "year" && this.yearInputValue.length > 0) {
        this.yearInputValue = this.yearInputValue.slice(0, -1);
        this.yearInput.setText(this.yearInputValue + "▌");
      } else if (
        this.activeInput === "month" &&
        this.monthInputValue.length > 0
      ) {
        this.monthInputValue = this.monthInputValue.slice(0, -1);
        this.monthInput.setText(this.monthInputValue + "▌");
      } else if (this.activeInput === "day" && this.dayInputValue.length > 0) {
        this.dayInputValue = this.dayInputValue.slice(0, -1);
        this.dayInput.setText(this.dayInputValue + "▌");
      }
    }
    // Handle tab to move between fields
    else if (event.key === "Tab") {
      if (this.activeInput === "year") {
        this.activateInput("month");
      } else if (this.activeInput === "month") {
        this.activateInput("day");
      } else if (this.activeInput === "day") {
        this.activateInput("year");
      }
      event.preventDefault(); // Prevent default tab behavior
    }
    // Handle enter to submit
    else if (event.key === "Enter") {
      this.deactivateInput();
      this.submitButton.emit("pointerdown");
    }
  }

  // Fixed birthdate challenge checking
  checkBirthdateChallenge(familyMember) {
    // Deactivate any active input
    this.deactivateInput();

    // Get input values
    const year = this.yearInput.text;
    const month = this.monthInput.text;
    const day = this.dayInput.text;

    // Check if any fields are empty or default
    if (year === "____" || month === "__" || day === "__") {
      this.challengeResultText.setText("Uzpildyk visus langelius!");
      this.challengeResultText.setFill("#ff6666");
      this.challengeResultText.setVisible(true);
      this.challengeResultText.y = this.cameras.main.height / 2 + 200;
      this.time.delayedCall(4000, () => {
        this.challengeResultText.setVisible(false);
      });
      return;
    }

    // Convert to numbers
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    // Compare with correct values
    const correct =
      yearNum === familyMember.characterData.birthdate.year &&
      monthNum === familyMember.characterData.birthdate.month &&
      dayNum === familyMember.characterData.birthdate.day;

    if (correct) {
      // Success!
      this.challengeResultText.setText(
        `Teisingai! Tu uzsidirbai ${familyMember.roomKey} rakta!`
      );
      this.challengeResultText.setFill("#66ff66");
      this.challengeResultText.setVisible(true);
      // Position the success message lower to avoid overlap
      this.challengeResultText.y = this.cameras.main.height / 2 + 200;

      // Add the key to the inventory
      this.keys.push(familyMember.keyType);

      // Update key count
      this.updateKeyCount();

      this.challengeHasStarted = false;

      // Mark key as collected
      familyMember.keyCollected = true;
      this.completedChallenges.add(familyMember.characterKey);

      // Close the challenge after a delay
      this.time.delayedCall(2000, () => {
        this.closeChallenge();

        // Show a confirmation message
        // Updated key received message in checkBirthdateChallenge method
        this.showNarratorMessage(
          `Gavai ${familyMember.roomKey} rakta! Dabar gali atrakinti duris.`
        );
      });
    } else {
      // Failure
      this.challengeResultText.setText(
        "Neteisinga gimimo data. Kaip cia taip? Bandyk dar karta!"
      );
      this.challengeResultText.setFill("#ff6666");
      this.challengeResultText.setVisible(true);
      this.challengeResultText.y = this.cameras.main.height / 2 + 200;
      this.time.delayedCall(4000, () => {
        this.challengeResultText.setVisible(false);
      });

      // Clear input fields
      this.yearInput.setText("____");
      this.monthInput.setText("__");
      this.dayInput.setText("__");
      this.yearInputValue = "";
      this.monthInputValue = "";
      this.dayInputValue = "";
    }
  }

  closeChallenge() {
    // Remove all challenge UI elements
    if (this.challengeBackground) this.challengeBackground.destroy();
    if (this.challengePanel) this.challengePanel.destroy();
    if (this.challengeTitle) this.challengeTitle.destroy();
    if (this.challengeInstructions) this.challengeInstructions.destroy();
    if (this.challengeCharacterImage) this.challengeCharacterImage.destroy();

    // Remove label elements
    if (this.yearLabel) this.yearLabel.destroy();
    if (this.monthLabel) this.monthLabel.destroy();
    if (this.dayLabel) this.dayLabel.destroy();

    // Remove input elements
    if (this.yearInputBg) this.yearInputBg.destroy();
    if (this.yearInput) this.yearInput.destroy();
    if (this.monthInputBg) this.monthInputBg.destroy();
    if (this.monthInput) this.monthInput.destroy();
    if (this.dayInputBg) this.dayInputBg.destroy();
    if (this.dayInput) this.dayInput.destroy();

    if (this.submitButton) this.submitButton.destroy();
    if (this.cancelButton) this.cancelButton.destroy();
    if (this.challengeResultText) this.challengeResultText.destroy();

    // Reset challenge mode
    this.challengeMode = false;
    this.challengeFamilyMember = null;

    // Remove any keyboard listeners
    this.input.keyboard.off("keydown", this.handleKeyInput, this);
  }

  checkDoorInteraction() {
    // Skip if in cleaning, inventory, or challenge mode
    if (this.cleaningMode || this.inventoryMode || this.challengeMode) return;

    // Skip if player doesn't exist
    if (!this.player) return;

    // IMMEDIATE CHECK: First check if we're near ANY open door
    let nearOpenDoor = false;
    this.doorInteractionAreas.forEach((door) => {
      if (door.isOpen) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          door.x,
          door.y
        );
        if (distance < this.interactionDistance) {
          nearOpenDoor = true;
        }
      }
    });

    // If near any open door, immediately clear all door messages and exit
    if (nearOpenDoor) {
      // Only clear if we're actually showing a door message
      if (this.doorMessageActive) {
        this.clearAllMessages();
      }
      return; // Skip all other door checks
    }

    // Find the closest closed door
    let nearClosedDoor = false;
    let closestDoor = null;
    let closestDistance = Infinity;
    let showDoorPromptMessage = false;

    // Check all door interaction areas - ONLY for closed doors
    this.doorInteractionAreas.forEach((door) => {
      if (!door.isOpen) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          door.x,
          door.y
        );

        if (distance < this.interactionDistance && distance < closestDistance) {
          nearClosedDoor = true;
          closestDoor = door;
          closestDistance = distance;
        }

        if (distance <= 64) {
          const requiredKey = door.requiredKey;

          // Special case for auto-unlockable doors
          if (requiredKey === "Auto Key" || requiredKey === "none") {
            showDoorPromptMessage = true;
          }
          // Regular doors - only show prompt if we have the key
          else if (this.keys.includes(requiredKey)) {
            // For closet door, check balls collected
            if (door.targetRoom === "Spintos" && this.ballsCollected >= 20) {
              showDoorPromptMessage = true;
            }
            // For normal doors with key
            else if (door.targetRoom !== "Spintos") {
              showDoorPromptMessage = true;
            }
          }
        }
        if (distance > 64) {
          this.clearDoorPromptOnly();
        }
      }
    });

    // If not near any closed door, clear door prompt
    if (!nearClosedDoor) {
      this.clearDoorPromptOnly();
    }

    // Show door prompt message when within 64 pixels of a locked door AND we have the key
    if (showDoorPromptMessage) {
      this.showDoorPrompt("Paspausk E, kad atidarytum duris");
    }

    // If near a closed door, check if we have the required key
    if (nearClosedDoor && closestDoor) {
      const requiredKey = closestDoor.requiredKey;
      const isClosetDoor = closestDoor.targetRoom === "Spintos";

      // Check for interaction key press
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        // Check if door is special - automatically unlocked
        if (requiredKey === "Auto Key" || requiredKey === "none") {
          this.openDoor(closestDoor);
        }
        // Check if this door requires a key and if we have it
        else if (this.keys.includes(requiredKey)) {
          // For closet door, check if player has collected at least 20 balls
          if (isClosetDoor && this.ballsCollected < 20) {
            this.showNarratorMessage(
              "Tau reikia surinkti bent 20 kamuoliu, kad galetum ieiti i spinta!"
            );
          } else {
            // Normal door or closet door with enough balls
            this.openDoor(closestDoor);
          }
        }
        // If we don't have the required key, show the locked message
        else {
          this.showDoorPrompt(
            `Sios durys uzrakintos. Tau reikia ${closestDoor.targetRoom} rakto.`
          );
        }
      }
    }
  }

  // New method to show door prompts specifically
  showDoorPrompt(message) {
    console.log("showDoorPrompt DEBUG | Attempting to show message:", message);

    // Clear any existing door message
    this.clearAllMessages();

    // Create a semi-transparent background with extreme depth
    this.doorPromptBox = this.add.rectangle(
      this.cameras.main.width / 2,
      120,
      600,
      120,
      0x000000,
      0.8
    );
    this.doorPromptBox.setScrollFactor(0);
    this.doorPromptBox.setDepth(1000); // Extremely high depth

    // Add text with even higher depth
    this.doorPromptBox = this.add.text(
      this.cameras.main.width / 2,
      320, // Centered in the box
      message,
      {
        font: "bold 20px Orbitron",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
        wordWrap: { width: 550 },
      }
    );
    this.doorPromptBox.setOrigin(0.5, 0.5); // Center text in box
    this.doorPromptBox.setScrollFactor(0);
    this.doorPromptBox.setDepth(1001); // Even higher depth

    // Mark that we're showing a door message
    this.doorMessageActive = true;

    // Auto-hide after 5 seconds with a timer we can reference
    this.doorMessageTimer = this.time.delayedCall(5000, () => {
      this.clearDoorPromptOnly();
    });
  }

  // New method to clear ALL messages (both door and narrator)
  clearAllMessages() {
    // Clear door prompt elements
    if (this.doorPromptBox) {
      this.doorPromptBox.destroy();
      this.doorPromptBox = null;
    }

    if (this.doorPromptText) {
      this.doorPromptText.destroy();
      this.doorPromptText = null;
    }

    if (this.doorMessageTimer) {
      this.time.removeEvent(this.doorMessageTimer);
      this.doorMessageTimer = null;
    }

    // Clear narrator elements
    if (this.NarratorBox) {
      this.NarratorBox.destroy();
      this.NarratorBox = null;
    }

    if (this.NarratorText) {
      this.NarratorText.destroy();
      this.NarratorText = null;
    }

    if (this.narratorTimer) {
      this.time.removeEvent(this.narratorTimer);
      this.narratorTimer = null;
    }

    // Reset all message flags
    this.doorMessageActive = false;
    this.isShowingNarratorMessage = false;
    this.isShowingDoorPrompt = false;
  }

  // Fixed clearDoorPromptOnly method with proper null checks
  clearDoorPromptOnly() {
    // Only try to destroy elements if they exist
    if (this.doorPromptBox) {
      this.doorPromptBox.destroy();
      this.doorPromptBox = null;
    }

    if (this.doorPromptText) {
      this.doorPromptText.destroy();
      this.doorPromptText = null;
    }

    // Clear any existing timer
    if (this.doorMessageTimer) {
      this.time.removeEvent(this.doorMessageTimer);
      this.doorMessageTimer = null;
    }

    // Reset the flag
    this.doorMessageActive = false;
  }

  addFirstBallToCloset() {
    // Mark as added so we only do this once
    this.closetBallAdded = true;

    // Create the first ball (super rare) at the specified coordinates
    const firstBall = this.superRareBall.create(
      672, // Updated X position as requested
      416, // Updated Y position as requested
      "super_rare_rusty_ball_first" // Use the super rare rusty ball texture
    );

    // Set size for super rare ball using dimensions object
    firstBall.displayWidth = this.objectDimensions.superRareBall.width;
    firstBall.displayHeight = this.objectDimensions.superRareBall.height;

    firstBall.trueBallType = "first_ball";
    firstBall.setDepth(1);
    firstBall.message =
      "Nuo sitos dovanos viskas ir prasidejo - pirmasis kamuoliukas tavo kolekcijoje. Kokia ilga ir neipatinga kelione mes visi patyreme!";

    // Add some visual effects to make it special
    this.tweens.add({
      targets: firstBall,
      y: firstBall.y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add glow effect
    firstBall.preFX.addGlow(0xffffff, 5, 0, false, 0.1, 16);

    console.log(
      `Added first ball to closet at (${firstBall.x}, ${firstBall.y})`
    );

    // Add overlap detection with player for this ball
    if (this.player) {
      this.physics.add.overlap(
        this.player,
        this.superRareBall,
        this.startBallCleaning,
        null,
        this
      );
    }
  }

  checkGameCompletion() {
    // Check if all balls have been collected
    if (this.ballsCollected >= this.totalBalls) {
      // Show completion message
      // Updated game completed message in checkGameCompletion method
      this.showNarratorMessage(
        "Sveikinu! Surinkai visus 21 kamuolius ir uzbaigei savo kolekcija!"
      );

      // Wait a moment before showing the end screen
      this.time.delayedCall(3000, () => {
        // Stop the music
        if (this.backgroundMusic) {
          this.backgroundMusic.stop();
        }

        // Show end game screen
        this.showEndGameScreen();
      });
    }
  }

  // Improved end game screen with better animation and darkening
  showEndGameScreen() {
    document.getElementById('game-ui')?.remove();
    // Create a dark overlay with animation
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0
    );
    overlay.setScrollFactor(0);
    overlay.setDepth(40);

    // Animate the darkening effect
    this.tweens.add({
      targets: overlay,
      alpha: 0.95,
      duration: 1500,
      onComplete: () => {
        this.showEndGameContent();
      },
    });
  }

  showEndGameContent() {
    // Add congratulatory text in the center
    const congratsText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 150, // Centered
      "Kolekcija Uzbaigta!",
      {
        font: "bold 36px Orbitron",
        fill: "#ffffff",
        align: "center",
        stroke: "#000000",       // Black stroke color
        strokeThickness: 3,      // Stroke thickness
      }
    );
    congratsText.setOrigin(0.5);
    congratsText.setScrollFactor(0);
    congratsText.setDepth(100);
    congratsText.setAlpha(0);

    // Animate the text appearing
    this.tweens.add({
      targets: congratsText,
      alpha: 1,
      duration: 1500,
      delay: 500,
    });

    // Add a heartfelt message
    const messageText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50, // Centered
      "Teti, tavo kamuoliuku kolekcija mus lydejo visa musu gyvenima, ir mes visi dziaugiames, kad turime toki idomu teti kaip tu.\nSu gimtadieniu!\nMes tave labai stipriai mylime!",
      {
        font: "20px Orbitron",
        fill: "#ffffff",
        align: "center",
        stroke: "#000000",       // Black stroke color
        strokeThickness: 3,      // Stroke thickness
        wordWrap: { width: 800 },
      }
    );
    messageText.setOrigin(0.5);
    messageText.setScrollFactor(0);
    messageText.setDepth(100);
    messageText.setAlpha(0);

    // Animate the message appearing
    this.tweens.add({
      targets: messageText,
      alpha: 1,
      duration: 1000,
      delay: 1500,
    });

    // Create a grid to display all the collected balls
    const gridStartX = this.cameras.main.width / 2 - 370;
    const gridStartY = this.cameras.main.height / 2 - 160;
    const ballSize = 70;
    const padding = 140;

    // Display each ball in the inventory with animation
    for (let i = 0; i < this.inventory.length; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;

      const x = gridStartX + col * (ballSize + padding);
      const y = gridStartY + row * (ballSize + padding);

      const ball = this.add.image(x, y, this.inventory[i]);
      ball.setScrollFactor(0);
      ball.setDepth(41);
      ball.setAlpha(0);
      ball.setScale(0.1);

      // Set fixed size for display balls
      ball.displayWidth = ballSize;
      ball.displayHeight = ballSize;

      // Add a pop-in animation for each ball
      this.tweens.add({
        targets: ball,
        alpha: 1,
        scale: 1,
        duration: 500,
        delay: 2000 + i * 100,
        ease: "Back.out",
      });

      // Add a subtle shine effect to each ball
      this.tweens.add({
        targets: ball,
        alpha: { from: 0.9, to: 1 },
        scale: { from: 0.95, to: 1.05 },
        duration: 1000,
        delay: 2500 + i * 100,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }

// Create DOM restart button
  this.createDOMRestartButton();
}

// Add this new method to create a DOM restart button
createDOMRestartButton() {
  console.log("Creating DOM restart button");
  
  // Remove any existing button
  const existingButton = document.getElementById('restart-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'restart-button';
  buttonContainer.style.position = 'absolute';
  buttonContainer.style.bottom = '350px';
  buttonContainer.style.left = '50%';
  buttonContainer.style.transform = 'translateX(-50%)';
  buttonContainer.style.width = '420px';
  buttonContainer.style.height = '100px';
  buttonContainer.style.background = '#FFFFFF';
  buttonContainer.style.borderRadius = '10px';
  buttonContainer.style.cursor = 'pointer';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.alignItems = 'center';
  buttonContainer.style.color = 'black';
  buttonContainer.style.fontFamily = 'Orbitron, sans-serif';
  buttonContainer.style.fontSize = '40px';
  buttonContainer.style.fontWeight = 'bold';
  buttonContainer.style.zIndex = '2000';
  buttonContainer.style.opacity = '0';
  buttonContainer.style.transition = 'opacity 1s, transform 0.2s';
  buttonContainer.textContent = 'GRIZTI I PRADZIA';
  
  // Add hover effects
  buttonContainer.addEventListener('mouseover', () => {
    buttonContainer.style.transform = 'translateX(-50%) scale(1.05)';
    buttonContainer.style.background = '#FFFFFF';
  });
  
  buttonContainer.addEventListener('mouseout', () => {
    buttonContainer.style.transform = 'translateX(-50%) scale(1.0)';
    buttonContainer.style.background = '#FFFFFF';
  });
  
  // Add click handler
  buttonContainer.addEventListener('click', () => {
    console.log("DOM restart button clicked");
    
    // Remove the button before changing scenes
    buttonContainer.remove();
    
    // Start the Start scene with completed game data
    this.scene.start("Start", {
      completedGame: true,
      collectedBalls: this.inventory,
    });
  });
  
  // Add to document
  document.body.appendChild(buttonContainer);
  
  // Animate button appearing after a delay
  setTimeout(() => {
    buttonContainer.style.opacity = '1';
  }, 3000);
  
  console.log("DOM restart button created");
}

  update() {
    // Skip update if game is paused
    if (this.gamePaused) return;

    // Handle player movement
    this.handlePlayerMovement();

    // Update light mask position to follow player
    if (this.lightContainer && this.player) {
      this.lightContainer.setPosition(this.player.x, this.player.y);
    }

    // Check for door interaction
    this.checkDoorInteraction();

    // Check for inventory key press
    if (
      this.inventoryKey &&
      Phaser.Input.Keyboard.JustDown(this.inventoryKey)
    ) {
      this.showInventory();
    }

    // Check for challenge activation
    if (
      this.currentFamilyMember &&
      this.challengeActivationKey &&
      Phaser.Input.Keyboard.JustDown(this.challengeActivationKey)
    ) {
      this.startBirthdateChallenge(this.currentFamilyMember);
    }
  }

  handlePlayerMovement() {
    // Don't move if cleaning a ball
    if (
      this.cleaningMode ||
      this.inventoryMode ||
      this.challengeMode ||
      this.playerFrozen
    ) {
      this.player.setVelocity(0);
      return;
    }

    // Get cursor input
    const cursors = this.cursors;
    if (!cursors) return;

    // Calculate base speed
    let currentSpeed = this.playerSpeed;

    // Check if player is on stairs to apply slowdown
    let onStairs = false;
    if (this.stairsLayer) {
      onStairs = this.physics.overlap(this.player, this.stairsLayer);
    }

    // Apply stairs slowdown if needed
    if (onStairs) {
      currentSpeed *= this.stairsSlowdown;
    }

    // Reset velocity
    this.player.setVelocity(0);

    // Apply movement based on cursor keys
    if (cursors.left.isDown) {
      this.player.setVelocityX(-currentSpeed);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(currentSpeed);
    }

    if (cursors.up.isDown) {
      this.player.setVelocityY(-currentSpeed);
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(currentSpeed);
    }

    // Normalize diagonal movement
    if (
      (cursors.left.isDown || cursors.right.isDown) &&
      (cursors.up.isDown || cursors.down.isDown)
    ) {
      this.player.body.velocity.normalize().scale(currentSpeed);
    }
  }

  // Add this to your create() method after setting up other key inputs
createDebugKeys() {
  console.log("Setting up debug keys");
  
  // Add key for instant game completion (G key)
  this.completeGameKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.G
  );
  
  // Add event listener for the key
  this.completeGameKey.on('down', this.debugCompleteGame, this);
}

// Add this as a new method in your MainGame class
debugCompleteGame() {
  console.log("Debug: Completing game instantly");
  
  // Define all ball types that should be in the inventory
  const allBallTypes = [
    "football", "boob", "bowling", "cents", "plasma", 
    "disco", "massage", "rubber", "letters", "magnetic", 
    "moon", "rubics", "screws", "sphero", "electric", 
    "yoga", "family_me", "family_middle_brother", 
    "family_youngest_brother", "mom_family", "first_ball"
  ];
  
  // Clear existing inventory and collected sets
  this.inventory = [];
  this.collectedBallTypes = new Set();
  
  // Add all balls to inventory and mark as collected
  allBallTypes.forEach(ballType => {
    this.inventory.push(ballType);
    this.collectedBallTypes.add(ballType);
  });
  
  // Set ball count to total
  this.ballsCollected = this.totalBalls;
  
  // Update UI if needed
  this.updateBallCount();
  
  // Show a message
  this.showNarratorMessage("Debug mode: All balls collected!");
  
  // Trigger game completion
  this.checkGameCompletion();
}
}
