import { motion } from "framer-motion";
import { Flag, HandHeart, MessagesSquare } from "lucide-react";

export default function PostCard({ post, onReact, onReport }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{post.displayName}</p>
          <p className="text-sm text-slate-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
          {post.emotion}
        </span>
      </div>

      <p className="mb-4 leading-7 text-slate-700">{post.content}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gradient-to-r from-sky-100 to-violet-100 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onReact(post._id, "relate")}
          className="secondary-btn flex items-center gap-2 !px-4 !py-2 text-sm"
        >
          <MessagesSquare size={16} />
          I Relate ({post.reactions?.relate || 0})
        </button>
        <button
          onClick={() => onReact(post._id, "support")}
          className="secondary-btn flex items-center gap-2 !px-4 !py-2 text-sm"
        >
          <HandHeart size={16} />
          Support ({post.reactions?.support || 0})
        </button>
        <button
          onClick={() => onReport(post._id)}
          className="secondary-btn flex items-center gap-2 !px-4 !py-2 text-sm"
        >
          <Flag size={16} />
          Report
        </button>
      </div>
    </motion.article>
  );
}



