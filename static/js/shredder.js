document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewCanvas = document.getElementById('previewCanvas');
    const shreddingCanvas = document.getElementById('shreddingCanvas');
    const previewContainer = document.querySelector('.preview-container');
    const shredButton = document.getElementById('shredButton');
    const resetButton = document.getElementById('resetButton');
    
    const previewCtx = previewCanvas.getContext('2d');
    const shreddingCtx = shreddingCanvas.getContext('2d');
    
    let currentImage = null;

    // Handle drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    });

    function handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please upload an image file!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                const maxWidth = 600;
                const scale = Math.min(1, maxWidth / img.width);
                
                previewCanvas.width = img.width * scale;
                previewCanvas.height = img.height * scale;
                shreddingCanvas.width = previewCanvas.width;
                shreddingCanvas.height = previewCanvas.height;
                
                previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
                dropZone.hidden = true;
                previewContainer.hidden = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function triggerConfetti() {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    }

    shredButton.addEventListener('click', async () => {
        if (!currentImage) return;
        
        const strips = 20;
        const stripWidth = previewCanvas.width / strips;
        const shredderHeight = 200; // Height of the shredder graphic
        
        // Pull animation
        const pullDuration = 1000; // 1 second
        const startTime = performance.now();
        
        function pullAnimation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / pullDuration, 1);
            
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            previewCtx.save();
            previewCtx.translate(0, progress * (-previewCanvas.height));
            previewCtx.drawImage(currentImage, 0, 0, previewCanvas.width, previewCanvas.height);
            previewCtx.restore();
            
            if (progress < 1) {
                requestAnimationFrame(pullAnimation);
            } else {
                startShredding();
            }
        }
        
        function startShredding() {
            const stripImages = [];
            for (let i = 0; i < strips; i++) {
                const stripCanvas = document.createElement('canvas');
                stripCanvas.width = stripWidth;
                stripCanvas.height = previewCanvas.height;
                const stripCtx = stripCanvas.getContext('2d');
                
                stripCtx.drawImage(
                    currentImage,
                    (i * currentImage.width) / strips, 0, currentImage.width / strips, currentImage.height,
                    0, 0, stripWidth, previewCanvas.height
                );
                
                stripImages.push({
                    canvas: stripCanvas,
                    x: i * stripWidth,
                    y: -previewCanvas.height, // Start from above the shredder
                    speed: 2 + Math.random() * 3,
                    rotation: (Math.random() - 0.5) * 0.2
                });
            }
            
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            
            function animate() {
                shreddingCtx.clearRect(0, 0, shreddingCanvas.width, shreddingCanvas.height);
                
                let stillAnimating = false;
                
                stripImages.forEach(strip => {
                    if (strip.y < shreddingCanvas.height + 50) {
                        strip.y += strip.speed;
                        strip.speed += 0.2;
                        strip.rotation += (Math.random() - 0.5) * 0.1;
                        
                        shreddingCtx.save();
                        shreddingCtx.translate(strip.x + stripWidth / 2, strip.y + previewCanvas.height / 2);
                        shreddingCtx.rotate(strip.rotation);
                        shreddingCtx.drawImage(
                            strip.canvas,
                            -stripWidth / 2,
                            -previewCanvas.height / 2
                        );
                        shreddingCtx.restore();
                        
                        stillAnimating = true;
                    }
                });
                
                if (stillAnimating) {
                    requestAnimationFrame(animate);
                } else {
                    // Trigger confetti when shredding is complete
                    triggerConfetti();
                }
            }
            
            animate();
        }
        
        requestAnimationFrame(pullAnimation);
    });

    resetButton.addEventListener('click', () => {
        dropZone.hidden = false;
        previewContainer.hidden = true;
        currentImage = null;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        shreddingCtx.clearRect(0, 0, shreddingCanvas.width, shreddingCanvas.height);
    });
});
