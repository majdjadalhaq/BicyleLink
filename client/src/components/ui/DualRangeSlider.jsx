import { useState, useEffect } from "react";

const DualRangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value = [0, 100],
  onChange,
  formatValue = (v) => v,
  label = "",
  id = "dual-range",
}) => {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  const minId = `${id}-min`;
  const maxId = `${id}-max`;
  const minRangeId = `${id}-min-range`;
  const maxRangeId = `${id}-max-range`;

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value]);

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(val);
    onChange([val, localMax]);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(val);
    onChange([localMin, val]);
  };

  // Percentages for the track fill
  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-4 w-full py-2">
      {label && (
        <div className="flex justify-between items-center">
          <label
            htmlFor={minRangeId}
            className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
          >
            {label}
          </label>
          <div className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">
            {formatValue(localMin)} — {formatValue(localMax)}
          </div>
        </div>
      )}

      <div className="relative h-6 flex items-center group">
        {/* Track Background */}
        <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
          {/* Active Track Fill */}
          <div
            className="absolute h-full bg-emerald-500/50 dark:bg-emerald-500/30"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Real Sliders (Hidden but functional) */}
        <div className="absolute w-full h-full flex items-center pointer-events-none">
          <input
            id={minRangeId}
            name={minRangeId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMin}
            onChange={handleMinChange}
            aria-label={`${label} - Minimum`}
            className="absolute w-full h-1.5 opacity-0 pointer-events-auto cursor-pointer z-20"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
            }}
          />
          <input
            id={maxRangeId}
            name={maxRangeId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMax}
            onChange={handleMaxChange}
            aria-label={`${label} - Maximum`}
            className="absolute w-full h-1.5 opacity-0 pointer-events-auto cursor-pointer z-30"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
            }}
          />
        </div>

        {/* Visual Handles */}
        <div
          className="absolute w-5 h-5 bg-white dark:bg-gray-100 rounded-full border-2 border-emerald-500 shadow-md shadow-emerald-500/20 transform -translate-x-1/2 transition-transform active:scale-90 group-hover:scale-110 pointer-events-none z-10"
          style={{ left: `${minPercent}%` }}
        />
        <div
          className="absolute w-5 h-5 bg-white dark:bg-gray-100 rounded-full border-2 border-emerald-500 shadow-md shadow-emerald-500/20 transform -translate-x-1/2 transition-transform active:scale-90 group-hover:scale-110 pointer-events-none z-10"
          style={{ left: `${maxPercent}%` }}
        />
      </div>

      {/* Manual Inputs (Optional/Secondary) */}
      <div className="flex gap-3 mt-1">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
            Min
          </span>
          <label htmlFor={minId} className="sr-only">
            Minimum {label}
          </label>
          <input
            id={minId}
            name={minId}
            type="number"
            value={localMin}
            onChange={(e) => handleMinChange(e)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 transition-all focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
            Max
          </span>
          <label htmlFor={maxId} className="sr-only">
            Maximum {label}
          </label>
          <input
            id={maxId}
            name={maxId}
            type="number"
            value={localMax}
            onChange={(e) => handleMaxChange(e)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 transition-all focus:border-emerald-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default DualRangeSlider;
