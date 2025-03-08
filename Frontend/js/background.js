// Create canvas for hexagon background
const createHexBackground = () => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background-color: black;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Hexagon properties
    const hexSize = 30;
    const hexHeight = hexSize * Math.sqrt(3);
    const hexWidth = hexSize * 2;
    const hexVertical = hexHeight * 0.75;
    
    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Draw a single hexagon
    const drawHexagon = (x, y, size) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const xPos = x + size * Math.cos(angle);
            const yPos = y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(xPos, yPos);
            } else {
                ctx.lineTo(xPos, yPos);
            }
        }
        ctx.closePath();
    };

    // Animation loop
    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Calculate grid dimensions
        const cols = Math.ceil(width / (hexWidth * 0.75)) + 1;
        const rows = Math.ceil(height / hexVertical) + 1;
        
        // Draw hexagon grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * hexWidth * 0.75;
                const y = row * hexVertical + (col % 2 === 0 ? 0 : hexHeight / 2);
                
                // Calculate distance from mouse
                const dx = x - mouseX;
                const dy = y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Set hexagon style based on mouse distance
                const maxDistance = 200;
                const opacity = Math.max(0, 1 - distance / maxDistance);
                
                if (opacity > 0) {
                    // Brighter blue color with higher opacity
                    ctx.strokeStyle = `rgba(30, 144, 255, ${opacity * 0.8})`; // Dodger Blue
                    ctx.fillStyle = `rgba(30, 144, 255, ${opacity * 0.2})`; // Lighter fill
                    ctx.lineWidth = 2; // Slightly thicker lines
                    
                    drawHexagon(x, y, hexSize);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    };

    // Start animation
    animate();
};

// Initialize background when DOM is loaded
document.addEventListener('DOMContentLoaded', createHexBackground); 