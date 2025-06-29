// Configuración para modo oscuro
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

let currentImage = null;

// Manejar subida de imagen
document.getElementById('stickerUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            document.getElementById('previewImg').src = currentImage;
            document.getElementById('imagePreview').classList.remove('hidden');
            generateLayout();
        };
        reader.readAsDataURL(file);
    } else {
        currentImage = null;
        document.getElementById('imagePreview').classList.add('hidden');
        generateLayout();
    }
});

function setSize(width, height) {
    document.getElementById('stickerWidth').value = width;
    document.getElementById('stickerHeight').value = height;
    if (width === height) {
        document.getElementById('stickerShape').value = 'square';
    }
}

function getPaperDimensions() {
    const paperSize = document.getElementById('paperSize').value;
    return paperSize === 'carta'
        ? { width: 216, height: 279 }
        : { width: 279, height: 432 };
}

function updatePaperSize() {
    const paperSize = document.getElementById('paperSize').value;
    const paperPreview = document.getElementById('paperPreview');
    const previewTitle = document.getElementById('previewTitle');
    const paperSizeInfo = document.getElementById('paperSizeInfo');
    const previewDimensions = document.getElementById('previewDimensions');

    if (paperSize === 'carta') {
        paperPreview.classList.add('carta');
        previewTitle.textContent = 'Vista Previa - Carta';
        paperSizeInfo.textContent = 'Tamaño: Carta (216 × 279 mm)';
        previewDimensions.textContent = '216 × 279 mm';
    } else {
        paperPreview.classList.remove('carta');
        previewTitle.textContent = 'Vista Previa - Tabloide';
        paperSizeInfo.textContent = 'Tamaño: Tabloide (279 × 432 mm)';
        previewDimensions.textContent = '279 × 432 mm';
    }

    generateLayout();
}

function updateCutLineThickness() {
    const thickness = parseFloat(document.getElementById('cutLineThickness').value);
    document.getElementById('thicknessValue').textContent = thickness.toFixed(1) + 'px';

    const style = document.createElement('style');
    style.id = 'cutLineStyle';

    const existingStyle = document.getElementById('cutLineStyle');
    if (existingStyle) existingStyle.remove();

    style.textContent = `
        .sticker-item::after {
            border-width: ${thickness}px !important;
        }
    `;

    document.head.appendChild(style);
}

function generateLayout() {
    const width = parseInt(document.getElementById('stickerWidth').value);
    const height = parseInt(document.getElementById('stickerHeight').value);
    const margin = parseInt(document.getElementById('stickerMargin').value);
    const shape = document.getElementById('stickerShape').value;

    const { width: paperWidth, height: paperHeight } = getPaperDimensions();

    const stickerWidthWithMargin = width + margin;
    const stickerHeightWithMargin = height + margin;

    const stickersPerRow = Math.floor((paperWidth - margin) / stickerWidthWithMargin);
    const totalRows = Math.floor((paperHeight - margin) / stickerHeightWithMargin);
    const totalStickers = stickersPerRow * totalRows;

    document.getElementById('stickersPerRow').textContent = stickersPerRow;
    document.getElementById('totalRows').textContent = totalRows;
    document.getElementById('totalStickers').textContent = totalStickers;

    generateStickerGrid(stickersPerRow, totalRows, width, height, margin, shape);
}

function generateStickerGrid(cols, rows, stickerWidth, stickerHeight, margin, shape) {
    const grid = document.getElementById('stickerGrid');
    grid.innerHTML = '';

    const previewContainer = document.getElementById('paperPreview');
    const containerWidth = previewContainer.clientWidth;
    const { width: paperWidth } = getPaperDimensions();
    const scale = containerWidth / paperWidth;

    const scaledStickerWidth = stickerWidth * scale;
    const scaledStickerHeight = stickerHeight * scale;
    const scaledMargin = margin * scale;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const sticker = document.createElement('div');
            sticker.className = `sticker-item absolute ${shape}`;

            const left = scaledMargin + col * (scaledStickerWidth + scaledMargin);
            const top = scaledMargin + row * (scaledStickerHeight + scaledMargin);

            sticker.style.left = left + 'px';
            sticker.style.top = top + 'px';
            sticker.style.width = scaledStickerWidth + 'px';
            sticker.style.height = scaledStickerHeight + 'px';

            if (shape === 'circle') {
                sticker.style.borderRadius = '50%';
            } else if (shape === 'square') {
                sticker.style.borderRadius = '8px';
            } else {
                sticker.style.borderRadius = '4px';
            }

            if (currentImage) {
                const img = document.createElement('img');
                img.src = currentImage;
                img.style.borderRadius = sticker.style.borderRadius;
                sticker.appendChild(img);
            } else {
                sticker.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-gray-400 dark:text-gray-500">${col + 1},${row + 1}</div>`;
            }

            grid.appendChild(sticker);
        }
    }
}

function exportLayout() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const { width: paperWidth, height: paperHeight } = getPaperDimensions();
    const paperSize = document.getElementById('paperSize').value;

    const dpi = 300;
    const mmToInch = 0.0393701;
    canvas.width = paperWidth * mmToInch * dpi;
    canvas.height = paperHeight * mmToInch * dpi;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const width = parseInt(document.getElementById('stickerWidth').value);
    const height = parseInt(document.getElementById('stickerHeight').value);
    const margin = parseInt(document.getElementById('stickerMargin').value);
    const shape = document.getElementById('stickerShape').value;

    const stickerWidthWithMargin = width + margin;
    const stickerHeightWithMargin = height + margin;

    const stickersPerRow = Math.floor((paperWidth - margin) / stickerWidthWithMargin);
    const totalRows = Math.floor((paperHeight - margin) / stickerHeightWithMargin);
    const pixelScale = mmToInch * dpi;

    function drawCutLines() {
        ctx.strokeStyle = '#d0d0d0';
        const thickness = parseFloat(document.getElementById('cutLineThickness').value);
        ctx.lineWidth = thickness;

        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < stickersPerRow; col++) {
                const x = (margin + col * stickerWidthWithMargin) * pixelScale;
                const y = (margin + row * stickerHeightWithMargin) * pixelScale;
                const w = width * pixelScale;
                const h = height * pixelScale;

                if (shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    ctx.strokeRect(x, y, w, h);
                }
            }
        }
    }

    if (currentImage) {
        const img = new Image();
        img.onload = function() {
            for (let row = 0; row < totalRows; row++) {
                for (let col = 0; col < stickersPerRow; col++) {
                    const x = (margin + col * stickerWidthWithMargin) * pixelScale;
                    const y = (margin + row * stickerHeightWithMargin) * pixelScale;
                    const w = width * pixelScale;
                    const h = height * pixelScale;

                    if (shape === 'circle') {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(img, x, y, w, h);
                        ctx.restore();
                    } else {
                        ctx.drawImage(img, x, y, w, h);
                    }
                }
            }
            drawCutLines();
            const link = document.createElement('a');
            link.download = `stickers-${paperSize}.png`;
            link.href = canvas.toDataURL();
            link.click();
        };
        img.src = currentImage;
    } else {
        drawCutLines();
        const link = document.createElement('a');
        link.download = `stickers-template-${paperSize}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
}

function printLayout() {
    window.print();
}

generateLayout();
