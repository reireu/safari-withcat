// UI.js

class UI {
    updateHP(HP) {
        // HPの更新ロジック
    }

    updateAge(age) {
        // 年齢ステージの更新ロジック
    }

    updateCharacterImage(imagePath) {
        const characterElement = document.querySelector('.cat');
        characterElement.src = imagePath;
    }
}

export default UI;
