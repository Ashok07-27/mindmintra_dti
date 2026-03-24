import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("anxiety, stress");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { data } = await api.post("/posts", {
      content,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      isAnonymous,
    });

    setFeedback(data.ai);
    setTimeout(() => navigate("/"), 1400);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="glass-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-ink">Create a Support Post</h1>
        <p className="mb-6 text-slate-600">
          Share what you are going through. MindMitra will suggest tags, detect tone, and flag high-risk language for safety.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Your thoughts
            </label>
            <textarea
              className="soft-input min-h-44"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="I have been feeling overwhelmed by exams and I do not know how to slow down..."
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Tags
            </label>
            <input
              className="soft-input"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="anxiety, stress, loneliness"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(event) => setIsAnonymous(event.target.checked)}
            />
            Post anonymously
          </label>

          <button className="primary-btn">Post Safely</button>
        </form>

        {feedback && (
          <div className="mt-6 rounded-3xl bg-gradient-to-r from-sky-50 to-violet-50 p-5">
            <h2 className="mb-2 text-lg font-semibold text-ink">AI Support Summary</h2>
            <p className="text-sm text-slate-700">
              Suggested tags: {feedback.suggestedTags.join(", ") || "No extra tags detected"}
            </p>
            <p className="mt-2 text-sm text-slate-700">Emotion detected: {feedback.emotion}</p>
            <p className="mt-2 text-sm text-slate-700">
              Risk level: {feedback.risk.level}
              {feedback.risk.warning ? ` - ${feedback.risk.warning}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



