// 切換顯示區域
function showSection(sectionId) {
    document.getElementById('readSection').style.display = 'none';
    document.getElementById('viewSection').style.display = 'none';
    document.getElementById('detailsSection').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

// 讀取 QR Code 圖片
document.getElementById('fileInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);
            const imageData = context.getImageData(0, 0, img.width, img.height);

            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                try {
                    const qrData = JSON.parse(code.data);
                    let resultHtml = `<p><strong>序號:</strong> ${qrData.serialNumber}</p>
                                      <p><strong>名稱:</strong> ${qrData.productName}</p>
                                      <p><strong>製造日期:</strong> ${qrData.produceDate}</p>
                                      <p><strong>保存期限:</strong> ${qrData.expiryDate}</p>
                                      <p><strong>成分:</strong> ${qrData.ingredient}</p>
                                      <p><strong>特色:</strong> ${qrData.feature}</p>
                                      <p><strong>使用方式:</strong> ${qrData.instructions}</p>`;

                    document.getElementById('result').innerHTML = resultHtml;
                    saveToLocalStorage(qrData);  // 儲存資訊到本地存儲
                    loadSavedData();  // 重新載入已儲存的資料
                    
                    // 自動返回到讀取區域
                    setTimeout(() => showSection('readSection'), 3000);  // 3秒後返回
                } catch (e) {
                    document.getElementById('result').textContent = 'QR Code 內容格式錯誤';
                }
            } else {
                document.getElementById('result').textContent = '無法讀取 QR Code';
            }
        }
    };
    reader.readAsDataURL(file);
});

// 儲存到本地存儲
function saveToLocalStorage(data) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(product => product.productName !== data.productName); // 確保不會有重複
    products.push(data);
    localStorage.setItem('products', JSON.stringify(products));
}

// 查看已儲存的 QR Code 資料
function loadSavedData() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    let productsHtml = products.map(product => `
        <div class="product">
            <p><strong>產品名稱:</strong> ${product.productName}</p>
            <button onclick="showDetails('${product.productName}')">顯示詳情</button>
            <button onclick="deleteProduct('${product.productName}')">刪除</button>
        </div>
    `).join('');

    document.getElementById('products').innerHTML = productsHtml;
}

// 顯示產品詳細資訊
function showDetails(productName) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.productName === productName);

    if (product) {
        let detailsHtml = `<p><strong>序號:</strong> ${product.serialNumber}</p>
                           <p><strong>名稱:</strong> ${product.productName}</p>
                           <p><strong>製造日期:</strong> ${product.produceDate}</p>
                           <p><strong>保存期限:</strong> ${product.expiryDate}</p>
                           <p><strong>成分:</strong> ${product.ingredient}</p>
                           <p><strong>特色:</strong> ${product.feature}</p>
                           <p><strong>使用方式:</strong> ${product.instructions}</p>`;
        document.getElementById('details').innerHTML = detailsHtml;
        showSection('detailsSection');
    }
}

// 刪除產品
function deleteProduct(productName) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(product => product.productName !== productName); // 移除指定產品
    localStorage.setItem('products', JSON.stringify(products));
    loadSavedData();  // 更新顯示的產品列表
}

// 初始化時顯示讀取區域，並加載儲存的資料
document.addEventListener('DOMContentLoaded', () => {
    showSection('readSection');
    loadSavedData();
});
