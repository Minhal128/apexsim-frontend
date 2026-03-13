interface ActivityDetailProps {
  onBack: () => void;
}

export default function ActivityDetail({ onBack }: ActivityDetailProps) {
  return (
    <div className="flex-1 animate-in fade-in duration-500 px-4 md:pr-8 md:pl-0">

      <nav className="
        flex flex-wrap items-center gap-1
        text-xs sm:text-[15px]
        mb-4
      ">
        <span
          className="text-gray-500 cursor-pointer hover:text-white"
          onClick={onBack}
        >
          Learn
        </span>
        <span className="text-gray-500">{">"}</span>
        <span
          className="text-gray-500 cursor-pointer hover:text-white"
          onClick={onBack}
        >
          Latest activities
        </span>
        <span className="text-gray-500">{">"}</span>
        <span className="text-white font-medium">Current page</span>
      </nav>

      <div className="space-y-3 mb-6 text-center md:text-left">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight leading-snug">
          Top-up with $100 and get $30 in BTC
        </h1>

        <span className="inline-block bg-[#222222] text-gray-400 text-xs sm:text-sm px-3 py-1 rounded">
          Jan 23
        </span>
      </div>

      {/* Hero Image */}
      <div className="
        w-full
        bg-[#232323]
        rounded-lg
        border border-white/5
        flex items-center justify-center
        px-4 py-8 sm:p-12
        mb-6
      ">
        <img
          src="/images/learnsection.png"
          alt="BTC Reward"
          className="
            w-full max-w-55
            sm:max-w-70
            md:w-64 md:h-64
            object-contain
          "
        />
      </div>

      {/* Content Body */}
      <div className="
        text-gray-50
        text-base sm:text-lg
        leading-relaxed
        max-w-3xl
        space-y-4 sm:space-y-6
      ">
        <p>
          NL new users who top up €100 and trade enjoy a $30 BTC reward — first come,
          first serve!
        </p>

        <p>
          There's never been an easier way to instantly earn BTC rewards — top up on
          Bybit EU now!
        </p>

        <div className="space-y-2">
          <h3 className="text-white font-semibold text-base sm:text-lg">
            Terms and Conditions
          </h3>

          <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <li>- This event is open only to new users from the Netherlands on Bybit EU.</li>
            <li>- Users must register for the event using the Register Now button to be eligible for rewards.</li>
            <li>- Rewards are limited and will be distributed on a first-come, first-served basis.</li>
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <button
        className="
          mt-10
          w-full sm:w-auto
          bg-[#0055FF]
          text-white
          px-6 sm:px-20
          py-3
          rounded-sm
          text-sm
          cursor-pointer
          shadow-lg shadow-blue-500/20
        "
      >
        Register
      </button>
    </div>
  );
}
