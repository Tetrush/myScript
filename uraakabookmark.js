javascript:(function(){
  // 現在のURLからユーザー識別子を取得
  var urlMatch = window.location.pathname.match(/\/user\/([^\/]+)\//);
  var userIdentifier = urlMatch ? urlMatch[1] : null;
  
  if (!userIdentifier) {
    alert('ユーザー識別子を取得できませんでした。正しいページで実行してください。');
    return;
  }
  
  // 指定されたクラスを持つ画像要素を取得
  var allImages = document.querySelectorAll('img.horizontal-fit.lazyloaded');
  
  // 動画要素も取得
  var allVideos = document.querySelectorAll('video');
  
  // ユーザー識別子に一致する画像のみフィルタリング
  var images = Array.from(allImages).filter(function(img) {
    var src = img.src || img.dataset.src || img.dataset.original;
    return src && src.includes('/' + userIdentifier + '/');
  });
  
  // ユーザー識別子に一致する動画のみフィルタリング
  var videos = Array.from(allVideos).filter(function(video) {
    var source = video.querySelector('source');
    if (source) {
      var src = source.src;
      return src && src.includes('/' + userIdentifier + '/');
    }
    return false;
  });
  
  var totalItems = images.length + videos.length;
  
  if (totalItems === 0) {
    alert('ユーザー "' + userIdentifier + '" の画像・動画が見つかりませんでした。');
    return;
  }
  
  // 新しいウィンドウで画像一覧を表示
  var newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  
  // HTMLコンテンツを構築
  var html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>画像一覧 - ${document.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background-color: #f5f5f5;
        }
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        .image-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .image-item {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 15px;
          text-align: center;
        }
        .image-item img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .image-item img:hover {
          transform: scale(1.05);
        }
        .image-info {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
        }
        .image-link {
          display: block;
          margin-top: 5px;
          color: #007bff;
          text-decoration: none;
          word-break: break-all;
        }
        .image-link:hover {
          text-decoration: underline;
        }
        .stats {
          text-align: center;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
        }
        .video-item video {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        .download-section {
          margin-top: 40px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          text-align: center;
        }
        .download-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin: 5px;
        }
        .download-btn:hover {
          background: #0056b3;
        }
        .download-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .progress {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>${userIdentifier} のメディア一覧 (画像: ${images.length}枚, 動画: ${videos.length}本)</h1>
      <div class="stats">元ページ: <a href="${window.location.href}" target="_blank">${document.title}</a></div>
      <div class="image-container">
  `;
  
  // 各画像のHTMLを追加
  images.forEach(function(img, index) {
    var src = img.src || img.dataset.src || img.dataset.original;
    // オリジナル画像のURLを取得（パラメータを削除）
    var originalSrc = src ? src.split('?')[0] : '';
    var alt = img.alt || `${userIdentifier} 画像 ${index + 1}`;
    
    if (originalSrc) {
      html += `
        <div class="image-item">
          <img src="${src}" alt="${alt}" onclick="window.open('${originalSrc}', '_blank')" />
          <div class="image-info">
            <strong>${alt}</strong><br>
            サイズ: ${img.naturalWidth || '不明'} × ${img.naturalHeight || '不明'}<br>
            <small>※クリックでオリジナル画像を表示</small>
          </div>
          <a href="${originalSrc}" target="_blank" class="image-link">オリジナル画像を新しいタブで開く</a>
        </div>
      `;
    }
  });
  
  // 各動画のHTMLを追加
  videos.forEach(function(video, index) {
    var source = video.querySelector('source');
    var src = source ? source.src : '';
    var poster = video.getAttribute('data-poster') || '';
    
    if (src) {
      html += `
        <div class="image-item video-item">
          <video controls poster="${poster}" onclick="this.play()">
            <source src="${src}" type="video/mp4">
          </video>
          <div class="image-info">
            <strong>${userIdentifier} 動画 ${index + 1}</strong><br>
            形式: MP4
          </div>
          <a href="${src}" target="_blank" class="image-link">動画を新しいタブで開く</a>
        </div>
      `;
    }
  });
  
  html += `
      </div>
      <div class="download-section">
        <h2>一括ダウンロード</h2>
        <div>
          <h3>個別ファイル</h3>
          <button class="download-btn" onclick="downloadAll()">すべてダウンロード (${totalItems}ファイル)</button>
          <button class="download-btn" onclick="downloadImages()">画像のみダウンロード (${images.length}ファイル)</button>
          <button class="download-btn" onclick="downloadVideos()">動画のみダウンロード (${videos.length}ファイル)</button>
        </div>
        <div style="margin-top: 20px;">
          <h3>ZIPファイル</h3>
          <button class="download-btn" onclick="downloadAllZip()">すべてZIPダウンロード (${totalItems}ファイル)</button>
          <button class="download-btn" onclick="downloadImagesZip()">画像ZIPダウンロード (${images.length}ファイル)</button>
          <button class="download-btn" onclick="downloadVideosZip()">動画ZIPダウンロード (${videos.length}ファイル)</button>
        </div>
        <div class="progress" id="progress"></div>
      </div>
      <script>
        var imageUrls = [${images.map(function(img) {
          var src = img.src || img.dataset.src || img.dataset.original;
          // オリジナル画像のURLを取得（パラメータを削除）
          var originalSrc = src ? src.split('?')[0] : '';
          return originalSrc ? `'${originalSrc}'` : '';
        }).filter(Boolean).join(',')}];
        var videoUrls = [${videos.map(function(video) {
          var source = video.querySelector('source');
          return source ? `'${source.src}'` : '';
        }).filter(Boolean).join(',')}];
        
        function downloadFile(url, filename) {
          var a = document.createElement('a');
          a.href = url;
          a.download = filename || url.split('/').pop();
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        
        function cleanFileName(url) {
          var filename = url.split('/').pop();
          // ?以降のパラメータを削除
          filename = filename.split('?')[0];
          // 拡張子を取得
          var parts = filename.split('.');
          if (parts.length > 1) {
            var ext = parts.pop();
            var name = parts.join('.');
            return name + '.' + ext;
          }
          return filename;
        }
        
        function downloadAsZip(urls, type, userIdentifier) {
          var script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          document.head.appendChild(script);
          
          script.onload = function() {
            var zip = new JSZip();
            var progress = document.getElementById('progress');
            var total = urls.length;
            var loaded = 0;
            
            if (total === 0) {
              progress.textContent = type + 'がありません。';
              return;
            }
            
            progress.textContent = type + 'ZIP作成中: 0/' + total;
            
            urls.forEach(function(url, index) {
              fetch(url)
                .then(response => response.blob())
                .then(blob => {
                  var cleanName = cleanFileName(url);
                  var filename = userIdentifier + '_' + (index + 1) + '_' + cleanName;
                  zip.file(filename, blob);
                  loaded++;
                  progress.textContent = type + 'ZIP作成中: ' + loaded + '/' + total;
                  
                  if (loaded === total) {
                    zip.generateAsync({type: 'blob'}).then(function(content) {
                      var a = document.createElement('a');
                      a.href = URL.createObjectURL(content);
                      a.download = userIdentifier + '_' + type.replace('の', '') + '.zip';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      progress.textContent = type + 'ZIPダウンロード完了！';
                    });
                  }
                })
                .catch(error => {
                  console.error('ファイル取得エラー:', error);
                  loaded++;
                  if (loaded === total) {
                    progress.textContent = type + 'ZIP作成完了（一部エラー）';
                  }
                });
            });
          };
        }
        
        function downloadWithDelay(urls, type) {
          var progress = document.getElementById('progress');
          var total = urls.length;
          var downloaded = 0;
          
          if (total === 0) {
            progress.textContent = type + 'がありません。';
            return;
          }
          
          urls.forEach(function(url, index) {
            setTimeout(function() {
              var cleanName = cleanFileName(url);
              var filename = '${userIdentifier}_' + (index + 1) + '_' + cleanName;
              downloadFile(url, filename);
              downloaded++;
              progress.textContent = type + 'ダウンロード中: ' + downloaded + '/' + total;
              
              if (downloaded === total) {
                setTimeout(function() {
                  progress.textContent = type + 'ダウンロード完了！';
                }, 1000);
              }
            }, index * 500);
          });
        }
        
        function downloadAll() {
          var allUrls = imageUrls.concat(videoUrls);
          downloadWithDelay(allUrls, 'すべてのファイルの');
        }
        
        function downloadImages() {
          downloadWithDelay(imageUrls, '画像の');
        }
        
        function downloadVideos() {
          downloadWithDelay(videoUrls, '動画の');
        }
        
        function downloadAllZip() {
          var allUrls = imageUrls.concat(videoUrls);
          downloadAsZip(allUrls, 'すべてのファイル', '${userIdentifier}');
        }
        
        function downloadImagesZip() {
          downloadAsZip(imageUrls, '画像', '${userIdentifier}');
        }
        
        function downloadVideosZip() {
          downloadAsZip(videoUrls, '動画', '${userIdentifier}');
        }
        
        // 画像のロードエラーハンドリング
        document.querySelectorAll('img').forEach(function(img) {
          img.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML += '<p style="color: red;">画像の読み込みに失敗しました</p>';
          };
        });
      </script>
    </body>
    </html>
  `;
  
  // 新しいウィンドウにHTMLを書き込み
  newWindow.document.write(html);
  newWindow.document.close();
  
  // 元のページのURLを新しいウィンドウのタイトルに反映
  newWindow.document.title = `${userIdentifier} のメディア一覧 - ${document.title}`;
  
})();

