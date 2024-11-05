document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewCanvas = document.getElementById('previewCanvas');
    const previewContainer = document.querySelector('.preview-container');
    const shredButton = document.getElementById('shredButton');
    const resetButton = document.getElementById('resetButton');
    const ctx = previewCanvas.getContext('2d');
    
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
                previewCanvas.width = img.width;
                previewCanvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                dropZone.hidden = true;
                previewContainer.hidden = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    shredButton.addEventListener('click', () => {
        if (!currentImage) return;
        
        const strips = 20;
        const stripWidth = previewCanvas.width / strips;
        const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
        
        // Create strips
        const stripImages = [];
        for (let i = 0; i < strips; i++) {
            const stripCanvas = document.createElement('canvas');
            stripCanvas.width = stripWidth;
            stripCanvas.height = previewCanvas.height;
            const stripCtx = stripCanvas.getContext('2d');
            
            // Copy strip from original image
            stripCtx.drawImage(
                previewCanvas,
                i * stripWidth, 0, stripWidth, previewCanvas.height,
                0, 0, stripWidth, previewCanvas.height
            );
            
            stripImages.push({
                canvas: stripCanvas,
                x: i * stripWidth,
                y: 0,
                speed: 5 + Math.random() * 10
            });
        }

        // Clear original canvas
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Animate strips
        function animate() {
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            
            let stillAnimating = false;
            
            stripImages.forEach(strip => {
                if (strip.y < previewCanvas.height + 50) {
                    strip.y += strip.speed;
                    strip.speed += 0.2;
                    ctx.drawImage(strip.canvas, strip.x, strip.y);
                    stillAnimating = true;
                }
            });

            if (stillAnimating) {
                requestAnimationFrame(animate);
            }
        }

        animate();
    });

    resetButton.addEventListener('click', () => {
        dropZone.hidden = false;
        previewContainer.hidden = true;
        currentImage = null;
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    });
});
