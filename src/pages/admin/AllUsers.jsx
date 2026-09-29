import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const AllUsers = () => {
  const [allUser, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/getAllUsers?searchTerm=${search}`);
      const data = await res.json();

      if (data && data?.success === false) {
        setLoading(false);
        setError(data?.message);
      } else {
        setLoading(false);
        setAllUsers(data);
        setError(false);
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    getUsers();
  }, [search]);

  const handleUserDelete = async (userId) => {
    const CONFIRM = window.confirm("Are you sure? the account will be permanently deleted!");
    if (CONFIRM) {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/delete-user/${userId}`, { method: "DELETE" });
        const data = await res.json();
        if (data?.success === false) {
          setLoading(false);
          toast.error("Something went wrong!");
          return;
        }
        setLoading(false);
        toast.success(data?.message);
        getUsers();
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <input className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#EB662B]" type="text" placeholder="Search Users by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Total Users: {allUser.length}</h2>
          {error && <p className="text-red-500 font-bold">{error}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Address</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500 font-bold">Loading Users...</td></tr>
              ) : allUser.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500 font-bold">No users found.</td></tr>
              ) : (
                allUser.map((user, i) => (
                  <tr key={user._id || i} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-800">{user.username}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">{user.address || "N/A"}</td>
                    <td className="p-4 text-gray-600">{user.phone || "N/A"}</td>
                    <td className="p-4 text-center">
                      <button disabled={loading} className="p-2 text-red-500 hover:text-red-700 transition hover:scale-110 disabled:opacity-50" onClick={() => handleUserDelete(user._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;