import React from 'react';
import { ExternalLink, Calendar, Star, FlaskConical } from 'lucide-react';

const ProjectCard = ({ project }) => {
    const isFeatured = project.is_featured;

    // Status Colors
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'ativo': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'concluído': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <div
            className={`
        group relative flex flex-col p-6 rounded-xl border transition-all duration-300 hover:shadow-xl
        ${isFeatured
                    ? 'bg-gradient-to-br from-academic-light to-white dark:from-academic-brown dark:to-academic-dark border-academic-gold shadow-lg transform hover:-translate-y-1'
                    : 'bg-white dark:bg-academic-brown/40 border-academic-gold/20 hover:border-academic-gold/50 hover:bg-academic-light/50 dark:hover:bg-academic-brown/60'
                }
      `}
        >
            {isFeatured && (
                <div className="absolute -top-3 -right-3">
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-academic-gold text-academic-dark shadow-md">
                        <FlaskConical className="h-5 w-5" />
                    </span>
                </div>
            )}

            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status || 'Indefinido'}
                    </span>
                    {project.year && (
                        <div className="flex items-center text-xs text-academic-brown/60 dark:text-academic-pink/60">
                            <Calendar className="w-3 h-3 mr-1" />
                            {project.year}
                        </div>
                    )}
                </div>

                <h3 className={`font-serif font-bold mb-2 text-academic-dark dark:text-academic-light ${isFeatured ? 'text-2xl' : 'text-xl'}`}>
                    {project.title}
                </h3>

                <p className="text-sm text-academic-brown/80 dark:text-academic-pink/80 line-clamp-4 leading-relaxed">
                    {project.summary || 'Sem descrição disponível.'}
                </p>
            </div>

            <div className="mt-auto pt-4 border-t border-academic-gold/10 flex flex-wrap gap-2 justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-academic-gold">
                    {project.type}
                </span>

                {project.access_link && (
                    <a
                        href={project.access_link.startsWith('http') ? project.access_link : `https://${project.access_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-medium text-academic-brown dark:text-academic-pink hover:text-academic-gold dark:hover:text-academic-gold transition-colors"
                    >
                        Acessar <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
