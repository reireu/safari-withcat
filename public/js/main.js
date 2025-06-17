// ゲーム状態
let gameState = {
    hp: 100,
    age: 0, // 0: 子猫, 1: 青年, 2: 大人
    hasPartner: false,
    children: 0,
    blockedSites: [],
    isDamaging: false,
    damageInterval: 36000, // 36秒
    growthInterval: 3600000, // 1時間は3600000。これをデフォにする
    lastGrowthTime: Date.now()
};

// ローカルストレージからデータを読み込み
function loadGameState() {
    const saved = localStorage.getItem('safariWithCatState');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
        updateUI();
    }
}

// ゲーム状態を保存
function saveGameState() {
    localStorage.setItem('safariWithCatState', JSON.stringify(gameState));
}

// UI更新
function updateUI() {
    document.getElementById('hpValue').textContent = gameState.hp;
    document.getElementById('hpFill').style.width = gameState.hp + '%';
    
    const hpFill = document.getElementById('hpFill');
    if (gameState.hp < 30) {
        hpFill.classList.add('low');
    } else {
        hpFill.classList.remove('low');
    }

    const ageNames = ['子猫', '青年', '大人'];
    document.getElementById('ageValue').textContent = ageNames[gameState.age];
    
    // 年齢インジケーター更新
    for (let i = 0; i < 3; i++) {
        const ageElement = document.getElementById(`age${i}`);
        if (i <= gameState.age) {
            ageElement.classList.add('active');
        } else {
            ageElement.classList.remove('active');
        }
    }

    document.getElementById('relationshipStatus').textContent = 
        gameState.hasPartner ? '恋人あり' : '独身';

    updateBlockedSitesList();
    updateSpeechBubble();
    updateFamilyTree();
}

// 吹き出し更新
function updateSpeechBubble() {
    const bubble = document.getElementById('speechBubble');
    let message = '';

    if (gameState.hp > 80) {
        message = '元気いっぱいだにゃ～！';
    } else if (gameState.hp > 50) {
        message = 'ちょっと疲れたにゃ...';
    } else if (gameState.hp > 20) {
        message = 'しんどいにゃ...';
    } else {
        message = 'もうダメにゃ...';
    }

    if (gameState.hasPartner && gameState.children > 0) {
        message = `${gameState.children}匹の子猫がいるにゃ～`;
    }

    bubble.textContent = message;
}

// 外出機能
function goOut() {
    if (gameState.hp > 70 && !gameState.hasPartner && gameState.age >= 1) {
        if (Math.random() < 1) { // デバック用に100%の確率
            gameState.hasPartner = true;
            showMessage('外出で恋人ができたにゃ〜♡');
            saveGameState();
            updateUI();
        } else {
            showMessage('出かけたけど何も起きなかったにゃ〜');
        }
    } else if (gameState.hp <= 70) {
        showMessage('体力が足りないにゃ〜（HP 70以上必要）');
    } else if (gameState.age < 1) {
        showMessage('まだ子猫だから外出できないにゃ〜');
    } else if (gameState.hasPartner) {
        showMessage('もう恋人がいるにゃ〜');
    } else {
        showMessage('今は外出できないにゃ〜');
    }
}

// ブロックサイト追加
function addBlockedSite() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('URLを入力してください');
        return;
    }

    try {
        new URL(url);
        if (!gameState.blockedSites.includes(url)) {
            gameState.blockedSites.push(url);
            urlInput.value = '';
            saveGameState();
            updateUI();
            showMessage('サイトをブロックリストに追加したにゃ！');
        } else {
            alert('そのサイトは既に追加されています');
        }
    } catch (e) {
        alert('有効なURLを入力してください');
    }
}

// ブロックサイトリスト更新
function updateBlockedSitesList() {
    const list = document.getElementById('blockedSitesList');
    list.innerHTML = '';
    
    gameState.blockedSites.forEach((site, index) => {
        const div = document.createElement('div');
        div.className = 'site-item';
        div.innerHTML = `
            <span>${site}</span>
            <button class="remove-btn" onclick="removeBlockedSite(${index})">削除</button>
        `;
        list.appendChild(div);
    });
}

// ブロックサイト削除
function removeBlockedSite(index) {
    gameState.blockedSites.splice(index, 1);
    saveGameState();
    updateUI();
}

