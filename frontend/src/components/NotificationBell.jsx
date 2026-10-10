import { useState, useRef, useEffect } from "react";

const DUMMY_NOTIFICATIONS = [
  { id: 1, icon: "✅", title: "Appointment Confirmed", desc: "Dr. Sonam — Oct 10, 09:00 slot confirmed.", time: "2 min ago", unread: true },
  { id: 2, icon: "⏰", title: "Upcoming Tomorrow", desc: "Kal 11:30 AM pe Dr. Abid ka appointment hai.", time: "1 hr ago", unread: true },
  { id: 3, icon: "💳", title: "Payment Successful", desc: "₹500 consultation fee paid.", time: "Yesterday", unread: false },
  { id: 4, icon: "🩺", title: "New Report Available", desc: "Aapka blood test report upload ho gaya.", time: "2 days ago", unread: false },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Outside click pe dropdown band
  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <div className="relative" ref={ref}>
      {/* BELL BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 text-xl"
        title="Notifications"
      >
        🔔
        {/* UNREAD BADGE */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* LIST */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications
              </p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer
                    ${n.unread ? "bg-blue-50/50" : ""}`}
                >
                  <span className="text-lg">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      {n.title}
                      {n.unread && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{n.desc}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default NotificationBell;