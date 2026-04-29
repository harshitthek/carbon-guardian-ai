import React, { useState, useEffect, useRef } from 'react';
import { locationService } from '../../services/locationService';
import { MapPin, Target, Navigation, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
    <Card className="p-4 space-y-4 shadow-sm border-slate-200">
      <div className="relative z-20">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">From</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input
               type="text"
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
               placeholder="Current Location or Address"
               value={source}
               onChange={(e) => {
                 setSource(e.target.value);
                 setSourceCoords(null);
               }}
             />
             {sourceResults.length > 0 && (
               <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
                 {sourceResults.map((r, i) => (
                   <li key={i} onClick={() => selectSource(r)} className="px-4 py-2 hover:bg-slate-50 text-sm cursor-pointer truncate">
                     {r.name}
                   </li>
                 ))}
               </ul>
             )}
          </div>
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            title="Detect Location"
          >
            {isDetecting ? <div className="w-4 h-4 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin" /> : <Navigation className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">To</label>
        <div className="relative">
           <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <input
             type="text"
             className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
             placeholder="Destination Address"
             value={destination}
             onChange={(e) => {
               setDestination(e.target.value);
               setDestCoords(null);
             }}
           />
           {destResults.length > 0 && (
             <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
               {destResults.map((r, i) => (
                 <li key={i} onClick={() => selectDestination(r)} className="px-4 py-2 hover:bg-slate-50 text-sm cursor-pointer truncate">
                   {r.name}
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    </Card>
  );
}
