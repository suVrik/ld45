const load_sounds = function() {
    function load_sound(name, volume = 1.0) {
        sounds.total_count++;
        sounds[name] = new Howl({
            src: [ `sounds/${name}.wav` ],
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

    // TODO: WHEN AT LEAST ONE SOUND IS PRESET CALL LOAD_SOUNDS AND REMOVE THIS.
    sounds.on_load();
};

const sounds = {
    load: load_sounds,
    on_load: null,
    total_count: 0,
    loaded_count: 0,
};

module.exports = sounds;
