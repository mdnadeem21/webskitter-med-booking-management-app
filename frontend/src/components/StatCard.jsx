function StatCard({ label, value, icon, color = "blue" }) {
    const colors = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      orange: "bg-orange-50 text-orange-600",
      red: "bg-red-50 text-red-600",
    };
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  }
export default StatCard;