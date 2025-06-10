class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private isMuted: boolean = false;

  private constructor() {
    // Initialize sound effects
    this.sounds = {
      correct: new Audio('/sounds/correct.mp3'),
      incorrect: new Audio('/sounds/incorrect.mp3'),
      tick: new Audio('/sounds/tick.mp3'),
      levelComplete: new Audio('/sounds/level-complete.mp3'),
      achievement: new Audio('/sounds/achievement.mp3'),
      buttonClick: new Audio('/sounds/click.mp3'),
    };

    // Preload all sounds
    Object.values(this.sounds).forEach(audio => {
      audio.load();
    });
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public play(soundName: string) {
    if (this.isMuted || !this.sounds[soundName]) return;

    // Stop the sound if it's already playing
    this.sounds[soundName].currentTime = 0;
    
    // Play the sound
    this.sounds[soundName].play().catch(err => {
      console.log('Error playing sound:', err);
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    Object.values(this.sounds).forEach(audio => {
      audio.volume = Math.max(0, Math.min(1, volume));
    });
  }
} 