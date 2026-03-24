import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";
import api from "./api";
import { jaccardExample } from "./jaccardInfo";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [matches, setMatches] = useState([]);

  const loadFeed = async () => {
    const [{ data: postData }, { data: recommendedData }, { data: matchData }] =
      await Promise.all([
        api.get("/posts"),
        api.get("/posts/recommended"),
        api.get("/posts/matches"),
      ]);

    setPosts(postData);
    setRecommended(recommendedData);
    setMatches(matchData);
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleReact = async (postId, type) => {
    await api.post(`/posts/${postId}/react`, { type });
    loadFeed();
  };

  const handleReport = async (postId) => {
    await api.post(`/posts/${postId}/report`, {
      reason: "This content may need moderation review.",
    });
    loadFeed();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-calm">
                Shared Experience Feed
              </p>
              <h1 className="text-3xl font-bold text-ink">Welcome back to your support circle</h1>
            </div>
            <Link to="/create" className="primary-btn text-center">
              Share How You Feel
            </Link>
          </div>
        </motion.div>

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onReact={handleReact}
            onReport={handleReport}
          />
        ))}
      </section>

      <aside className="space-y-6">
        <div className="glass-card p-5">
          <h2 className="mb-3 text-xl font-semibold text-ink">Recommended Posts</h2>
          <div className="space-y-3">
            {recommended.length === 0 && (
              <p className="text-sm text-slate-500">Add more tags in your profile to improve recommendations.</p>
            )}
            {recommended.map((post) => (
              <div key={post._id} className="rounded-2xl bg-sky-50/70 p-4">
                <p className="mb-2 text-sm text-slate-700">{post.content}</p>
                <p className="text-xs font-semibold text-bloom">
                  Match score: {(post.similarity * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-3 text-xl font-semibold text-ink">Peer Matches</h2>
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match._id} className="rounded-2xl bg-violet-50/70 p-4">
                <p className="font-semibold text-ink">{match.username}</p>
                <p className="mb-2 text-sm text-slate-600">{match.bio}</p>
                <p className="text-xs font-semibold text-bloom">
                  Shared support tags: {(match.similarity * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-3 text-xl font-semibold text-ink">How Matching Works</h2>
          <p className="mb-3 text-sm leading-7 text-slate-600">
            MindMitra uses Jaccard Similarity. It compares shared tags divided by all unique tags from two users or a user and a post.
          </p>
          <p className="text-sm text-slate-700">
            Example: {JSON.stringify(jaccardExample.userTags)} and {JSON.stringify(jaccardExample.postTags)}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Shared tags = {jaccardExample.intersection.length}, total unique tags = {jaccardExample.union.length}, so score = {jaccardExample.intersection.length}/{jaccardExample.union.length} = {jaccardExample.score}.
          </p>
        </div>
      </aside>
    </div>
  );
}



