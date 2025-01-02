const activeSounds = []; // Tracks active sounds
let activeWaveSurfer = null; // Current waveform instance

function runAfterFinish() {
    console.log("runAfterFinish called");

    // Stop and remove all sounds from activeSounds
    activeSounds.forEach(sound => {
        if (sound.playing()) sound.stop();
    });
    activeSounds.length = 0; // Clear the array in place

    // Destroy the WaveSurfer instance
    if (activeWaveSurfer) {
        activeWaveSurfer.destroy();
        activeWaveSurfer = null;
    }

    console.log("All active sounds stopped and waveform removed. Current activeSounds:", activeSounds);
}

// Play sounds dynamically and create waveform
document.querySelectorAll('.button[data-sound]').forEach(button => {
    button.addEventListener('click', () => {
        const soundUrl = button.getAttribute('data-sound');
        const visualizerContainer = document.getElementById('visualizer-container');

        // Destroy the previous waveform if it exists
        if (activeWaveSurfer) {
            activeWaveSurfer.destroy();
            activeWaveSurfer = null;
        }

        // Stop and clear all previously active sounds
        activeSounds.forEach(sound => sound.stop());
        activeSounds.length = 0;

        // Create a new Howl instance for the current sound
        const sound = new Howl({
            src: [soundUrl],
            html5: true // Ensures compatibility with larger files
        });

        // Ensure the sound is loaded before playing
        sound.on('load', () => {
            console.log("Sound loaded, ready to play");
            sound.play();
            activeSounds.push(sound);
            console.log(activeSounds)

            // Create a new div for WaveSurfer and append it
            const waveformDiv = document.createElement('div');
            waveformDiv.className = 'waveform';
            visualizerContainer.innerHTML = ''; // Clear the container for the new visualizer
            visualizerContainer.appendChild(waveformDiv);

            // Initialize a new WaveSurfer instance for the current audio
            activeWaveSurfer = WaveSurfer.create({
                container: waveformDiv,
                waveColor: 'rgb(143, 143, 143)',
                progressColor: 'rgba(221, 221, 221, 1)',
                height: 100,
                responsive: true,
                cursorWidth: 0
            });

            // Load the waveform data
            activeWaveSurfer.load(soundUrl);

            // Sync the audio progress with the waveform once ready
            activeWaveSurfer.on('ready', () => {
                console.log("PLAYING SOUND!");
                const updateProgress = () => {
                    const duration = sound.duration();
                    if (duration && duration > 0) { // Ensure valid duration
                        const progress = sound.seek() / duration;
                        activeWaveSurfer.seekTo(progress);
                    }
                    if (sound.playing()) {
                        requestAnimationFrame(updateProgress); // Continuously update progress
                    }
                };
                updateProgress();
            });

            confetti({
                particleCount: 100,
                spread: 270,
                angle: -90,
                origin: { y: 0.0 }
              });
        });

        // Handle audio finishing
        sound.on('end', () => {
            // console.log("Audio finished!");
            activeSounds.pop()
            // console.log(activeSounds.length)
            if (activeSounds.length == 0) {
                runAfterFinish();
            }
            // runAfterFinish();
        });
    });
});

// Stop all active sounds and reset the waveform
document.getElementById('stop').addEventListener('click', () => {
    runAfterFinish();
});

// Fade out all active sounds and reset them
document.getElementById('fade').addEventListener('click', () => {
    activeSounds.forEach(sound => {
        sound.fade(1, 0, 500); // Fade volume from 1 to 0 over 0.5 seconds
        setTimeout(() => {
            sound.stop(); // Stop after fade completes
            sound.volume(1); // Reset volume to default for future playback
            activeWaveSurfer.destroy();
            activeWaveSurfer = null;
        }, 500);
    });
});