import React from 'react';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';

const BiblioCard = ({ item, onNavigate }) => {
    let url = item.link;

    // Parser de markdown link: [texto](url)
    const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/;
    const match = item.link ? item.link.match(markdownLinkRegex) : null;
    if (match) url = match[2];

    const hasImage = !!item.featured_image_url;

    const handleCardClick = (e) => {
        if (e.target.closest('a')) return;
        if (onNavigate) {
            onNavigate('item', { type: 'bibliography', id: item.id });
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="group block rounded-lg border border-academic-gold/20 bg-white dark:bg-academic-brown/30 hover:border-academic-gold hover:bg-academic-light dark:hover:bg-academic-brown/50 transition-all duration-300 overflow-hidden cursor-pointer"
        >
            {/* Imagem de destaque */}
            {hasImage && (
                <div className="w-full aspect-video overflow-hidden bg-academic-light dark:bg-academic-dark">
                    <img
                        src={item.featured_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.parentElement.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-academic-light dark:bg-academic-dark text-academic-gold shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-semibold uppercase tracking-wider text-academic-gold">
                                {item.type}
                            </span>
                            {item.year && (
                                <div className="flex items-center text-xs text-academic-brown/50 dark:text-academic-pink/50">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {item.year}
                                </div>
                            )}
                            {item.embed_code && (
                                <span className="text-xs text-academic-brown/40 dark:text-academic-pink/30">&lt;/&gt;</span>
                            )}
                        </div>

                        <h4 className="font-serif font-bold text-lg text-academic-dark dark:text-academic-light group-hover:text-academic-brown dark:group-hover:text-academic-pink transition-colors mb-2">
                            {item.title}
                        </h4>

                        {url && (
                            <a
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center text-sm text-academic-brown/60 dark:text-academic-pink/60 hover:text-academic-gold transition-colors overflow-hidden"
                            >
                                <ExternalLink className="w-3 h-3 mr-1 shrink-0" />
                                <span className="truncate">{url}</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiblioCard;
