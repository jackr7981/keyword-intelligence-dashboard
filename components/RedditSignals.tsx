"use client";

import { RedditPost } from "@/lib/types";
import { MessageSquare, ArrowUp, ExternalLink, Clock } from "lucide-react";

interface Props {
  posts: RedditPost[];
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatScore(score: number): string {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(score);
}

function PostCard({ post }: { post: RedditPost }) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl p-4 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[32px]">
          <ArrowUp size={13} className="text-slate-400" />
          <span className="text-slate-300 text-xs font-semibold">
            {formatScore(post.score)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 text-sm font-medium line-clamp-2 group-hover:text-white transition-colors leading-snug">
            {post.title}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-indigo-400 text-xs font-medium">
              r/{post.subreddit}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <MessageSquare size={10} />
              {post.num_comments}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <Clock size={10} />
              {timeAgo(post.created_utc)}
            </span>
          </div>
        </div>
        <ExternalLink
          size={13}
          className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0 mt-0.5"
        />
      </div>
    </a>
  );
}

export default function RedditSignals({ posts }: Props) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-black">R</span>
          </div>
          <h3 className="text-white font-semibold text-lg">Reddit Signals</h3>
        </div>
        <span className="text-slate-400 text-sm">{posts.length} discussions</span>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <p className="text-slate-400 text-sm">No Reddit discussions found</p>
        </div>
      )}
    </div>
  );
}
