const SignupVisualSection = () => {
  return (
    <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-center p-16 overflow-hidden">
      {/* Background Image with sophisticated mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop"
          alt="Community Riding"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 via-black/60 to-black z-10" />
        <div className="absolute inset-0 backdrop-blur-[2px] z-20" />
      </div>

      <div className="relative z-30 space-y-8 max-w-sm">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
            Join the Community
          </span>
        </div>

        <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
          Start Your <br />
          <span className="text-[#10B77F] drop-shadow-[0_0_15px_rgba(16,183,127,0.4)]">
            Journey.
          </span>
        </h2>

        <p className="text-lg text-gray-300 font-medium leading-relaxed">
          Join thousands of cyclists. Access curated listings and connect with
          the community in our premium network.
        </p>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?u=sign${i}`}
                    alt="user"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pl-2">
              Vanguard Riders
            </p>
          </div>
          <p className="text-xs font-bold text-white tracking-tight leading-relaxed">
            &ldquo;The most sophisticated trade platform I&apos;ve used. The
            community here is unmatched.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupVisualSection;
