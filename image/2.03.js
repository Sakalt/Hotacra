// ゲームの初期化
Crafty.init('100vw', '80vh', document.getElementById('game'));

// 画像のロード
Crafty.sprite(40, "images/mob_chiikawa.png", { PlayerSprite: [0, 0] });
Crafty.sprite(40, "images/mob_polandball.png", { EnemySprite: [0, 0] });

// ブロックのスプライトのロードと定義
const blocks = [
    { id: 'wood', value: '木' },
    { id: 'stone', value: '石' },
    { id: 'dirt', value: '土' },
    { id: 'grass', value: '草' },
    { id: 'lava', value: 'マグマ' },
    { id: 'water', value: '水' },
    { id: 'gold_ore', value: '金鉱石' },
    { id: 'fluorite', value: '蛍石鉱石' },
    { id: 'diamond_ore', value: 'ダイヤモンド鉱石' },
    { id: 'iron_ore', value: '鉄鉱石' }
];

blocks.forEach(block => {
    Crafty.sprite(40, `images/${block.id}.png`, { [block.id]: [0, 0] });
});

// サウンドの初期化
Crafty.audio.add("jumpSound", "https://freesound.org/data/previews/171/171497_2437358-lq.mp3"); // 仮のURL
Crafty.audio.add("moveSound", "https://freesound.org/data/previews/325/325438_4939433-lq.mp3"); // 仮のURL
Crafty.audio.add("blockBreakSound", "https://freesound.org/data/previews/107/107272_1205962-lq.mp3"); // 仮のURL

// 背景の設定
Crafty.background('skyblue');

// 地面の生成
Crafty.e('2D, Canvas, Color, Solid')
    .attr({ x: 0, y: Crafty.viewport.height - 50, w: Crafty.viewport.width, h: 50 })
    .color('green');

// プレイヤーキャラクターの定義（無敵状態）
let player = Crafty.e('2D, Canvas, PlayerSprite, Fourway, Gravity, Collision')
    .attr({ x: 100, y: Crafty.viewport.height - 100, w: 40, h: 40 })
    .fourway(200) // 移動速度
    .gravity('Solid') // 地面に立つ
    .gravityConst(500) // 重力の強さ
    .collision()
    .bind('EnterFrame', function() {
        // プレイヤーの無敵状態を維持
        this.z = 1; // プレイヤーを常に最前面に表示
    });

// 経験値の表示
let experience = 0;
let experienceText = Crafty.e('2D, DOM, Text')
    .attr({ x: 10, y: 10 })
    .text('経験値: ' + experience)
    .textColor('#FFFFFF')
    .textFont({ size: '20px', weight: 'bold' });

// プレイヤーの動作設定
document.getElementById('leftButton').addEventListener('click', function() {
    player.x -= 10; // 左へ移動
    Crafty.audio.play("moveSound"); // 移動音を再生
});

document.getElementById('rightButton').addEventListener('click', function() {
    player.x += 10; // 右へ移動
    Crafty.audio.play("moveSound"); // 移動音を再生
});

document.getElementById('jumpButton').addEventListener('click', function() {
    if (player.y >= Crafty.viewport.height - 100) { // 地面にいるときのみジャンプ
        player.y -= 100; // ジャンプ
        Crafty.audio.play("jumpSound"); // ジャンプ音を再生
    }
});

// ブロックの定義と管理
const blockTypes = blocks.length;
let blocksList = [];

function createBlock(x, y, id) {
    return Crafty.e(`2D, Canvas, ${id}, Collision`)
        .attr({ x: x, y: y, w: 40, h: 40 })
        .collision()
        .bind('Click', function() {
            // ブロックをクリックすると破壊
            Crafty.audio.play("blockBreakSound");
            this.destroy();
            experience += 10; // 経験値を増加
            experienceText.text('経験値: ' + experience);
        });
}

// 初期ブロックの配置（例としてランダムに配置）
for (let i = 0; i < 20; i++) {
    let x = Math.random() * (Crafty.viewport.width - 40);
    let y = Math.random() * (Crafty.viewport.height - 100);
    let type = blocks[Math.floor(Math.random() * blockTypes)].id;
    blocksList.push(createBlock(x, y, type));
}

// 敵キャラクター（ポーランドボール）の定義と追跡行動
let enemy = Crafty.e('2D, Canvas, EnemySprite, Collision')
    .attr({ x: 300, y: Crafty.viewport.height - 100, w: 40, h: 40 })
    .bind('EnterFrame', function() {
        if (this.x > player.x) {
            this.x -= 1; // プレイヤーに向かって移動
        } else {
            this.x += 1; // プレイヤーに向かって移動
        }
    })
    .onHit('PlayerSprite', function() {
        console.log('Hit by enemy!');
    });

// 経験値の増加ロジック（一定時間ごとに経験値が増加）
Crafty.bind('EnterFrame', function() {
    // 経験値を定期的に増加（例として1フレームごとに増加）
    experience += 1;
    experienceText.text('経験値: ' + experience);
});
