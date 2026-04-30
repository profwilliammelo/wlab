import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, ExternalLink, Calendar, Loader2, BookOpen, FlaskConical } from 'lucide-react';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'ativo': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'concluído': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const RESIZE_SCRIPT = `<script>
(function(){
  function report(){window.parent.postMessage({__iframeH:document.documentElement.scrollHeight},'*');}
  window.addEventListener('load',report);
  new MutationObserver(report).observe(document.documentElement,{childList:true,subtree:true,attributes:true,characterData:true});
  window.addEventListener('resize',report);
})();
</script>`;

// Componente seguro para renderizar embeds HTML
const SafeEmbed = ({ code }) => {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(350);

  useEffect(() => {
    const handler = (e) => {
      if (e.source === iframeRef.current?.contentWindow && e.data?.__iframeH) {
        setHeight(Math.max(200, e.data.__iframeH));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!code?.trim()) return null;

  const srcDoc = code.includes('</body>')
    ? code.replace('</body>', RESIZE_SCRIPT + '</body>')
    : code + RESIZE_SCRIPT;

  return (
    <div className="mt-6">
      <h3 className="font-serif font-bold text-lg text-academic-dark dark:text-academic-light mb-3">
        Conteúdo Incorporado
      </h3>
      <div className="rounded-xl overflow-hidden border border-academic-gold/20 bg-black/5 dark:bg-white/5">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer"
          style={{ height: `${height}px` }}
          className="w-full transition-[height] duration-300"
          title="Conteúdo incorporado"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-academic-brown/40 dark:text-academic-pink/40 mt-2 text-center">
        Conteúdo externo incorporado — renderizado em ambiente isolado
      </p>
    </div>
  );
};

const ItemDetailPage = ({ itemType, itemId, onBack }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tableName = itemType === 'project' ? 'projects' : 'bibliography';

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: err } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', itemId)
          .single();
        if (err) throw err;
        setItem(data);
      } catch (err) {
        setError('Registro não encontrado.');
      } finally {
        setLoading(false);
      }
    };
    if (itemId) fetchItem();
  }, [itemId, tableName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-academic-gold w-10 h-10" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-academic-brown/60 dark:text-academic-pink/60">{error || 'Item não encontrado.'}</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-academic-gold hover:underline"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
    );
  }

  // Determina o link de acesso de acordo com o tipo
  const accessUrl = itemType === 'project' ? item.access_link : item.link;
  const isExternalLink = accessUrl && accessUrl !== '#games' &&
    (accessUrl.startsWith('http') || accessUrl.startsWith('/'));

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-academic-brown/60 dark:text-academic-pink/60 hover:text-academic-gold transition mb-8"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        {/* Imagem de destaque */}
        {item.featured_image_url && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-academic-gold/20 shadow-xl">
            <img
              src={item.featured_image_url}
              alt={`Imagem de destaque: ${item.title}`}
              className="w-full object-cover max-h-[400px]"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Header do item */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Badge de tipo */}
            <div className="flex items-center gap-1.5 text-academic-gold">
              {itemType === 'project' ? (
                <FlaskConical size={16} />
              ) : (
                <BookOpen size={16} />
              )}
              <span className="text-sm font-semibold uppercase tracking-wider">
                {itemType === 'project' ? (item.type || 'Projeto') : (item.type || 'Publicação')}
              </span>
            </div>

            {/* Status (só projetos) */}
            {itemType === 'project' && item.status && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            )}

            {/* Destaque */}
            {item.is_featured && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-academic-gold/20 text-academic-gold border border-academic-gold/30">
                ★ Destaque
              </span>
            )}
          </div>

          <h1 className="font-serif font-bold text-3xl md:text-4xl text-academic-dark dark:text-academic-light leading-tight mb-4">
            {item.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-academic-brown/60 dark:text-academic-pink/60">
            {item.year && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                {item.year}
              </div>
            )}
            {item.target_audience && (
              <div>Público: {item.target_audience}</div>
            )}
            {item.version && (
              <div>Versão: {item.version}</div>
            )}
          </div>
        </div>

        {/* Linha divisória */}
        <hr className="border-academic-gold/20 mb-6" />

        {/* Resumo / conteúdo */}
        {item.summary && (
          <p className="text-academic-brown/90 dark:text-academic-light/80 leading-relaxed text-lg mb-6">
            {item.summary}
          </p>
        )}

        {/* Link de acesso */}
        {isExternalLink && (
          <a
            href={accessUrl.startsWith('http') ? accessUrl : `https://${accessUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-academic-dark dark:bg-academic-light text-academic-light dark:text-academic-dark font-semibold px-6 py-3 rounded-full hover:opacity-90 transition mb-8"
          >
            <ExternalLink size={16} />
            {itemType === 'project' ? 'Acessar Projeto' : 'Acessar Publicação'}
          </a>
        )}

        {/* Embed seguro */}
        <SafeEmbed code={item.embed_code} />
      </div>
    </div>
  );
};

export default ItemDetailPage;
