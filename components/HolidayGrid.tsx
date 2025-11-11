import Link from 'next/link';

export interface Holiday {
  id: string;
  name: string;
  icon: string;
  slug: string;
  color: string;
}

export const holidays: Holiday[] = [
  { id: '1', name: "New Year", icon: "🎆", slug: "new-year", color: "from-blue-400 to-purple-500" },
  { id: '2', name: "Valentine's", icon: "💝", slug: "valentines", color: "from-pink-400 to-red-500" },
  { id: '3', name: "Lunar New Year", icon: "🧧", slug: "lunar-new-year", color: "from-red-500 to-yellow-500" },
  { id: '4', name: "Easter Day", icon: "🐰", slug: "easter", color: "from-green-400 to-blue-400" },
  { id: '5', name: "Dragon Boat", icon: "🐉", slug: "dragon-boat", color: "from-emerald-400 to-teal-500" },
  { id: '6', name: "Mother's/Father's Day", icon: "👨‍👩‍👧‍👦", slug: "parents-day", color: "from-orange-400 to-pink-400" },
  { id: '7', name: "Independence Day", icon: "🎆", slug: "independence-day", color: "from-blue-600 to-red-600" },
  { id: '8', name: "Birthday", icon: "🎂", slug: "birthday", color: "from-purple-400 to-pink-500" },
  { id: '9', name: "Mid Autumn", icon: "🥮", slug: "mid-autumn", color: "from-yellow-500 to-orange-500" },
  { id: '10', name: "Halloween", icon: "🎃", slug: "halloween", color: "from-orange-600 to-purple-700" },
  { id: '11', name: "Thanksgiving", icon: "🦃", slug: "thanksgiving", color: "from-amber-600 to-orange-700" },
  { id: '12', name: "Christmas Day", icon: "🎄", slug: "christmas", color: "from-green-600 to-red-600" },
];

interface HolidayGridProps {
  compact?: boolean;
}

export default function HolidayGrid({ compact = false }: HolidayGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {holidays.map((holiday) => (
        <Link
          key={holiday.id}
          href={`/holiday/${holiday.slug}`}
          className="group"
        >
          <div className={`relative bg-gradient-to-br ${holiday.color} rounded-2xl aspect-square flex flex-col items-center justify-center p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105`}>
            {/* Icon */}
            <div className="text-5xl md:text-6xl mb-3 transform group-hover:scale-110 transition-transform">
              {holiday.icon}
            </div>
            
            {/* Name */}
            <h3 className="text-white font-bold text-center text-sm md:text-base leading-tight drop-shadow-lg">
              {holiday.name}
            </h3>
            
            {/* Hover Arrow */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

