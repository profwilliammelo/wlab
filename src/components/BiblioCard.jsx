import React from 'react';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';

const BiblioCard = ({ item }) => {
    // Extract URL from markdown link format if present: [Title](URL)
    // But data usually comes clean or with markdown inside string. 
    // The seed data has raw links in 'link' column but sometimes title has markdown. 
    // Let's assume 'link' column has the URL.
    // Wait, seed data 'link' has markdown format sometimes? 
    // Seed: '[https://...](https://...)' -> Postgres stores this string.
    // I should regex parse if it looks like markdown.

    let url = item.link;
    let displayLink = item.link;

    // Basic markdown link parser
    const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/;
    const match = item.link ? item.link.match(markdownLinkRegex) : null;

    if (match) {
        url = match[2];
        displayLink = match[2]; // Or match[1] if we want text, but usually user wants to click.
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-5 rounded-lg border border-academic-gold/20 bg-white dark:bg-academic-brown/30 hover:border-academic-gold hover:bg-academic-light dark:hover:bg-academic-brown/50 transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-academic-light dark:bg-academic-dark text-academic-gold shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-academic-gold mb-1 block">
                        {item.type} • {item.year}
                    </span>
                    <h4 className="font-serif font-bold text-lg text-academic-dark dark:text-academic-light group-hover:text-academic-brown dark:group-hover:text-academic-pink transition-colors mb-2">
                        {item.title}
                    </h4>
                    <div className="flex items-center text-sm text-academic-brown/60 dark:text-academic-pink/60 overflow-hidden">
                        <ExternalLink className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{displayLink}</span>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default BiblioCard;
