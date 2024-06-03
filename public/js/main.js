// URLを格納する変数
let targetUrl = '';
let HP = 100;
let age = 0; // 猫の年齢ステージ: 0=子猫, 1=青年, 2=大人
let hasBoyfriend = false;

// URLを直接代入する
document.getElementById('text_input').addEventListener('input', function() {
    targetUrl = this.value;
});

// サイトのチェックと警告を表示する関数
async function checkSite() {
    if (window.location.href === targetUrl) {
        alert("このまま続けると猫の成長が止まるよ！");

        // 10秒待機する
        await new Promise(resolve => setTimeout(resolve, 10000));

        stopGrowth();
    }
}

// 成長を止める関数
async function stopGrowth() {
    for (let i = 0; i < 100; i++) {
        if (window.location.href !== targetUrl) {
            return;
        }
        HP -= 1;
        console.log(`猫の成長が停止しました。現在のHP: ${HP}`);
        if (HP === 0) {
            catDied();
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 36000)); // 36秒ごとに1HP削減
    }
}

// 猫の成長を管理する関数
async function catGrowth() {
    while (true) {
        if (window.location.href !== targetUrl) {
            // 一時間待機する
            await new Promise(resolve => setTimeout(resolve, 3600000));

            // HPに基づいた行動
            if (HP > 70) {
                GoOutside();
            } else {
                StayHome();
            }

            // 猫の成長
            age = Math.min(2, age + 1); // 最大で大人(2)まで成長
            console.log(`猫は成長しました。現在の年齢ステージ: ${age}`);

            // 彼氏がいない場合、外出時に1/5の確率で彼氏ができる
            if (!hasBoyfriend && age >= 1 && Math.random() < 0.2) {
                hasBoyfriend = true;
                console.log("猫に彼氏ができました！");
            }

            // 彼氏がいる場合、3時間ごとに1/3の確率で赤ちゃんが生まれる
            if (hasBoyfriend && Math.random() < 0.333) {
                console.log("コウノトリが猫ちゃんを運んできたよ！");
            }
        }
    }
}

function GoOutside() {
    console.log("猫は外に出ています。");
}

function StayHome() {
    console.log("猫は家にいます。");
}

function catDied() {
    console.log("にゃ、にゃ〜〜。");
    console.log("猫ちゃんは悪環境に耐えられなかったようです。");
    console.log("新しいゲームを開始しますか？");
    // yesが押された場合、家系図が新しくでき、ニューゲームが開始される
}

// サイトのチェックを開始
catGrowth();
