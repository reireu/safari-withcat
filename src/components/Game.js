// Game.js

import Character from './Character';
import UI from './UI';

class Game {
    constructor() {
        this.character = new Character();
        this.ui = new UI();
        this.targetUrl = '';
        this.HP = 100;
        this.age = 0; // 猫の年齢ステージ: 0=子猫, 1=青年, 2=大人
        this.hasBoyfriend = false;
    }

    init() {
        this.setupEventListeners();
        this.startGrowthCycle();
    }

    setupEventListeners() {
        document.getElementById('text_input').addEventListener('input', (event) => {
            this.targetUrl = event.target.value;
        });

        document.getElementById('check_site_button').addEventListener('click', () => {
            this.checkSite();
        });
    }

    async checkSite() {
        if (window.location.href === this.targetUrl) {
            alert("このまま続けると猫の成長が止まるよ！");
            await new Promise(resolve => setTimeout(resolve, 10000));
            this.stopGrowth();
        }
    }

    async stopGrowth() {
        for (let i = 0; i < 100; i++) {
            if (window.location.href !== this.targetUrl) {
                return;
            }
            this.HP -= 1;
            this.ui.updateHP(this.HP);
            console.log(`猫の成長が停止しました。現在のHP: ${this.HP}`);
            if (this.HP === 0) {
                this.character.die();
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 36000)); // 36秒ごとに1HP削減
        }
    }

    async startGrowthCycle() {
        while (true) {
            if (window.location.href !== this.targetUrl) {
                await new Promise(resolve => setTimeout(resolve, 3600000)); // 一時間待機
                this.character.actBasedOnHP(this.HP);
                this.age = Math.min(2, this.age + 1);
                this.ui.updateAge(this.age);
                console.log(`猫は成長しました。現在の年齢ステージ: ${this.age}`);
                if (!this.hasBoyfriend && this.age >= 1 && Math.random() < 0.2) {
                    this.hasBoyfriend = true;
                    console.log("猫に彼氏ができました！");
                }
                if (this.hasBoyfriend && Math.random() < 0.333) {
                    this.addChild();
                }
            }
        }
    }

    addChild() {
        console.log("コウノトリが2人の猫ちゃんを運んできたよ!");
        this.character.setChild();
        this.ui.updateCharacterImage('childCat.png'); // 子供の猫の画像に変更
    }
}

export default Game;
