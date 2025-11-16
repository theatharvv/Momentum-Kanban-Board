import { useState } from 'react';
import { UserPlus, X, Loader2 } from 'lucide-react';

const BoardMembers = ({ members = [], boardId, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  console.log(boardId);

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth storage
      
      const response = await fetch(`http://localhost:5000/api/v1/boards/${boardId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Adjust based on your auth header format
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to add member');
      }

      setSuccess('Member added successfully!');
      setEmail('');
      setShowForm(false);
      
      // Callback to refresh the board data
      if (onMemberAdded) {
        onMemberAdded(data.board);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mt-3 rounded-2xl h-[286px] overflow-y-auto bg-white border border-black/5 shadow-xl
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:bg-neutral-300
      hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
      [&::-webkit-scrollbar-thumb]:rounded-full"
    >
      <div className="p-3 sticky top-0 bg-[#e95e19] text-white border-b border-black/10 z-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">· Board Members</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Add member"
          >
            {showForm ? <X size={18} /> : <UserPlus size={18} />}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddMember} className="mt-3 space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 rounded-lg text-sm text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/50 outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-3 py-2 bg-white text-[#e95e19] rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </button>
          </form>
        )}
      </div>

      <div className="px-3 py-2">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-xs">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        )}

        {members.map((m, idx) => {
          const name = m?.name?.trim?.() || "Unknown";
          const email = m?.email || "—";
          const initial = (name.charAt(0) || "?").toUpperCase();
          const showDivider = idx !== members.length - 1;

          return (
            <div key={m._id}>
              <div className="flex items-center gap-3 py-2">
                {m?.profilePic ? (
                  <img
                    src={m.profilePic}
                    alt={name}
                    className="h-9 w-9 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#e95e19] text-white grid place-items-center text-sm font-semibold border-2 border-white">
                    {initial}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-gray-800 text-sm font-medium truncate">{name}</p>
                  <p className="text-gray-500 text-xs truncate">{email}</p>
                </div>

                {m?.role && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-neutral-700 text-white">
                    {m.role}
                  </span>
                )}
              </div>

              {showDivider && <div className="h-px bg-black/5 ml-12" />}
            </div>
          );
        })}

        {!members.length && (
          <div className="h-[230px] flex items-center justify-center">
            <p className="text-gray-500 text-sm">No members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardMembers;