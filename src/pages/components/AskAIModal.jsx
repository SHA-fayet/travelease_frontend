import React, { useState, useEffect } from "react";

const AskAIModal = ({ isOpen, onClose, defaultPrompt }) => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-trigger if a default prompt is passed in
  useEffect(() => {
    if (defaultPrompt && isOpen) {
      setPrompt(defaultPrompt);
      handleAsk(defaultPrompt);
    }
  }, [defaultPrompt, isOpen]);

  // Clear states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setReply("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleAsk = async (textToAsk) => {
    const query = typeof textToAsk === "string" ? textToAsk : prompt;
    if (!query.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();

      if (data.success) {
        setReply(data.reply);
        setPrompt(""); // Clear input box after getting answer
      } else {
        setReply(data.message || "An error occurred.");
      }
    } catch (error) {
      console.error(error);
      setReply("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg relative animate-fade-in-up">
        <h2 className="text-2xl font-semibold mb-4 text-center text-zinc-800 dark:text-zinc-100">
          I'm Travel BHAI
        </h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything about travel, packages, or destinations..."
          className="w-full h-32 p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white resize-none outline-none focus:ring-2 focus:ring-[#EB662B]"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-zinc-600 transition"
          >
            Close
          </button>
          <button
            onClick={handleAsk}
            disabled={loading || prompt.trim() === ""}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-[#d55923] text-white cursor-not-allowed opacity-70"
                : "bg-[#EB662B] hover:bg-[#d55923] text-white shadow-md"
            }`}
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-zinc-300 dark:scrollbar-track-zinc-700">
          <p className="text-zinc-800 dark:text-white font-bold text-xl mb-4 border-b border-zinc-300 dark:border-zinc-700 pb-2">
            Answer is here
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-[#EB662B] animate-pulse font-medium">
              <span className="loading-spinner h-5 w-5 border-4 border-[#EB662B] border-t-transparent rounded-full animate-spin" />
              Travel bhai is typing...
            </div>
          ) : reply ? (
            <div className="text-zinc-800 dark:text-zinc-100 whitespace-pre-line leading-relaxed text-sm">
              {reply}
            </div>
          ) : (
            <p className="text-zinc-400 italic text-sm">
              Your answer will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskAIModal;