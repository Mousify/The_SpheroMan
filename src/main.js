// Import scene classes
import { Start } from './scenes/Start.js';
import { MainGame } from './scenes/MainGame.js';

// Make sure Phaser is loaded before configuring the game
document.addEventListener('DOMContentLoaded', () => {
    // Check if Phaser is available
    if (typeof Phaser === 'undefined') {
        console.error('Phaser is not loaded! Check your script imports.');
        return;
    }

    // Game configuration
    const config = {
        type: Phaser.AUTO,
        title: 'The Rusty Ball Quest',
        description: 'A nostalgic ball collection adventure',
        parent: 'game-container',
        width: 1920,
        height: 1080,
        backgroundColor: '#000000',
        pixelArt: false,
        scene: [
            Start,
            MainGame
        ],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        }
    };

    // Initialize the game
    new Phaser.Game(config);
});