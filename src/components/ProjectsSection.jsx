import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProjectCard from './ProjectCard';
import { exportToCSV } from '../utils/exportToCSV';
import { LayoutGrid, List, Download, Loader2 } from 'lucide-react';

const ProjectsSection = ({ onNavigate }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('is_featured', { ascending: false }) // Featured first
                .order('year', { ascending: false, nullsFirst: false }); // Then by year

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            // In a real app we'd show a toast or error message
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportToCSV(projects, 'william_melo_projects.csv');
    };

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
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-academic-light dark:bg-academic-dark text-academic-gold shadow-sm' : 'text-academic-brown/50 dark:text-academic-pink/50 hover:text-academic-gold'}`}
                        title="Visualização em Cards"
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-academic-light dark:bg-academic-dark text-academic-gold shadow-sm' : 'text-academic-brown/50 dark:text-academic-pink/50 hover:text-academic-gold'}`}
                        title="Visualização em Tabela"
                    >
                        <List size={20} />
                    </button>
                    <div className="w-px h-6 bg-academic-gold/20 mx-1"></div>
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
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((proj) => (
                                <ProjectCard key={proj.id} project={proj} onNavigate={onNavigate} />
                            ))}
                        </div>
                    ) : (
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
                                        <tr key={proj.id} className="hover:bg-academic-light/50 dark:hover:bg-academic-brown/20 transition-colors text-academic-brown dark:text-academic-light/80">
                                            <td className="px-6 py-4 font-serif font-medium text-academic-dark dark:text-academic-light">
                                                {proj.title}
                                                {proj.is_featured && <span className="ml-2 text-xs text-academic-gold">★</span>}
                                            </td>
                                            <td className="px-6 py-4">{proj.status}</td>
                                            <td className="px-6 py-4">{proj.type}</td>
                                            <td className="px-6 py-4">{proj.year}</td>
                                            <td className="px-6 py-4 truncate max-w-[150px]">
                                                {proj.access_link ? (
                                                    <a href={proj.access_link} target="_blank" className="text-academic-gold hover:underline">Link</a>
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

export default ProjectsSection;
