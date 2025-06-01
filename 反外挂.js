// 定义常量，避免魔法数字
const MAX_SCALE = 1.5;
const MAX_SPEED = 0.35;
const MAX_HP = 20;

// 假设 GamePlayerMoveState 的定义如下
/**
 * @enum {number}
 */
const GamePlayerMoveState = {
    WALKING: 0,
    RUNNING: 1,
    FLYING: 2,
    SWIMMING: 3,
    CROUCHING: 4
};

// tps 计算
let tps = 0;
setInterval(() => {
    tps = 0; // Reset tps every second
}, 1000);

// 移动速度检测
const SPEED_WATCHDOG_INTERVAL = 200; // 检查间隔，单位毫秒
const SPEED_THRESHOLD = 10; // 速度阈值

/**
 * 计算两个 GameVector3 之间的距离
 * @param {GameVector3} pos1 
 * @param {GameVector3} pos2 
 * @returns {number}
 */
function calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// 主要的 onTick 监听器
world.onTick(() => {
    tps++; // Increment tps each tick

    world.querySelectorAll('player')
        .filter(entity => !entity.destroyed)
        .forEach((entity) => {
            if (!entity.player || ADMINS.includes(entity.player.name)) return;

            let kicked = false;

            // 缩放检测
            if (entity.meshScale && entity.meshScale.x >= MAX_SCALE) {
                entity.meshScale = new GameVector3(0.5, 0.5, 0.5);
                world.say(`${entity.player.name}因改变体型被踢出`);
                if (entity.player) {
                    entity.player.kick();
                }
                kicked = true;
            }

            // 飞行状态检测
            if (!kicked && entity.player.moveState === GamePlayerMoveState.FLYING) {
                if (entity.player) {
                    entity.player.canFly = false;
                    world.say(`${entity.player.name}因非法飞行被踢出`);
                    entity.player.kick();
                }
                kicked = true;
            }

            // 移动速度检测
            if (!kicked && entity.player.runSpeed > MAX_SPEED) {
                if (entity.player) {
                    entity.player.runSpeed = MAX_SPEED;
                    world.say(`${entity.player.name}因加速被踢出`);
                    entity.player.kick();
                }
                kicked = true;
            }

            // 生命值检测
            if (!kicked && entity.hp > MAX_HP) {
                if (entity.player) {
                    entity.hp = MAX_HP;
                    world.say(`${entity.player.name}因修改血条被踢出`);
                    entity.player.kick();
                }
            }
        });
});