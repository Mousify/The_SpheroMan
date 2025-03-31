export class Start extends Phaser.Scene {
  constructor() {
    super("Start")
    this.balls = []
    this.collectionOpen = false
  }

  preload() {
    // Load UI assets
    this.load.image("start-button", "assets/ui/start_button.png")
    this.load.image("inventory-icon", "assets/ui/inventory_icon.png")
    this.load.image("inventory-frame", "assets/ui/inventory_frame.png")
    this.load.image("popup-background", "assets/ui/popup_background.png")

    // Load rusty ball images
    this.load.image("rusty-ball-common", "assets/rustyballs/rusty_ball_common.png")
    this.load.image("rusty-ball-family", "assets/rustyballs/rusty_ball_family.png")
    this.load.image("rusty-ball-first", "assets/rustyballs/super_rare_rusty_ball_first.png")

    // Load audio
    this.load.audio("background-music", "assets/audio/background_music_start.mp3")

    // Load web font
      this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    )
  }

  create(data) {
    console.log("Start scene create method called with data:", data || "No data");
    
    // Clear any existing textures to prevent conflicts
    if (this.textures.exists('gradient-bg')) {
      console.log("Removing existing gradient-bg texture");
      this.textures.remove('gradient-bg');
    }
    
    // Load game fonts
    this.loadGameFonts()

    // Create custom background
    this.createCustomBackground()

    // Play background music with loop
    try {
      this.backgroundMusic = this.sound.add("background-music", {
        volume: 0.6,
        loop: true,
      })
      this.backgroundMusic.play()
    } catch (error) {
      console.log("Background music could not be loaded:", error)
    }

    // Create a container for all UI elements
    this.uiContainer = this.add.container(0, 0)

    // Add bouncing balls
    this.createBouncingBalls()

    // Title text with shadow and glow effect
    const titleText = this.add
      .text(960, 200, "THE SPHERO-MAN", {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "72px",
        fontStyle: "bold",
        color: "#FFD700",
        stroke: "#8B4513",
        strokeThickness: 8,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: "#000",
          blur: 10,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
    this.uiContainer.add(titleText)

    // Subtitle
    const subtitleText = this.add
      .text(960, 330, "Kelione per prisiminimus", {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "40px",
        fontStyle: "italic",
        color: "#E6E6FA",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
    this.uiContainer.add(subtitleText)

    // Game description
    const descriptionText = this.add
      .text(
        960,
        750,
        "Sitas zaidimas yra skirtas tau teti\ntavo 45 gimtadieno progra, tikiuosi kad pasimegausi kiekviena sekunde",
        {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "40px",
          color: "#FFFFFF",
          align: "center",
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5)
    this.uiContainer.add(descriptionText)

    // Create start button
    try {
      const startButton = this.add
        .image(960, 500, "start-button")
        .setScale(1)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          startButton.setScale(1.05)
        })
        .on("pointerout", () => {
          startButton.setScale(1)
        })
        .on("pointerdown", () => {
          this.tweens.add({
            targets: startButton,
            scale: 0.95,
            duration: 100,
            yoyo: true,
            onComplete: () => {
              this.cameras.main.fadeOut(1000, 0, 0, 0)
              this.cameras.main.once("camerafadeoutcomplete", () => {
                if (this.backgroundMusic) this.backgroundMusic.stop()
                this.scene.start("MainGame")
              })
            },
          })
        })

      this.uiContainer.add(startButton)
    } catch (error) {
      console.log("Using fallback button:", error)
      this.createFallbackButton()
    }

    // Add collection button
    this.createCollectionButton()

    // Version info
    const versionText = this.add.text(20, 1060, "v1.0.0", {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: "16px",
      color: "#CCCCCC",
    })
    this.uiContainer.add(versionText)

    // Credits text
    const creditsText = this.add
      .text(1900, 1060, "Gimtadienio Dovana Teciui", {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "16px",
        color: "#CCCCCC",
      })
      .setOrigin(1, 0)
    this.uiContainer.add(creditsText)

    // Title animation
    this.tweens.add({
      targets: titleText,
      y: 180,
      duration: 3000,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    })

    // Create collection panel (initially hidden)
    this.createCollectionPanel()

    // Handle completed game data if provided
    if (data && data.completedGame) {
      console.log("Game completed, showing collection");
      this.showCollection(data.collectedBalls || []);
    }

    // Fade in the scene
    this.cameras.main.fadeIn(1500, 0, 0, 0)
  }

  loadGameFonts() {
    // Use WebFontLoader to load custom fonts
    if (window.WebFont) {
      window.WebFont.load({
        google: {
          families: ["Orbitron:700", "Exo 2:400,700", "Audiowide"],
        },
        active: () => {
          console.log("Fonts loaded successfully")
        },
        inactive: () => {
          console.log("Font loading failed, using fallbacks")
        },
      })
    }
  }

  createCustomBackground() {
    console.log("Creating custom background");
    
    // Check if the texture already exists and destroy it if needed
    if (this.textures.exists('gradient-bg')) {
      console.log("Texture 'gradient-bg' already exists, removing it");
      this.textures.remove('gradient-bg');
    }
    
    try {
      // Create a gradient background with neon grid
      const gradientCanvas = document.createElement('canvas');
      gradientCanvas.width = 1920;
      gradientCanvas.height = 1080;
      
      // Make sure the canvas is valid before proceeding
      if (!gradientCanvas) {
        console.error("Failed to create canvas element");
        this.createFallbackBackground();
        return;
      }
      
      const ctx = gradientCanvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context from canvas");
        this.createFallbackBackground();
        return;
      }

      // Create a gradient from dark purple to black
      const gradient = ctx.createLinearGradient(0, 0, 1920, 1080)
      gradient.addColorStop(0, "#1a0033") // Dark purple
      gradient.addColorStop(1, "#000011") // Very dark blue

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1920, 1080)

      // Add neon grid lines
      ctx.lineWidth = 2

      // Horizontal lines (cyan)
      ctx.strokeStyle = "#00FFFF"
      for (let y = 0; y < 1080; y += 100) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(480, y + 50 * Math.sin(y / 200), 1440, y - 50 * Math.sin(y / 200), 1920, y)
        ctx.stroke()
      }

      // Vertical lines on the left side (cyan)
      for (let x = 0; x < 960; x += 150) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.bezierCurveTo(x + 50 * Math.sin(x / 200), 270, x - 50 * Math.sin(x / 200), 810, x, 1080)
        ctx.stroke()
      }

      // Vertical lines on the right side (purple)
      ctx.strokeStyle = "#FF00FF" // Magenta/purple
      for (let x = 960; x < 1920; x += 150) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.bezierCurveTo(x - 50 * Math.sin(x / 200), 270, x + 50 * Math.sin(x / 200), 810, x, 1080)
        ctx.stroke()
      }

      // Create texture from canvas
      this.textures.addCanvas('gradient-bg', gradientCanvas);
      
      // Use our custom background
      this.backgroundFar = this.add.image(960, 540, "gradient-bg");
      
      console.log("Custom background created successfully");
    } catch (error) {
      console.error("Error creating custom background:", error);
      this.createFallbackBackground();
    }
  }

  createFallbackBackground() {
    console.log("Creating fallback background");
    
    // Create a simple gradient background as fallback
    const background = this.add.graphics();
    background.fillGradientStyle(0x1a0033, 0x1a0033, 0x000011, 0x000011, 1);
    background.fillRect(0, 0, 1920, 1080);
    
    // Add some simple grid lines
    background.lineStyle(2, 0x00FFFF, 0.5);
    for (let y = 0; y < 1080; y += 100) {
      background.beginPath();
      background.moveTo(0, y);
      background.lineTo(1920, y);
      background.strokePath();
    }
    
    for (let x = 0; x < 1920; x += 150) {
      background.beginPath();
      background.moveTo(x, 0);
      background.lineTo(x, 1080);
      background.strokePath();
    }
    
    this.backgroundFar = background;
  }

  createBouncingBalls() {
    try {
      const BALL_SIZE = 100 // Fixed size for all balls
      const BALL_SPEED = 200
      const NUM_BALLS = 15

      // Create a group for balls with lower depth than UI
      this.balls = []

      // Ball types with different weights
      const ballTypes = [
        { key: "rusty-ball-common", weight: 5 },
        { key: "rusty-ball-family", weight: 2 },
        { key: "rusty-ball-first", weight: 1 },
      ]

      // Set the depth for the background (must be higher than backgroundFar but lower than UI)
      const BALL_DEPTH = 10 // Higher than background (which is default 0), but lower than UI elements

      for (let i = 0; i < NUM_BALLS; i++) {
        // Weighted random selection
        const totalWeight = ballTypes.reduce((sum, type) => sum + type.weight, 0)
        const random = Math.random() * totalWeight
        let selectedType = ballTypes[0].key

        for (let j = 0, weightSum = 0; j < ballTypes.length; j++) {
          weightSum += ballTypes[j].weight
          if (random <= weightSum) {
            selectedType = ballTypes[j].key
            break
          }
        }

        // Random position
        const x = Phaser.Math.Between(BALL_SIZE, 1920 - BALL_SIZE)
        const y = Phaser.Math.Between(BALL_SIZE, 1080 - BALL_SIZE)

        // Create the ball sprite
        const ball = this.physics.add.sprite(x, y, selectedType)

        // Scale to fixed size
        const scale = BALL_SIZE / ball.width
        ball.setScale(scale).setAlpha(0.8).setBounce(1).setCollideWorldBounds(true)

        // Random velocity
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
        ball.setVelocity(BALL_SPEED * Math.cos(angle), BALL_SPEED * Math.sin(angle))

        // Add rotation
        ball.setAngularVelocity(Phaser.Math.FloatBetween(-90, 90))

        // Set depth to be behind UI elements
        ball.setDepth(BALL_DEPTH)

        this.balls.push(ball)
      }

      // Make sure UI elements are in front by setting their depth higher
      if (this.uiContainer) {
        this.uiContainer.setDepth(20);
      }
    } catch (error) {
      console.log("Error creating bouncing balls:", error)
    }
  }

  createFallbackButton() {
    // Fallback button with similar effects
    const startButton = this.add
      .text(960, 500, "PRADEK ZAIDIMA", {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "36px",
        fontWeight: "bold",
        color: "#FFFFFF",
        backgroundColor: "#8B4513",
        padding: {
          x: 40,
          y: 20,
        },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000",
          blur: 5,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        startButton.setScale(1.1)
      })
      .on("pointerout", () => {
        startButton.setScale(1)
      })
      .on("pointerdown", () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once("camerafadeoutcomplete", () => {
          if (this.backgroundMusic) this.backgroundMusic.stop()
          this.scene.start("MainGame")
        })
      })
    this.uiContainer.add(startButton)
  }

  createCollectionButton() {
    try {
      // Collection button in the top right
      const collectionButton = this.add.container(1800, 100)

      // Button background (circular)
      const buttonCircle = this.add.circle(0, 0, 30, 0x333333, 0.7)
      buttonCircle.setStrokeStyle(2, 0xffd700)

      // Button icon
      const collectionIcon = this.add.image(0, 0, "inventory-icon").setScale(0.3) // Reduced size

      // Add elements to button container
      collectionButton.add(buttonCircle)
      collectionButton.add(collectionIcon)

      // Make the entire icon interactive
      collectionIcon
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          buttonCircle.setFillStyle(0x555555, 0.4)
          collectionIcon.setScale(0.35)
        })
        .on("pointerout", () => {
          buttonCircle.setFillStyle(0x333333, 0.4)
          collectionIcon.setScale(0.3)
        })
        .on("pointerdown", () => {
          this.toggleCollectionPanel()
        })

      this.uiContainer.add(collectionButton)
      this.collectionButton = collectionButton
    } catch (error) {
      console.log("Error creating collection button:", error)
    }
  }

  createCollectionPanel() {
    try {
      // Create panel container at screen center
      this.collectionPanel = this.add.container(960, 540)
      this.collectionPanel.setVisible(false)

      // Semi-transparent full-screen background
      const fullscreenBg = this.add.rectangle(0, 0, 1920, 1080, 0x000000, 0.7)
      this.collectionPanel.add(fullscreenBg)

      // Panel background (centered, larger size)
      const panelBg = this.add.image(0, 0, "popup-background").setScale(2.3) // Make it larger
      this.collectionPanel.add(panelBg)

      // Panel title
      const panelTitle = this.add
        .text(0, -300, "KAMUOLIUKU KOLEKCIJA", {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "48px",
          fontWeight: "bold",
          color: "#FFD700",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
      this.collectionPanel.add(panelTitle)

      // Progress text
      const progressText = this.add
        .text(0, -240, "0/21 Surinkti", {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "24px",
          marginBottom: "100px",
          color: "#CCCCCC",
        })
        .setOrigin(0.5)
      this.collectionPanel.add(progressText)
      this.progressText = progressText;

      // Create grid of ball slots (7x3 grid)
      const startX = -450 // Wider spread
      const startY = -150
      const slotSize = 111 // Larger slots
      const padding = 40

      this.ballSlots = []

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 7; col++) {
          const x = startX + col * (slotSize + padding)
          const y = startY + row * (slotSize + padding)

          // Create a shadow ball (black circle with slight glow)
          const shadowBall = this.add.circle(x, y, slotSize / 2, 0x000000, 1)
          shadowBall.setStrokeStyle(2, 0x333333)

          // Add inner shadow effect
          const innerGlow = this.add.circle(x, y - 5, slotSize / 2 - 10, 0x222222, 0.5)

          // Add highlight
          const highlight = this.add.circle(x - slotSize / 4, y - slotSize / 4, slotSize / 10, 0xffffff, 0.2)

          // Question mark
          const questionMark = this.add
            .text(x, y, "?", {
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "40px",
              fontWeight: "bold",
              color: "#AAAAAA",
            })
            .setOrigin(0.5)

          // Slot number
          const slotNumber = row * 7 + col + 1
          const numberText = this.add
            .text(x + slotSize / 3, y + slotSize / 3, slotNumber.toString(), {
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "16px",
              color: "#FFFFFF",
              backgroundColor: "#000000",
              padding: { x: 4, y: 2 },
            })
            .setOrigin(0.5)

          this.collectionPanel.add(shadowBall)
          this.collectionPanel.add(innerGlow)
          this.collectionPanel.add(highlight)
          this.collectionPanel.add(questionMark)
          this.collectionPanel.add(numberText)

          this.ballSlots.push({
            x,
            y,
            shadowBall,
            innerGlow,
            highlight,
            questionMark,
            numberText,
            collected: false,
            slotNumber,
          })
        }
      }

      // Close button (positioned at top right)
      const closeButton = this.add.circle(580, -480, 35, 0x880000, 0.8).setStrokeStyle(2, 0xffffff)

      const closeX = this.add
        .text(580, -480, "X", {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "34px",
          fontWeight: "bold",
          color: "#FFFFFF",
        })
        .setOrigin(0.5)

      closeButton
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          closeButton.setFillStyle(0xaa0000, 0.8)
        })
        .on("pointerout", () => {
          closeButton.setFillStyle(0x880000, 0.8)
        })
        .on("pointerdown", () => {
          this.toggleCollectionPanel()
        })

      this.collectionPanel.add(closeButton)
      this.collectionPanel.add(closeX)

      this.uiContainer.add(this.collectionPanel)
    } catch (error) {
      console.log("Error creating collection panel:", error)
    }
  }

  toggleCollectionPanel() {
    this.collectionOpen = !this.collectionOpen

    if (this.collectionOpen) {
      this.collectionPanel.setVisible(true)
      this.collectionPanel.setScale(0.5)
      this.collectionPanel.setAlpha(0)

      this.tweens.add({
        targets: this.collectionPanel,
        scale: 1,
        alpha: 1,
        duration: 300,
        ease: "Back.Out",
      })

      // Disable other interactions while panel is open
      if (this.collectionButton) {
        this.collectionButton.getAll()[1].disableInteractive()
      }
    } else {
      this.tweens.add({
        targets: this.collectionPanel,
        scale: 0.5,
        alpha: 0,
        duration: 300,
        ease: "Back.In",
        onComplete: () => {
          this.collectionPanel.setVisible(false)

          // Re-enable interactions
          if (this.collectionButton) {
            this.collectionButton.getAll()[1].setInteractive({ useHandCursor: true })
          }
        },
      })
    }
  }

 // New method to handle showing the collection after game completion
