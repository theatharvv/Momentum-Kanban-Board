import axios from "axios";
import { useEffect, useState } from "react";

const BoardAuditLogs = ({ boardId }) => {
  const token = localStorage.getItem("token");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAuditLogs = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/boards/${boardId}/audit`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (mounted) setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Error fetching board audit logs:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (boardId) fetchAuditLogs();
    return () => { mounted = false; };
  }, [boardId, token]);

  if (loading) {
    return (
      <div className="h-[300px] rounded-2xl bg-[#F0EFEF] border border-black/5 shadow-sm p-6 flex items-center justify-center">
        <p className="text-gray-600 font-ibmPlexSans">Loading board audit logs…</p>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="rounded-2xl h-[286px] bg-white border border-black/5 shadow-xl flex items-center justify-center">
        <p className="text-gray-500 text-sm font-ibmPlexSans">No audit logs for this board.</p>
      </div>
    );
  }

  return (
    <div
      className="mt-4 rounded-2xl h-[286px] overflow-y-auto bg-white border border-black/5 shadow-xl
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:bg-neutral-300
      hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
      [&::-webkit-scrollbar-thumb]:rounded-full"
    >
      <div className="p-3 sticky top-0 bg-[#e95e19] text-white border-b border-black/10">
        <h2 className="font-semibold font-ibmPlexSans text-lg">· Audit Logs</h2>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {logs.map((log) => (
          <div
            key={log._id}
            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-200 border border-black/10 hover:shadow transition-shadow"
          >
            <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium bg-neutral-700 shrink-0">
              {formatAction(log.action)}
            </span>

            <p className="text-gray-800 text-[14px] font-ibmPlexSans truncate">
              by {log.user?.name || log.userName || "Unknown"}
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-gray-500" title={new Date(log.timestamp).toLocaleString()}>
                {timeAgo(log.timestamp)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Minimal helpers
function formatAction(a) {
  if (!a) return "Action";
  const s = String(a);
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

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

export default BoardAuditLogs;
