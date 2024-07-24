document.getElementById('startButton').addEventListener('click', function() {
    const video = document.createElement('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const resultDiv = document.getElementById('result');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // 讓Safari瀏覽器也能正常顯示
        video.play();
        requestAnimationFrame(tick);
    });

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code) {
                resultDiv.textContent = `QR Code 內容: ${code.data}`;
                displayQRData(code.data);
                video.srcObject.getTracks().forEach(track => track.stop());
            } else {
                resultDiv.textContent = '無法讀取 QR Code';
            }
        }
        requestAnimationFrame(tick);
    }
});

function displayQRData(data) {
    const resultDiv = document.getElementById('result');
    try {
        const parsedData = JSON.parse(data);
        let htmlContent = `
            <p><strong>序號:</strong> ${parsedData.serialNumber}</p>
            <p><strong>名稱:</strong> ${parsedData.productName}</p>
            <p><strong>製造日期:</strong> ${parsedData.produceDate}</p>
            <p><strong>保存期限:</strong> ${parsedData.expiryDate}</p>
            <p><strong>成分:</strong> ${parsedData.ingredient}</p>
            <p><strong>特色:</strong> ${parsedData.feature}</p>
            <p><strong>使用方式:</strong> ${parsedData.instructions}</p>
        `;
        if (parsedData.image) {
            htmlContent += `<img src="${parsedData.image}" alt="產品照片" style="max-width: 100%;">`;
        }
        resultDiv.innerHTML = htmlContent;
    } catch (e) {
        resultDiv.textContent = '無法解析 QR Code 內容';
    }
}