showCollection(collectedBalls) {
  console.log("Showing collection with balls:", collectedBalls);
  
  if (!collectedBalls || collectedBalls.length === 0) {
    console.log("No balls to display in collection");
    return;
  }
  
  // Update progress text
  if (this.progressText) {
    this.progressText.setText(`${collectedBalls.length}/21 Surinkti`);
  }
  
  // Map of ball types to slot numbers (adjust as needed based on your game's ball arrangement)
  const ballTypeToSlot = {
    "football": 1,
    "boob": 2,
    "bowling": 3,
    "cents": 4,
    "plasma": 5,
    "disco": 6,
    "massage": 7,
    "rubber": 8,
    "letters": 9,
    "magnetic": 10,
    "moon": 11,
    "rubics": 12,
    "screws": 13,
    "sphero": 14,
    "electric": 15,
    "yoga": 16,
    "family_me": 17,
    "family_middle_brother": 18,
    "family_youngest_brother": 19,
    "mom_family": 20,
    "first_ball": 21
  };
  
  // Update each slot based on collected balls
  collectedBalls.forEach(ballType => {
    const slotIndex = ballTypeToSlot[ballType] - 1;
    if (slotIndex >= 0 && slotIndex < this.ballSlots.length) {
      const slot = this.ballSlots[slotIndex];
      
      // Mark as collected
      slot.collected = true;
      
      // Hide the shadow ball, inner glow, highlight, and question mark
      if (slot.shadowBall) slot.shadowBall.setVisible(false);
      if (slot.innerGlow) slot.innerGlow.setVisible(false);
      if (slot.highlight) slot.highlight.setVisible(false);
      if (slot.questionMark) slot.questionMark.setVisible(false);
      
      // Create ball image at the exact same position
      const ballImage = this.add.image(slot.x, slot.y, ballType);
      
      // Calculate the perfect scale to match the slot size (111 is the slot size)
      const slotSize = 111;
      const scale = (slotSize * 1) / Math.max(ballImage.width, ballImage.height);
      ballImage.setScale(scale);
      
      // Add to collection panel
      this.collectionPanel.add(ballImage);
      
      // Keep the number label visible and bring it to the front
      if (slot.numberText) {
        this.collectionPanel.bringToTop(slot.numberText);
      }
      
      // Add a subtle animation to the collected ball
      this.tweens.add({
        targets: ballImage,
        scale: { from: scale * 0.9, to: scale },
        angle: { from: -5, to: 5 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  });
  
  // Show the collection panel
  if (!this.collectionOpen) {
    this.toggleCollectionPanel();
  }
}

  update() {
    // No update needed for background since we're using a static image now
  }
}