let timer = null;
let wordInterval = null;

document.getElementById('startBtn').addEventListener('click', function() {
    const timerInput = document.getElementById('timerInput').value;
    let totalTime = parseInt(timerInput);

    if (isNaN(totalTime) || totalTime <= 0) {
        alert("請輸入有效的秒數！");
        return;
    }
    
    // 檢查係咪已經有倒計時運行緊
    if (timer !== null || wordInterval !== null) {
        alert("倒計時已經運行中！請先取消再重新開始。");
        return;
    }
    
    // 檢查文本係咪為空
    const textDisplay = document.getElementById('textDisplay');
    if (!textDisplay || !textDisplay.textContent || textDisplay.textContent.trim() === '') {
        alert("請先設定要顯示的文本！");
        return;
    }

    const countdown = document.getElementById('countdown');
    countdown.textContent = totalTime;

    const originalText = textDisplay.textContent;
    
    // 智能分割：中文字逐字，英文逐詞，標點符號獨立
    // words: 可高亮元素（唔包括空格）
    // displaySegments: 所有元素（包括空格）用嚟完整顯示
    let words = [];
    let displaySegments = [];
    let hasChinese = false;
    
    for (let i = 0; i < originalText.length; i++) {
        const char = originalText[i];
        const isChinese = /[\u4e00-\u9fa5]/.test(char);
        const isSpace = /\s/.test(char);
        const isPunctuation = /[，。！？、；：.,!?;:()\[\]「」『』]/.test(char);
        
        if (isChinese) {
            hasChinese = true;
            words.push(char); // 中文字逐字分割
            displaySegments.push({type: 'text', content: char});
        } else if (isSpace) {
            // 空格保留喺顯示，但唔加入可高亮陣列
            displaySegments.push({type: 'space', content: char});
        } else if (isPunctuation) {
            words.push(char); // 標點符號獨立
            displaySegments.push({type: 'text', content: char});
        } else {
            // 英文或其他字符組合成詞
            let word = '';
            let j = i;
            while (j < originalText.length) {
                const nextChar = originalText[j];
                const isChineseNext = /[\u4e00-\u9fa5]/.test(nextChar);
                const isSpaceNext = /\s/.test(nextChar);
                const isPunctuationNext = /[，。！？、；：.,!?;:()\[\]「」『』]/.test(nextChar);
                
                if (isChineseNext || isSpaceNext || isPunctuationNext) {
                    break;
                }
                word += nextChar;
                j++;
            }
            if (word) {
                words.push(word);
                displaySegments.push({type: 'text', content: word});
                i = j - 1;
            }
        }
    }
    
    const totalWords = words.length;

    // 每個字詞高亮間隔（毫秒）
    const interval = Math.floor(totalTime / totalWords * 1000);

    let currentWordIndex = 0;
    let timeLeft = totalTime;

    // 倒數計時（每秒減一）
    timer = setInterval(() => {
        timeLeft--;
        countdown.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            timer = null;
        }
    }, 1000);

    // 高亮字詞
    wordInterval = setInterval(() => {
        if (currentWordIndex < totalWords) {
            // 搵到要高亮嘅 segment
            let highlightIndex = -1;
            let textCount = 0;
            
            for (let i = 0; i < displaySegments.length; i++) {
                if (displaySegments[i].type === 'text') {
                    if (textCount === currentWordIndex) {
                        highlightIndex = i;
                        break;
                    }
                    textCount++;
                }
            }
            
            // 生成顯示內容
            textDisplay.innerHTML = displaySegments.map((segment, index) => {
                if (segment.type === 'space') {
                    return segment.content; // 空格唔用 escapeHtml
                }
                if (index === highlightIndex) {
                    return `<span class="highlight">${escapeHtml(segment.content)}</span>`;
                }
                return escapeHtml(segment.content);
            }).join('');
            
            currentWordIndex++;
            
            // 如果係最後一個字詞，標記結束
            if (currentWordIndex >= totalWords) {
                clearInterval(wordInterval);
                wordInterval = null;
                
                setTimeout(() => {
                    alert("時間到！");
                    countdown.textContent = 0;
                    
                    // 清除計時器
                    if (timer) {
                        clearInterval(timer);
                        timer = null;
                    }
                    
                    // 顯示所有文本
                    setTimeout(() => {
                        textDisplay.innerHTML = displaySegments.map(segment => {
                            return segment.type === 'space' ? segment.content : escapeHtml(segment.content);
                        }).join('');
                    }, 1000);
                }, interval);
            }
        }
    }, interval);
});

// 輔助函數：轉義HTML特殊字符
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

document.getElementById('setTextBtn').addEventListener('click', function() {
    const userText = document.getElementById('userText').value;
    if (userText.trim() !== "") {
        document.getElementById('textDisplay').textContent = userText;
        // 清空 textarea 方便下次使用
        document.getElementById('userText').value = '';
    } else {
        alert("請輸入文本內容！");
    }
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    // 清除所有計時器
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    if (wordInterval) {
        clearInterval(wordInterval);
        wordInterval = null;
    }
    
    // 重設顯示
    document.getElementById('countdown').textContent = 0;
    const textDisplay = document.getElementById('textDisplay');
    // 移除所有高亮，只顯示純文本
    const plainText = textDisplay.textContent || textDisplay.innerText;
    textDisplay.textContent = plainText;
    
    alert("已取消倒計時！");
});
