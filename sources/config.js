module.exports = {
    tile_size: 16,
    level: {
        width: 0,
        height: 0,
    },
    player: {
        width: 16,
        height: 20,
        speed: 120,
        acceleration: 1080,
        gravity_acceleration: 1080,
        fall_gravity: 90,
        max_gravity: 666,
        jump_speed: 222,
        high_jump_gravity_factor: 0.5,
        late_jump_duration: 0.05,
        early_jump_duration: 0.07,
        sliding_factor: 0.75,
        jump_off_walls_duration: 0.12,
        jump_off_walls_speed: 150,
        post_jump_slowdown_factor: 0.9,
        post_jump_sliding_factor: 0.6,
        post_jump_slowdown_duration: 0.5,
    },
    spiky: {
        width: 14,
        height: 13,
        speed: 60,
    },
    flying: {
        width: 16,
        height: 16,
        speed: 60,
        projectile_speed: 120,
        projectile_size: 8,
        projectile_cooldown: 0.75,
        attack_area_width: 50,
        attack_area_height: 1000,
    },
    cloud: {
        width: 30,
        height: 10,
        speed: 60,
    },
    block_falling: {
        destroy_timeout: 0.5,
        respawn_timeout: 2,
    }
};
