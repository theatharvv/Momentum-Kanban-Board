import axios from "axios";
import { useEffect, useState } from "react";

const RecentBoards = () => {
  const token = localStorage.getItem("token");
  const [boards, setBoards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/audit/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setBoards(res.data || {});
      } catch (e) {
        console.error("Error fetching user data:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [token]);

  if (loading) {
    return (
      <div className="h-[300px] rounded-2xl bg-[#F0EFEF] border border-black/5 shadow-sm p-6 flex items-center justify-center">
        <p className="text-gray-600 font-ibmPlexSans">Loading recent activity…</p>
      </div>
    );
  }

  const entries = Object.entries(boards);

  const isEmpty = entries.length === 0 || entries.every(([, logs]) => !logs?.length);

  return (
    <div
      className="
        rounded-2xl h-[286px] overflow-y-auto bg-white border border-black/5 shadow-xl
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-neutral-300
        hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
        [&::-webkit-scrollbar-thumb]:rounded-full
      "
    >
      {/* Header */}
      <div className="p-3 sticky top-0 bg-[#e95e19] text-white border-b border-black/10">
        <h2 className="font-semibold font-ibmPlexSans text-lg">Recent Boards · Activity</h2>
      </div>

      <div className="p-4 space-y-3">
        {isEmpty ? (
          <div className="h-40 grid place-items-center">
            <p className="text-gray-500 text-sm font-ibmPlexSans">No recent activity.</p>
          </div>
        ) : (
          entries.map(([boardId, logs]) => {
            // Render in API order; assume logs is an array already ordered by backend
            const firstLog = Array.isArray(logs) && logs.length ? logs : null;
            const boardTitle = firstLog[0]?.details?.title || "Untitled Board";
            const show = Array.isArray(logs) ? logs.slice(0, 2) : [];

            return (
              <div
                key={boardId}
                className="p-4 rounded-xl bg-slate-200 border-2 border-black/5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900 font-medium font-ibmPlexSans">{boardTitle}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e95e19]/10 text-[#e95e19] border border-[#e95e19]/30">
                    {Array.isArray(logs) ? logs.length : 0} updates
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {show.map((log) => (
                    <div key={log._id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#e95e19] text-white grid place-items-center text-base font-semibold border-2 border-white">
                        {(log.userName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-800 text-sm font-ibmPlexSans truncate">
                          <span className="capitalize">{log.action}</span> by{" "}
                          <span className="font-medium">{log.userName}</span>
                        </p>
                        <p className="text-gray-500 text-xs">
                          {log.details?.description || ""} <span className="mx-1">•</span>
                          <span title={new Date(log.timestamp).toLocaleString()}>
                            {timeAgo(log.timestamp)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button className="text-[12px] font-medium text-[#e95e19] hover:text-[#c64c14]">
                    View board
                  </button>
                  <div className="text-[11px] text-gray-500">
                    Last update {timeAgo(firstLog?.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Helpers
function timeAgo(ts) {
  if (!ts) return "unknown";
  const diff = Math.max(0, Date.now() - new Date(ts).getTime());
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return `${s}s ago`;
}

export default RecentBoards;
