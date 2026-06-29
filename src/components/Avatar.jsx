export default function Avatar({ name, avatar, size = 'w-12 h-12' }) {
  return (
    <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0 overflow-hidden`}>
      {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() || '?')}
    </div>
  );
}
