document.getElementById('startScanBtn').addEventListener('click', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const result = document.getElementById('result');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
            video.srcObject = stream;
            video.setAttribute('playsinline', true); // Required to tell iOS Safari we don't want fullscreen
            video.play();
            requestAnimationFrame(tick);
        })
        .catch((err) => {
            result.textContent = 'Error accessing camera: ' + err;
        });

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.style.display = 'block';
            video.style.display = 'block';
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code) {
                result.textContent = 'QR Code 內容: ' + code.data;
                video.pause();
                video.srcObject.getTracks().forEach(track => track.stop());
                video.style.display = 'none';
            } else {
                result.textContent = '未找到 QR Code，請重新掃描';
            }
        }
        requestAnimationFrame(tick);
    }
});
