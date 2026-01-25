/**
 * Scaler.js
 * Responsible for scaling the fixed-resolution #app-root to fit the window.
 * Maintains aspect ratio and centers the content.
 */
class Scaler {
    constructor(targetId, baseWidth, baseHeight) {
        this.target = document.getElementById(targetId);
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;

        // Debounce resize
        this.resizeTimeout = null;

        if (this.target) {
            this.init();
        } else {
            console.warn(`Scaler: Target #${targetId} not found.`);
        }
    }

    init() {
        // Initial Scale
        this.applyScale();

        // Listen for Window Resize
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) cancelAnimationFrame(this.resizeTimeout);
            this.resizeTimeout = requestAnimationFrame(() => this.applyScale());
        });

        // Force opacity 1 after init to prevent FOUC (Flash of Unstyled Content)
        setTimeout(() => {
            if (this.target) this.target.style.opacity = '1';
        }, 100);
    }

    applyScale() {
        if (!this.target) return;

        // Current Window Dimensions
        // We use innerWidth/Height to account for mobile bars dynamically
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Calculate Scale ratios
        const scaleX = winW / this.baseWidth;
        const scaleY = winH / this.baseHeight;

        // "Contain" logic: fit completely visible
        const scale = Math.min(scaleX, scaleY);

        // Apply
        // We set the transform
        this.target.style.transform = `scale(${scale})`;

        // Centering is handled by CSS (flex parent), 
        // but we assume parent is Flex Center.

        // Expose scale for InputSystem
        window.GAME_SCALE = scale;

        console.log(`[Scaler] Applied Scale: ${scale.toFixed(3)} (Window: ${winW}x${winH})`);
    }
}

// Auto-init on load
window.addEventListener('DOMContentLoaded', () => {
    // 640x480 Game + ~30px Footer space = ~510px height ?
    // Let's target the exact container definition we will set in CSS.
    // Width: 640
    // Height: 520 (480 Game + 40 Footer/Margin area)
    window.scaler = new Scaler('app-root', 640, 520);
});
