import React, { useState, useEffect, useRef } from 'react';
import { locationService } from '../../services/locationService';
import { MapPin, Target, Navigation, Search } from 'lucide-react';

export function LocationInput({ onSourceChange, onDestinationChange }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [sourceResults, setSourceResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const coords = await locationService.getCurrentPosition();
      setSourceCoords(coords);
      const city = await locationService.getCityName(coords.lat, coords.lon);
      setSource(city);
      onSourceChange({ name: city, ...coords });
    } catch (error) {
      console.error(error);
      alert('Could not detect location. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Debounced search for source
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (source.length > 2 && !sourceCoords) {
        const results = await locationService.searchPlaces(source);
        setSourceResults(results);
      } else {
        setSourceResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [source, sourceCoords]);

  // Debounced search for destination
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destination.length > 2 && !destCoords) {
        const results = await locationService.searchPlaces(destination);
        setDestResults(results);
      } else {
        setDestResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [destination, destCoords]);

  const selectSource = (place) => {
    setSource(place.name);
    setSourceCoords({ lat: place.lat, lon: place.lon });
    setSourceResults([]);
    onSourceChange(place);
  };

  const selectDestination = (place) => {
    setDestination(place.name);
    setDestCoords({ lat: place.lat, lon: place.lon });
    setDestResults([]);
    onDestinationChange(place);
  };

  return (
    <div className="glass-card p-6 space-y-5 border-[var(--glass-border)]">
      <div className="relative z-20">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 block">From</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
             <input
               type="text"
               className="w-full pl-10 pr-4 py-3 bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-primary)] focus:border-[var(--eco-neon)] outline-none transition-all mono"
               placeholder="Current Location or Address"
               value={source}
               onChange={(e) => {
                 setSource(e.target.value);
                 setSourceCoords(null);
               }}
             />
             {sourceResults.length > 0 && (
               <ul className="absolute top-full left-0 right-0 mt-1 bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                 {sourceResults.map((r, i) => (
                   <li key={i} onClick={() => selectSource(r)} className="px-4 py-3 hover:bg-white/5 text-sm cursor-pointer truncate text-[var(--text-primary)] border-b border-[var(--glass-border)] last:border-0">
                     {r.name}
                   </li>
                 ))}
               </ul>
             )}
          </div>
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="px-4 py-3 bg-[var(--eco-surface)] text-[var(--eco-neon)] hover:bg-[var(--eco-surface-2)] rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 border border-[var(--glass-border)]"
            title="Detect Location"
          >
            {isDetecting ? <div className="w-4 h-4 rounded-full border-2 border-[var(--eco-neon)] border-t-transparent animate-spin" /> : <Navigation size={16} />}
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 block">To</label>
        <div className="relative">
           <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
           <input
             type="text"
             className="w-full pl-10 pr-4 py-3 bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-primary)] focus:border-[var(--eco-neon)] outline-none transition-all mono"
             placeholder="Destination Address"
             value={destination}
             onChange={(e) => {
               setDestination(e.target.value);
               setDestCoords(null);
             }}
           />
           {destResults.length > 0 && (
             <ul className="absolute top-full left-0 right-0 mt-1 bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
               {destResults.map((r, i) => (
                 <li key={i} onClick={() => selectDestination(r)} className="px-4 py-3 hover:bg-white/5 text-sm cursor-pointer truncate text-[var(--text-primary)] border-b border-[var(--glass-border)] last:border-0">
                   {r.name}
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
}

