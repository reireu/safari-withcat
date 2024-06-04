// Character.js

class Character {
    constructor() {
        this.status = 'alive';
        this.isChild = false;
    }

    actBasedOnHP(HP) {
        if (HP > 70) {
            this.goOutside();
        } else {
            this.stayHome();
        }
    }

    goOutside() {
        console.log("猫は外に出ています。");
    }

    stayHome() {
        console.log("猫は家にいます。");
    }

    die() {
        this.status = 'dead';
        console.log("にゃ、にゃ〜〜。");
        console.log("猫ちゃんは悪環境に耐えられなかったようです。");
        console.log("新しいゲームを開始しますか？");
    }

    setChild() {
        this.isChild = true;
    }
}

export default Character;
