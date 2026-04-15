
const LoginVisualSection = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-20 overflow-hidden">
      {/* Background Image with sophisticated mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=2070&auto=format&fit=crop"
          alt="Elite Cycling"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 via-black/60 to-black z-10" />
        <div className="absolute inset-0 backdrop-blur-[2px] z-20" />
      </div>

      <div className="relative z-30 space-y-8 max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
            Global Marketplace Active
          </span>
        </div>

        <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
          Elevate Your <br />
          <span className="text-[#10B77F] drop-shadow-[0_0_15px_rgba(16,183,127,0.4)]">
            Ride.
          </span>
        </h2>

        <p className="text-xl text-gray-300 font-medium leading-relaxed">
          Join the elite circle of cyclists. Buy, sell, and discover premium
          machinery from around the globe.
        </p>

        <div className="pt-8 border-t border-white/10 flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden"
              >
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-white tracking-tight">
            <span className="text-emerald-400">12.4k+</span> active riders <br />
            <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">
              In your local sector
            </span>
          </p>
        </div>
      </div>

      {/* Abstract Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};

export default LoginVisualSection;
