const load_sounds = function() {
    function load_sound(name, volume = 1.0, extension = "wav", loop = false) {
        sounds.total_count++;
        sounds[name] = new Howl({
            src: [ `sounds/${name}.${extension}` ],
            autoplay: loop,
            loop: loop,
            volume: volume,
            onload: function() {
                if (++sounds.loaded_count === sounds.total_count) {
                    const temp = sounds.on_load;

                    delete sounds.load;
                    delete sounds.on_load;
                    delete sounds.total_count;
                    delete sounds.loaded_count;

                    temp && temp();
                }
            }
        });
    }

    load_sound("music", 1, "mp3", true);
    load_sound("block_unstable", 5);
    load_sound("death", 1);
    load_sound("Explosion4", 1);
    load_sound("Jump8", 1);
    load_sound("Laser_Shoot8", 1);
    load_sound("Pickup_Coin9", 1);
    load_sound("step", 8);
    load_sound("wall_grab", 3);
    load_sound("cloud", 1);
};

const sounds = {
    load: load_sounds,
    on_load: null,
    total_count: 0,
    loaded_count: 0,
};

module.exports = sounds;