// 現在のサイトをテスト
function testCurrentSite() {
    const currentUrl = window.location.href;
    const isBlocked = gameState.blockedSites.some(blockedSite => 
        currentUrl.includes(blockedSite.replace(/^https?:\/\//, ''))
    );
    
    if (isBlocked) {
        showMessage('このサイトはブロック対象だにゃ！');
        triggerDamage();
    } else {
        showMessage('このサイトは安全だにゃ～');
    }
}

// ダメージ処理
function triggerDamage() {
    if (gameState.isDamaging) return;
    
    gameState.isDamaging = true;
    const catElement = document.getElementById('catElement');
    catElement.classList.add('damaged');
    
    setTimeout(() => {
        catElement.classList.remove('damaged');
    }, 500);

    const damageInterval = setInterval(() => {
        if (gameState.hp <= 0) {
            clearInterval(damageInterval);
            gameState.isDamaging = false;
            catDied();
            return;
        }

        // 現在のサイトがブロック対象かチェック
        const currentUrl = window.location.href;
        const isStillBlocked = gameState.blockedSites.some(blockedSite => 
            currentUrl.includes(blockedSite.replace(/^https?:\/\//, ''))
        );

        if (!isStillBlocked) {
            clearInterval(damageInterval);
            gameState.isDamaging = false;
            showMessage('安全な場所に移動したにゃ！');
            return;
        }

        gameState.hp = Math.max(0, gameState.hp - 1);
        catElement.classList.add('damaged');
        setTimeout(() => catElement.classList.remove('damaged'), 300);
        
        saveGameState();
        updateUI();
        
    }, gameState.damageInterval);
}

// 猫が死んだ時の処理
function catDied() {
    showMessage('にゃ、にゃ〜〜... 猫ちゃんは力尽きました...');
    
    // 家系図に記録
    addFamilyEvent(
        `${gameState.catName}の最期`,
        `${gameState.catName}は力尽きました。${gameState.children}匹の子猫を残しました。`,
        '😿'
    );
    
    if (gameState.children > 0) {
        if (confirm('子猫が次世代を継ぎますか？')) {
            startNewGeneration();
            resetGame(false); // 家系図データは保持
        } else if (confirm('新しいゲームを始めますか？')) {
            resetGame();
        }
    } else {
        if (confirm('新しいゲームを始めますか？')) {
            resetGame();
        }
    }
}

// 家系図更新
function updateFamilyTree() {
    const familyTreeContainer = document.getElementById('familyTreeContainer');
    if (!familyTreeContainer) return;

    familyTreeContainer.innerHTML = `
        <div class="family-stats">
            <h3>家系図統計</h3>
            <p>世代数: ${gameState.familyTree.generations}</p>
            <p>総猫数: ${gameState.familyTree.totalCats}</p>
            <p>現在の猫: ${gameState.catName}</p>
        </div>
        <div class="current-family">
            <h3>現在の家族</h3>
            <div class="cat-info">
                <div class="cat-card current">
                    <div class="cat-icon">🐱</div>
                    <div class="cat-details">
                        <h4>${gameState.catName}</h4>
                        <p>年齢: ${['子猫', '青年', '大人'][gameState.age]}</p>
                        <p>HP: ${gameState.hp}</p>
                        <p>状態: ${gameState.hasPartner ? '恋人あり' : '独身'}</p>
                    </div>
                </div>
                ${gameState.hasPartner ? `
                <div class="cat-card partner">
                    <div class="cat-icon">🐱</div>
                    <div class="cat-details">
                        <h4>恋人</h4>
                        <p>年齢: 大人</p>
                        <p>関係: パートナー</p>
                    </div>
                </div>
                ` : ''}
                ${gameState.children > 0 ? `
                <div class="children-section">
                    <h4>子猫たち (${gameState.children}匹)</h4>
                    <div class="children-grid">
                        ${Array.from({length: gameState.children}, (_, i) => `
                            <div class="cat-card child">
                                <div class="cat-icon">🐾</div>
                                <div class="cat-details">
                                    <h5>子猫${i + 1}</h5>
                                    <p>年齢: 子猫</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        ${gameState.familyTree.history.length > 0 ? `
        <div class="family-history">
            <h3>家族の歴史</h3>
            <div class="history-timeline">
                ${gameState.familyTree.history.map((event, index) => `
                    <div class="history-item">
                        <div class="history-icon">${event.icon}</div>
                        <div class="history-text">
                            <strong>${event.title}</strong>
                            <p>${event.description}</p>
                            <small>${event.date}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

// 家系図イベント記録
function addFamilyEvent(title, description, icon = '📅') {
    const event = {
        title,
        description,
        icon,
        date: new Date().toLocaleString('ja-JP'),
        timestamp: Date.now()
    };
    
    gameState.familyTree.history.unshift(event);
    
    // 履歴は最大20件まで保持
    if (gameState.familyTree.history.length > 20) {
        gameState.familyTree.history = gameState.familyTree.history.slice(0, 20);
    }
    
    saveGameState();
    updateFamilyTree();
}

// メッセージ表示
function showMessage(message) {
    const bubble = document.getElementById('speechBubble');
    bubble.textContent = message;
    bubble.style.animation = 'none';
    bubble.offsetHeight; // リフロー
    bubble.style.animation = 'fadeIn 0.5s ease';
}

// 成長処理
function checkGrowth() {
    const now = Date.now();
    if (now - gameState.lastGrowthTime >= gameState.growthInterval) {
        if (gameState.age < 2) {
            gameState.age++;
            gameState.lastGrowthTime = now;
            
            // 自動成長時の恋人発見（従来の処理）
            if (gameState.hp > 70) {
                if (!gameState.hasPartner && gameState.age >= 1 && Math.random() < 1) {
                    gameState.hasPartner = true;
                    showMessage('恋人ができたにゃ〜♡');
                }
            }
            
            // 子猫誕生処理
            if (gameState.hasPartner && Math.random() < 1) {
                gameState.children++;
                showMessage('赤ちゃんが生まれたにゃ〜！');
            }
            
            saveGameState();
            updateUI();
        }
    }
}

// 設定保存
function saveSettings() {
    gameState.damageInterval = document.getElementById('damageInterval').value * 1000;
    gameState.growthInterval = document.getElementById('growthInterval').value * 60000;
    saveGameState();
    alert('設定を保存しました');
}

// ゲームリセット
function resetGame(fullReset = true) {
    const oldBlockedSites = gameState.blockedSites;
    const oldFamilyTree = gameState.familyTree;
    const oldCatName = gameState.catName;
    
    gameState = {
        hp: 100,
        age: 0,
        hasPartner: false,
        children: 0,
        blockedSites: oldBlockedSites, // ブロックサイトは保持
        isDamaging: false,
        damageInterval: 36000,
        growthInterval: 3600000,
        lastGrowthTime: Date.now(),
        familyTree: fullReset ? {
            generations: 1,
            totalCats: 1,
            currentGeneration: [],
            history: []
        } : oldFamilyTree,
        catName: fullReset ? '初代猫ちゃん' : oldCatName
    };
    
    if (fullReset) {
        addFamilyEvent(
            'ゲーム開始',
            '新しい猫ちゃんの人生が始まりました！',
            '🎮'
        );
    }
    
    saveGameState();
    updateUI();
    showMessage('新しい猫ちゃんが生まれたにゃ〜！');
}

// サイドバー制御
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menuButton');
    const sidebar = document.getElementById('sidebar');
    const homeLink = document.getElementById('homeLink');
    const accountLink = document.getElementById('accountLink');
    const settingsLink = document.getElementById('settingsLink');
    const familyTreeLink = document.getElementById('familyTreeLink');
    const contentPanels = document.querySelectorAll('.content-panel');

    menuButton.addEventListener('click', function() {
        sidebar.classList.toggle('show');
    });

    function showPanel(targetId) {
        contentPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        sidebar.classList.remove('show');
    }

    homeLink.addEventListener('click', () => showPanel('home'));
    accountLink.addEventListener('click', () => showPanel('inputContainer'));
    settingsLink.addEventListener('click', () => showPanel('settingsContainer'));
    familyTreeLink.addEventListener('click', () => showPanel('familyTree'));

    // 家系図の手動更新ボタン
    const refreshFamilyTreeBtn = document.getElementById('refreshFamilyTree');
    if (refreshFamilyTreeBtn) {
        refreshFamilyTreeBtn.addEventListener('click', updateFamilyTree);
    }

    // 初期化
    loadGameState();
    
    // 定期的に成長チェック
    setInterval(checkGrowth, 60000); // 1分ごと
    
    // ページ離脱時の警告（ブロックサイトの場合）
    window.addEventListener('beforeunload', function(e) {
        const currentUrl = window.location.href;
        const isBlocked = gameState.blockedSites.some(blockedSite => 
            currentUrl.includes(blockedSite.replace(/^https?:\/\//, ''))
        );
        
        if (isBlocked && gameState.hp > 0) {
            e.preventDefault();
            e.returnValue = '猫ちゃんがダメージを受けています！本当に離れますか？';
        }
    });
});