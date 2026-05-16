// src/audio/AudioLoop.jsx
import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

export default function AudioLoop({ src = '/audio/soul_tempering_v0.mp3', volume = 0.6 }) {
  const howlRef = useRef(null);

  useEffect(() => {
    const sound = new Howl({
      src: [src],
      loop: true,
      volume,
      autoplay: true,
      html5: true // important: streamed audio doesn't fully buffer at start
    });
    howlRef.current = sound;
    return () => { sound.unload(); };
  }, [src, volume]);

  return null;
}
