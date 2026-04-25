
import React from 'react';
import { motion } from 'framer-motion';
import { NewsArticle } from '../types';
import { Icons } from './Icons';

interface NewsProps {
    news: NewsArticle[];
}

const News: React.FC<NewsProps> = ({ news }) => {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    Cricket <span className="text-teal-500">News</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Latest updates from the league
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-4">
                {news.map((article, index) => (
                    <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                article.type === 'match' ? 'bg-teal-500/10 text-teal-500' : 'bg-pink-500/10 text-pink-500'
                            }`}>
                                {article.type}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                {article.date}
                            </span>
                        </div>
                        <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">
                            {article.headline}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            {article.excerpt}
                        </p>
                        <button className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                            Read Full Story <Icons.ChevronRight className="w-3 h-3" />
                        </button>
                    </motion.div>
                ))}
                {news.length === 0 && (
                    <div className="py-20 text-center">
                        <Icons.News className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-400 text-xs font-bold uppercase italic">No news available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
