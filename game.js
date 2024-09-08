const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let selectedBlockIndex = 1;
let selectedItemIndex = null;
let blocks;
let mobs = [];
let enemies = [];
let blockTypes = [
    { name: '空気', color: 'white', hardness: 0 },
    { name: '草ブロック', color: 'green', hardness: 1 },
    { name: '土ブロック', color: 'brown', hardness: 2 },
    { name: '石ブロック', color: 'gray', hardness: 3 },
    { name: '砂ブロック', color: 'yellow', hardness: 1 },
    { name: '木ブロック', color: 'sienna', hardness: 2 },
    { name: '葉ブロック', color: 'limegreen', hardness: 1 },
    { name: '水ブロック', color: 'blue', hardness: 0 },
    { name: '溶岩ブロック', color: 'red', hardness: 0 },
    { name: '砂利ブロック', color: 'darkgray', hardness: 2 },
    { name: 'ガラスブロック', color: 'lightblue', hardness: 1 },
    { name: '鉄ブロック', color: 'lightgray', hardness: 5 },
    { name: '金ブロック', color: 'gold', hardness: 4, gradient: true },  // グラデーションを適用
    { name: 'モモンガブロック', color: 'pink', hardness: 6 },
    { name: 'はちわれブロック', color: 'white', hardness: 0.5 }
];

const items = ['ツルハシ', 'シャベル', '斧'];  // アイテムの例

function preload() {
    this.load.image('player', 'assets/player.png');  // プレイヤー画像
    this.load.image('mob_hachiwari', 'assets/mob_hachiwari.png');  // はちわれモブ画像
    this.load.image('mob_momonga', 'assets/mob_momonga.png');      // モモンガモブ画像
    this.load.image('mob_chiikawa', 'assets/mob_chiikawa.png');    // ちいかわモブ画像
    this.load.image('enemy_triangle', 'assets/enemy_triangle.png');  // 敵三角
    this.load.image('enemy_octagon', 'assets/enemy_octagon.png');    // 敵八角
}

function create() {
    player = this.physics.add.sprite(400, 300, 'player').setCollideWorldBounds(true);
    
    // モブを追加
    mobs.push(createMob(this, 500, 300, 'mob_hachiwari', 10));
    mobs.push(createMob(this, 600, 300, 'mob_momonga', 15));
    mobs.push(createMob(this, 700, 300, 'mob_chiikawa', 12));

    // 敵を追加
    enemies.push(createEnemy(this, 200, 300, 'enemy_triangle', 8));
    enemies.push(createEnemy(this, 300, 300, 'enemy_octagon', 20));

    cursors = this.input.keyboard.createCursorKeys();

    // モバイル対応のボタン
    document.getElementById('up').addEventListener('pointerdown', () => movePlayer('up'));
    document.getElementById('down').addEventListener('pointerdown', () => movePlayer('down'));
    document.getElementById('left').addEventListener('pointerdown', () => movePlayer('left'));
    document.getElementById('right').addEventListener('pointerdown', () => movePlayer('right'));

    this.input.on('pointerdown', (pointer) => {
        handleClick(this, pointer);
    });

    // ブロック選択バーの描画
    createToolbar();

    createMobHP(this);  // モブのHPを表示
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
    } else {
        player.setVelocityY(0);
    }
}

function movePlayer(direction) {
    switch (direction) {
        case 'up': player.setVelocityY(-160); break;
        case 'down': player.setVelocityY(160); break;
        case 'left': player.setVelocityX(-160); break;
        case 'right': player.setVelocityX(160); break;
    }
}

function createToolbar() {
    const toolbar = document.getElementById('toolbar');
    
    // ブロックのバー
    blockTypes.forEach((block, index) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'toolbar-item';
        
        if (block.gradient) {
            const gradient = `linear-gradient(45deg, ${block.color}, yellow)`;
            blockElement.style.background = gradient;
        } else {
            blockElement.style.backgroundColor = block.color;
        }
        
        blockElement.onclick = () => selectBlock(index);
        toolbar.appendChild(blockElement);
    });

    // アイテムのバー
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'toolbar-item';
        itemElement.style.backgroundColor = 'gray';
        itemElement.innerText = item;
        itemElement.onclick = () => selectItem(index);
        toolbar.appendChild(itemElement);
    });

    updateToolbarSelection();
}

function selectBlock(index) {
    selectedBlockIndex = index;
    selectedItemIndex = null;  // アイテム選択をリセット
    updateToolbarSelection();
}

function selectItem(index) {
    selectedItemIndex = index;
    selectedBlockIndex = null;  // ブロック選択をリセット
    updateToolbarSelection();
    applyItemEffect(index);
}

function updateToolbarSelection() {
    const toolbarItems = document.getElementsByClassName('toolbar-item');
    Array.from(toolbarItems).forEach((item, index) => {
        item.classList.remove('selected');
        if (index === selectedBlockIndex || index - blockTypes.length === selectedItemIndex) {
            item.classList.add('selected');
        }
    });
}

function applyItemEffect(index) {
    switch (items[index]) {
        case 'ツルハシ':
            console.log('ツルハシが選択されました！');
            // ツルハシの効果：硬いブロックを破壊しやすくする
            blockTypes.forEach(block => block.hardness = block.hardness * 0.5);
            break;
        case 'シャベル':
            console.log('シャベルが選択されました！');
            // シャベルの効果：土系ブロックを破壊しやすくする
            blockTypes.filter(block => block.name.includes('土')).forEach(block => block.hardness = block.hardness * 0.3);
            break;
        case '斧':
            console.log('斧が選択されました！');
            // 斧の効果：木系ブロックを破壊しやすくする
            blockTypes.filter(block => block.name.includes('木')).forEach(block => block.hardness = block.hardness * 0.2);
            break;
    }
}

function handleClick(scene, pointer) {
    const worldPoint = pointer.positionToCamera(scene.cameras.main);

    // モブがクリックされたか確認
    mobs.forEach(mob => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(mob.getBounds(), new Phaser.Geom.Rectangle(worldPoint.x, worldPoint.y, 1, 1))) {
            mob.hp -= 1;  // ダメージを与える
            if (mob.hp <= 0) {
                mob.destroy();
            }
        }
    });
}

function createMob(scene, x, y, texture, hp) {
    const mob = scene.physics.add.sprite(x, y, texture).setCollideWorldBounds(true);
    mob.hp = hp;
    mob.on('destroy', () => {
        if (mob.hpText) mob.hpText.destroy();
    });
    return mob;
}

function createEnemy(scene, x, y, texture, hp) {
    const enemy = scene.physics.add.sprite(x, y, texture).setCollideWorldBounds(true);
    enemy.hp = hp;
    enemy.on('destroy', () => {
        if (enemy.hpText) enemy.hpText.destroy();
    });
    return enemy;
}

function createMobHP(scene) {
    mobs.forEach(mob => {
        mob.hpText = scene.add.text(mob.x, mob.y - 30, `HP: ${mob.hp}`, { fontSize: '12px', fill: '#fff' });
    });

    enemies.forEach(enemy => {
        enemy.hpText = scene.add.text(enemy.x, enemy.y - 30, `HP: ${enemy.hp}`, { fontSize: '12px', fill: '#fff' });
    });
}
