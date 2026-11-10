import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Radio, Volume2 } from 'lucide-react';

const STATIONS = [
  { id: 'groove', name: 'Groove Salad', note: 'Easy listening', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'drone', name: 'Drone Zone', note: 'Calm focus', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
  { id: 'lush', name: 'Lush', note: 'Chill vocals', url: 'https://ice1.somafm.com/lush-128-mp3' },
  { id: 'indie', name: 'Indie Pop Rocks', note: 'Upbeat', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
  { id: 'seventies', name: 'Left Coast 70s', note: 'Mellow classics', url: 'https://ice1.somafm.com/seventies-128-mp3' }
];

const STATION_KEY = 'cs-today-radio-station';
const VOLUME_KEY = 'cs-today-radio-volume';

export default function TodayRadio() {
  const [stationId, setStationId] = useState(() => {
    const saved = localStorage.getItem(STATION_KEY);
    return STATIONS.some((item) => item.id === saved) ? saved : STATIONS[0].id;
  });
  const [volume, setVolume] = useState(() => {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(saved) && saved > 0 ? Math.min(saved, 1) : 0.55;
  });
  const [playing, setPlaying] = useState(false);
  const [note, setNote] = useState('');
  const audioRef = useRef(null);

  const station = useMemo(() => STATIONS.find((item) => item.id === stationId) || STATIONS[0], [stationId]);

  useEffect(() => {
    localStorage.setItem(STATION_KEY, stationId);
  }, [stationId]);

  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, String(volume));
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!playing) {
      audio.pause();
      return;
    }
    setNote('Tuning in…');
    const attempt = audio.play();
    if (attempt?.catch) {
      attempt.catch(() => {
        setPlaying(false);
        setNote('This station would not start — try another.');
      });
    }
  }, [playing, stationId]);

  const step = (delta) => {
    const index = STATIONS.findIndex((item) => item.id === stationId);
    setStationId(STATIONS[(index + delta + STATIONS.length) % STATIONS.length].id);
  };

  return (
    <div className="t-radio" role="group" aria-label="Music radio">
      <button
        type="button"
        onClick={() => setPlaying((value) => !value)}
        className="t-radio-toggle"
        aria-label={playing ? 'Pause radio' : 'Play radio'}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <div className="t-radio-meta">
        <p className="t-radio-label">
          <Radio className="h-3 w-3" /> Radio
          <span className={playing ? 't-radio-live is-on' : 't-radio-live'}>{playing ? 'live' : 'off air'}</span>
        </p>
        <p className="t-radio-station">
          {station.name}
          <span className="t-radio-note"> · {note || station.note}</span>
        </p>
      </div>

      <div className="t-radio-controls">
        <button type="button" onClick={() => step(-1)} className="t-radio-step" aria-label="Previous station">
          <SkipBack className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => step(1)} className="t-radio-step" aria-label="Next station">
          <SkipForward className="h-3.5 w-3.5" />
        </button>
        <select
          value={stationId}
          onChange={(event) => setStationId(event.target.value)}
          className="t-radio-select"
          aria-label="Choose a station"
        >
          {STATIONS.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <label className="t-radio-volume">
          <Volume2 className="h-3.5 w-3.5" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Radio volume"
          />
        </label>
      </div>

      <audio
        ref={audioRef}
        src={station.url}
        preload="none"
        onPlaying={() => {
          setNote('');
          setPlaying(true);
        }}
        onError={() => {
          setPlaying(false);
          setNote('Stream unavailable right now.');
        }}
      />
    </div>
  );
}