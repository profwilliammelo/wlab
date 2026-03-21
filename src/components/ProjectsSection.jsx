import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProjectCard from './ProjectCard';
import { exportToCSV } from '../utils/exportToCSV';
import { LayoutGrid, List, Images, Download, Loader2, ExternalLink, Calendar } from 'lucide-react';

const ProjectsSection = ({ onNavigate }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'gallery'

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('is_featured', { ascending: false })
                .order('year', { ascending: false, nullsFirst: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportToCSV(projects, 'william_melo_projects.csv');
    };

    const viewButtons = [
        { mode: 'grid', icon: LayoutGrid, title: 'Cards' },
        { mode: 'gallery', icon: Images, title: 'Galeria' },
        { mode: 'table', icon: List, title: 'Tabela' },
    ];

    return (
        <section className="py-16 container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-academic-dark dark:text-academic-light mb-2">
                        Projetos & Iniciativas
                    </h2>
                    <p className="text-academic-brown dark:text-academic-pink/80 max-w-xl">
                        Uma coleção de trabalhos focados em educação, equidade racial e impacto social.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-academic-brown/30 p-1.5 rounded-lg border border-academic-gold/20">
                    {viewButtons.map(({ mode, icon: Icon, title }) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`p-2 rounded-md transition-all ${viewMode === mode
                                ? 'bg-academic-light dark:bg-academic-dark text-academic-gold shadow-sm'
                                : 'text-academic-brown/50 dark:text-academic-pink/50 hover:text-academic-gold'}`}
                            title={title}
                        >
                            <Icon size={20} />
                        </button>
                    ))}
                    <div className="w-px h-6 bg-academic-gold/20 mx-1" />
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-academic-brown dark:text-academic-pink hover:bg-academic-light dark:hover:bg-academic-dark/50 transition-colors"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-academic-gold">
                    <Loader2 className="animate-spin w-10 h-10" />
                </div>
            ) : (
                <>
                    {/* MODO CARDS */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((proj) => (
                                <ProjectCard key={proj.id} project={proj} onNavigate={onNavigate} />
                            ))}
                        </div>
                    )}

                    {/* MODO GALERIA */}
                    {viewMode === 'gallery' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((proj) => (
                                <GalleryCard
                                    key={proj.id}
                                    item={proj}
                                    itemType="project"
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    )}

                    {/* MODO TABELA */}
                    {viewMode === 'table' && (
                        <div className="overflow-x-auto rounded-xl border border-academic-gold/20 bg-white dark:bg-academic-brown/10">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-academic-light dark:bg-academic-brown/30 text-academic-dark dark:text-academic-pink uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Projeto</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Ano</th>
                                        <th className="px-6 py-4">Acesso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-academic-gold/10">
                                    {projects.map((proj) => (
                                        <tr
                                            key={proj.id}
                                            className="hover:bg-academic-light/50 dark:hover:bg-academic-brown/20 transition-colors text-academic-brown dark:text-academic-light/80 cursor-pointer"
                                            onClick={() => onNavigate && onNavigate('item', { type: 'project', id: proj.id })}
                                        >
                                            <td className="px-6 py-4 font-serif font-medium text-academic-dark dark:text-academic-light">
                                                {proj.title}
                                                {proj.is_featured && <span className="ml-2 text-xs text-academic-gold">★</span>}
                                                {proj.featured_image_url && <span className="ml-1 text-xs text-academic-gold/60">🖼</span>}
                                            </td>
                                            <td className="px-6 py-4">{proj.status}</td>
                                            <td className="px-6 py-4">{proj.type}</td>
                                            <td className="px-6 py-4">{proj.year}</td>
                                            <td className="px-6 py-4 truncate max-w-[150px]" onClick={(e) => e.stopPropagation()}>
                                                {proj.access_link ? (
                                                    <a href={proj.access_link} target="_blank" rel="noopener noreferrer" className="text-academic-gold hover:underline">Link</a>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

// Card para o modo galeria
const GalleryCard = ({ item, itemType, onNavigate }) => {
    const hasImage = !!item.featured_image_url;
    const placeholderColors = [
        'from-academic-gold/20 to-academic-brown/10',
        'from-academic-pink/20 to-academic-gold/10',
        'from-blue-500/10 to-academic-gold/10',
        'from-emerald-500/10 to-academic-gold/10',
    ];
    const colorIdx = item.title.charCodeAt(0) % placeholderColors.length;

    const handleClick = () => {
        if (item.access_link === '#games' && onNavigate) {
            onNavigate('games');
        } else if (onNavigate) {
            onNavigate('item', { type: itemType, id: item.id });
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-academic-gold/20 bg-white dark:bg-academic-brown/30 hover:border-academic-gold/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            {/* Imagem ou placeholder */}
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br dark:bg-black/20">
                {hasImage ? (
                    <img
                        src={item.featured_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                {/* Fallback visual */}
                <div
                    className={`${hasImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br ${placeholderColors[colorIdx]}`}
                >
                    <span className="text-4xl opacity-30 font-serif font-bold text-academic-dark dark:text-academic-light select-none">
                        {item.title.slice(0, 2).toUpperCase()}
                    </span>
                </div>
                {item.is_featured && (
                    <div className="absolute top-2 right-2 bg-academic-gold text-academic-dark text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        ★ Destaque
                    </div>
                )}
                {item.embed_code && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        &lt;/&gt; embed
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-academic-gold">
                        {item.type || (itemType === 'project' ? 'Projeto' : 'Publicação')}
                    </span>
                    {item.year && (
                        <div className="flex items-center gap-1 text-xs text-academic-brown/50 dark:text-academic-pink/50">
                            <Calendar size={11} />
                            {item.year}
                        </div>
                    )}
                </div>
                <h3 className="font-serif font-bold text-academic-dark dark:text-academic-light line-clamp-2 group-hover:text-academic-brown dark:group-hover:text-academic-pink transition-colors">
                    {item.title}
                </h3>
                {item.status && (
                    <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.status?.toLowerCase() === 'ativo'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                            {item.status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export { GalleryCard };
export default ProjectsSection;
