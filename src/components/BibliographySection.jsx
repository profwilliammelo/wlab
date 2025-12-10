import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import BiblioCard from './BiblioCard';
import { exportToCSV } from '../utils/exportToCSV';
import { LayoutGrid, List, Download, Loader2 } from 'lucide-react';

const BibliographySection = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchBibliography();
    }, []);

    const fetchBibliography = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bibliography')
                .select('*')
                .order('year', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching bibliography:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportToCSV(items, 'william_melo_bibliography.csv');
    };

    return (
        <section className="py-16 bg-academic-gold/5 dark:bg-black/20 border-y border-academic-gold/10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-academic-dark dark:text-academic-light mb-2">
                            Bibliografia & Publicações
                        </h2>
                        <p className="text-academic-brown dark:text-academic-pink/80 max-w-xl">
                            Artigos, textos de opinião e participações em livros.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-academic-brown/30 p-1.5 rounded-lg border border-academic-gold/20">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-academic-light dark:bg-academic-dark text-academic-gold shadow-sm' : 'text-academic-brown/50 dark:text-academic-pink/50 hover:text-academic-gold'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-academic-light dark:bg-academic-dark text-academic-gold shadow-sm' : 'text-academic-brown/50 dark:text-academic-pink/50 hover:text-academic-gold'}`}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map((item) => (
                                    <BiblioCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-academic-gold/20 bg-white dark:bg-academic-brown/10">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-academic-light dark:bg-academic-brown/30 text-academic-dark dark:text-academic-pink uppercase tracking-wider font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Título</th>
                                            <th className="px-6 py-4">Tipo</th>
                                            <th className="px-6 py-4">Ano</th>
                                            <th className="px-6 py-4">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-academic-gold/10">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-academic-light/50 dark:hover:bg-academic-brown/20 transition-colors text-academic-brown dark:text-academic-light/80">
                                                <td className="px-6 py-4 font-bold font-serif">{item.title}</td>
                                                <td className="px-6 py-4">{item.type}</td>
                                                <td className="px-6 py-4">{item.year}</td>
                                                <td className="px-6 py-4 truncate max-w-[200px]">
                                                    {item.link || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default BibliographySection;
