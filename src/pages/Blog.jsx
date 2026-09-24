import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaSpinner, FaHeart, FaComment, FaImage, FaUserFriends, FaBookOpen, FaPaperPlane } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// -----------------------------------------------------------------------------
// TravelEase Community Blog & Partner Matching
// -----------------------------------------------------------------------------

const REMOTE_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=90",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=90"
];

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "https://via.placeholder.com/150";
  return avatarPath.startsWith("http") ? avatarPath : `http://localhost:8000/images/${avatarPath}`;
};

const categoryClass = (category) => {
  switch (category) {
    case "PartnerRequest":
      return "bg-purple-100 text-[#6358DC]";
    case "Diary":
      return "bg-orange-100 text-[#EB662B]";
    default:
      return "bg-emerald-100 text-emerald-600";
  }
};

const Blog = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  // Post Creation State
  const [newPost, setNewPost] = useState({ title: "", content: "", destination: "", type: "Diary" });
  const [imageFile, setImageFile] = useState(null);

  // Comment Section State
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const typeQuery = activeTab !== "All" ? `?type=${activeTab}` : "";
      const res = await fetch(`/api/community/posts${typeQuery}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Community fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Please login to share a post.");
    
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    formData.append("destination", newPost.destination);
    formData.append("type", newPost.type);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/community/posts/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Posted successfully!");
        setNewPost({ title: "", content: "", destination: "", type: "Diary" });
        setImageFile(null);
        fetchPosts();
      }
    } catch (error) {
      toast.error("Failed to create post.");
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) return toast.error("Login required to like.");
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, { method: "PUT", credentials: "include" });
      const data = await res.json();
      if (data.success) fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      const data = await res.json();
      if (data.success) setComments(data.comments);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Login required.");
    if (!newComment.trim()) return;
    
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setNewComment("");
        fetchPosts(); 
      }
    } catch (error) {
      toast.error("Failed to post comment.");
    }
  };

  return (
    <main className="w-full bg-[#f7f8fc] min-h-screen">
      {/* Hero Section */}
      <section className="pt-14 md:pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-4 mb-4"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="hidden sm:block w-10 h-[2px] bg-[#EB662B]" />
            <span className="text-[#EB662B] text-sm md:text-base font-bold tracking-[0.18em] uppercase">
              Traveler Community
            </span>
            <span className="hidden sm:block w-10 h-[2px] bg-[#EB662B]" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#05073C] leading-tight"
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Welcome to <span className="text-[#EB662B]">TravelEase</span> Social
          </motion.h1>

          <motion.p
            className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Share your travel diaries, get inspired by others, or find the perfect companion for your next adventure.
          </motion.p>
        </div>
      </section>

      {/* Post Creation Box */}
      <section className="px-4 sm:px-6 mb-12">
        <div className="max-w-4xl mx-auto">
          {currentUser ? (
            <motion.form 
              onSubmit={handlePostSubmit} 
              className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex gap-4 mb-2">
                <button type="button" onClick={() => setNewPost({...newPost, type: "Diary"})} className={`flex-1 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 ${newPost.type === "Diary" ? "bg-[#EB662B] text-white shadow-md" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                  <FaBookOpen /> Travel Diary
                </button>
                <button type="button" onClick={() => setNewPost({...newPost, type: "PartnerRequest"})} className={`flex-1 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 ${newPost.type === "PartnerRequest" ? "bg-[#6358DC] text-white shadow-md" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                  <FaUserFriends /> Find Partner
                </button>
              </div>
              
              <div className="flex gap-4 flex-col md:flex-row">
                <input type="text" placeholder="Title of your post..." value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="flex-[2] p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#EB662B] transition" required />
                <input type="text" placeholder="Destination (e.g., Sylhet)" value={newPost.destination} onChange={e => setNewPost({...newPost, destination: e.target.value})} className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#EB662B] transition" required />
              </div>
              
              <textarea placeholder={newPost.type === "Diary" ? "Share your travel story..." : "Describe the trip and who you are looking for..."} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#EB662B] transition resize-none h-32" required />
              
              <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                <label className="cursor-pointer text-gray-500 hover:text-[#EB662B] flex items-center gap-2 font-bold transition px-4 py-2 rounded-xl hover:bg-orange-50">
                  <FaImage size={20} /> {imageFile ? "Image Selected" : "Attach Photo"}
                  <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                </label>
                <button type="submit" className="bg-[#EB662B] text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-700 transition shadow-md hover:shadow-lg">Publish Post</button>
              </div>
            </motion.form>
          ) : (
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-4 font-medium">Join the community to share your stories.</p>
              <Link to="/login" className="inline-flex text-[#EB662B] font-bold hover:underline">Log in to create a post</Link>
            </div>
          )}
        </div>
      </section>

      {/* Blog Cards & Feed */}
      <section className="pb-14 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Feed Filters */}
          <div className="flex justify-center gap-6 mb-10 border-b border-gray-200 pb-4">
            {["All", "Diary", "PartnerRequest"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`font-bold pb-2 transition relative ${activeTab === tab ? "text-[#05073C]" : "text-gray-400 hover:text-gray-600"}`}>
                {tab === "PartnerRequest" ? "Partner Requests" : tab === "Diary" ? "Travel Diaries" : "All Posts"}
                {activeTab === tab && (
                  <motion.div layoutId="underline" className="absolute left-0 right-0 bottom-0 h-1 bg-[#EB662B] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-3 text-[#05073C] font-semibold">
                <FaSpinner className="animate-spin text-[#EB662B]" /> Loading community feed...
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-medium">No posts found in this category. Be the first to post!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {posts.map((post, index) => {
                const isLiked = post.likes.includes(currentUser?._id);
                const displayImage = post.image ? `http://localhost:8000/images/${post.image}` : REMOTE_FALLBACK_IMAGES[index % REMOTE_FALLBACK_IMAGES.length];
                
                return (
                  <motion.article
                    key={post._id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Post Cover Image */}
                    <div className="relative w-full h-56 overflow-hidden bg-gray-200 shrink-0">
                      <img src={displayImage} alt="Post Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${categoryClass(post.type)}`}>
                          {post.type === "PartnerRequest" ? "Looking for Partner" : "Travel Diary"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <img src={getAvatarUrl(post.author?.avatar)} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{post.author?.username}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <h2 className="text-xl font-extrabold text-[#05073C] leading-tight mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">📍 {post.destination}</p>
                      
                      <p className="text-gray-600 leading-relaxed text-sm line-clamp-3 mb-4 flex-1">
                        {post.content}
                      </p>

                      {/* Actions (Like/Comment) */}
                      <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex gap-4">
                          <button onClick={() => handleLike(post._id)} className={`flex items-center gap-1.5 font-bold text-sm transition ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}>
                            <FaHeart /> {post.likes.length}
                          </button>
                          <button onClick={() => toggleComments(post._id)} className="flex items-center gap-1.5 font-bold text-sm text-gray-400 hover:text-[#6358DC] transition">
                            <FaComment /> {post.commentCount}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Comments Panel */}
                      {expandedPost === post._id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: "auto" }} 
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <div className="max-h-40 overflow-y-auto pr-2 flex flex-col gap-3 mb-3 custom-scrollbar">
                            {comments.length === 0 ? (
                              <p className="text-xs text-center text-gray-400 font-medium">No comments yet. Be the first!</p>
                            ) : (
                              comments.map(c => (
                                <div key={c._id} className="flex gap-2 items-start">
                                  <img src={getAvatarUrl(c.author?.avatar)} alt="avt" className="w-6 h-6 rounded-full object-cover shrink-0" />
                                  <div className="bg-gray-50 rounded-xl p-2.5 flex-1">
                                    <span className="font-bold text-xs text-gray-900 block">{c.author?.username}</span>
                                    <span className="text-xs text-gray-600">{c.text}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          
                          {currentUser ? (
                            <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-2 items-center relative">
                              <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-full py-2 pl-4 pr-10 outline-none focus:border-[#6358DC] transition" required />
                              <button type="submit" className="absolute right-1 w-8 h-8 flex items-center justify-center bg-[#6358DC] text-white rounded-full hover:bg-indigo-700 transition">
                                <FaPaperPlane className="text-xs" />
                              </button>
                            </form>
                          ) : (
                            <p className="text-xs text-center text-gray-400 mt-2">Log in to comment.</p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Kept Exactly the Same */}
      <section className="px-4 pb-14 md:pb-20">
        <motion.div
          className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-10 md:px-10 md:py-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute -left-20 -bottom-24 w-52 h-52 rounded-full bg-purple-100 opacity-60" />
          <div className="absolute -right-20 -bottom-24 w-52 h-52 rounded-full bg-orange-100 opacity-60" />

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#05073C]">
              Ready to explore Bangladesh?
            </h2>

            <p className="mt-3 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Browse TravelEase packages and start planning your next trip.
            </p>

            <Link
              to="/search"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 mt-6 bg-[#EB662B] hover:bg-orange-700 text-white px-7 py-3 rounded-xl font-bold transition-colors duration-300"
            >
              Explore All Tours
              <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Blog;