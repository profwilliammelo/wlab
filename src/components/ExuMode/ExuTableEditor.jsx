import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Plus, Pencil, Trash2, Check, X, Loader2, ChevronDown, ChevronUp, Image, Code2
} from 'lucide-react';

// Configuração das colunas por tabela
const TABLE_CONFIGS = {
  projects: {
    label: 'Projetos',
    columns: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'summary', label: 'Resumo', type: 'textarea' },
      { key: 'year', label: 'Ano', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Ativo', 'Concluído', 'Em pausa', 'Cancelado'] },
      { key: 'type', label: 'Tipo', type: 'text' },
      { key: 'access_link', label: 'Link de acesso', type: 'url' },
      { key: 'target_audience', label: 'Público-alvo', type: 'text' },
      { key: 'version', label: 'Versão', type: 'text' },
      { key: 'is_featured', label: 'Destaque', type: 'boolean' },
      { key: 'featured_image_url', label: 'URL da imagem de destaque', type: 'url', icon: 'image' },
      { key: 'embed_code', label: 'Código Embed (HTML)', type: 'code', icon: 'code' },
    ],
    orderBy: [{ column: 'is_featured', ascending: false }, { column: 'year', ascending: false }],
  },
  bibliography: {
    label: 'Bibliografia',
    columns: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'link', label: 'Link', type: 'url' },
      { key: 'year', label: 'Ano', type: 'text' },
      { key: 'type', label: 'Tipo', type: 'select', options: ['Texto', 'Participação em livro', 'Cultura hiphop', 'Mesa/Seminário', 'Vídeo', 'Outro'] },
      { key: 'featured_image_url', label: 'URL da imagem de destaque', type: 'url', icon: 'image' },
      { key: 'embed_code', label: 'Código Embed (HTML)', type: 'code', icon: 'code' },
    ],
    orderBy: [{ column: 'year', ascending: false }],
  },
  testimonials: {
    label: 'Depoimentos',
    columns: [
      { key: 'name', label: 'Nome', type: 'text', required: true },
      { key: 'role', label: 'Cargo/Papel', type: 'text' },
      { key: 'content', label: 'Depoimento', type: 'textarea' },
      { key: 'image_url', label: 'URL da foto', type: 'url', icon: 'image' },
      { key: 'active', label: 'Visível', type: 'boolean' },
    ],
    orderBy: [{ column: 'created_at', ascending: false }],
  },
  admin_settings: {
    label: 'Configurações',
    columns: [
      { key: 'key', label: 'Chave', type: 'text', required: true, readOnly: true },
      { key: 'value', label: 'Valor', type: 'textarea' },
    ],
    orderBy: [{ column: 'key', ascending: true }],
  },
  audit_log: {
    label: 'Log de Auditoria',
    readOnly: true, // tabela imutável — somente leitura
    columns: [
      { key: 'created_at', label: 'Data/Hora', type: 'text', readOnly: true },
      { key: 'operation', label: 'Operação', type: 'text', readOnly: true },
      { key: 'table_name', label: 'Tabela', type: 'text', readOnly: true },
      { key: 'user_email', label: 'Usuário', type: 'text', readOnly: true },
      { key: 'record_id', label: 'ID do Registro', type: 'text', readOnly: true },
      { key: 'new_data', label: 'Dados Novos', type: 'text', readOnly: true },
      { key: 'old_data', label: 'Dados Anteriores', type: 'text', readOnly: true },
    ],
    orderBy: [{ column: 'created_at', ascending: false }],
  },
};

const FieldInput = ({ col, value, onChange }) => {
  if (col.readOnly) {
    return (
      <span className="text-stone-400 font-mono text-sm">{value}</span>
    );
  }

  const base = "w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  if (col.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => onChange(!value)}
          className={`w-10 h-6 rounded-full transition-colors ${value ? 'bg-amber-500' : 'bg-stone-700'} relative`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
        <span className="text-stone-300 text-sm">{value ? 'Sim' : 'Não'}</span>
      </label>
    );
  }

  if (col.type === 'textarea' || col.type === 'code') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={col.type === 'code' ? 6 : 3}
        className={`${base} resize-y font-${col.type === 'code' ? 'mono' : 'sans'}`}
        placeholder={col.type === 'code' ? '<iframe src="...">' : ''}
      />
    );
  }

  if (col.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} bg-stone-800`}
      >
        <option value="">— selecione —</option>
        {col.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={col.type === 'url' ? 'text' : col.type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={base}
    />
  );
};

const RowForm = ({ tableName, config, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData?.id;

  const handleSave = async () => {
    // Validação básica
    const missing = config.columns.filter((c) => c.required && !formData[c.key]);
    if (missing.length) {
      setError(`Campo obrigatório: ${missing.map((c) => c.label).join(', ')}`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Remover campos readOnly do payload
      const payload = { ...formData };
      config.columns.filter((c) => c.readOnly).forEach((c) => delete payload[c.key]);

      if (isEdit) {
        const { error: err } = await supabase
          .from(tableName)
          .update(payload)
          .eq('id', initialData.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from(tableName)
          .insert(payload);
        if (err) throw err;
      }
      onSave();
    } catch (err) {
      setError(err.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-stone-950 border border-amber-800/30 rounded-xl p-6 mb-4">
      <h3 className="text-amber-400 font-bold mb-4 text-sm uppercase tracking-wider">
        {isEdit ? '✏️ Editando registro' : '➕ Novo registro'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.columns.map((col) => (
          <div key={col.key} className={col.type === 'textarea' || col.type === 'code' ? 'md:col-span-2' : ''}>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
              {col.icon === 'image' && <Image size={12} className="text-amber-500" />}
              {col.icon === 'code' && <Code2 size={12} className="text-amber-500" />}
              {col.label}
              {col.required && <span className="text-red-400">*</span>}
            </label>
            <FieldInput
              col={col}
              value={formData[col.key]}
              onChange={(val) => setFormData((prev) => ({ ...prev, [col.key]: val }))}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-bold px-5 py-2 rounded-lg text-sm transition"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-white px-5 py-2 rounded-lg text-sm transition"
        >
          <X size={16} />
          Cancelar
        </button>
      </div>
    </div>
  );
};

const ExuTableEditor = ({ tableName }) => {
  const config = TABLE_CONFIGS[tableName];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchRows = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      let query = supabase.from(tableName).select('*');
      for (const o of config.orderBy) {
        query = query.order(o.column, { ascending: o.ascending, nullsFirst: false });
      }
      const { data, error: err } = await query;
      if (err) throw err;
      setRows(data || []);
      setLoaded(true);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (!prev && !loaded) fetchRows();
      return !prev;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;
    setDeleting(id);
    try {
      const { error: err } = await supabase.from(tableName).delete().eq('id', id);
      if (err) throw err;
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    setEditingId(null);
    setAddingNew(false);
    fetchRows();
  };

  // Preview columns para a tabela resumida
  const previewCols = config.columns.filter(
    (c) => !['embed_code', 'featured_image_url'].includes(c.key)
  ).slice(0, 4);

  return (
    <div className="border border-stone-800 rounded-2xl overflow-hidden mb-4">
      {/* Header accordion */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-stone-900 hover:bg-stone-800 transition text-left"
      >
        <span className="font-bold text-amber-400 font-serif text-lg">{config.label}</span>
        <div className="flex items-center gap-3">
          {loaded && (
            <span className="text-xs text-stone-500 font-mono">{rows.length} registros</span>
          )}
          {isOpen ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="bg-stone-950 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Botão Novo — oculto em tabelas read-only */}
          {!config.readOnly && !addingNew && (
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 mb-4 transition"
            >
              <Plus size={16} />
              Adicionar novo
            </button>
          )}

          {config.readOnly && (
            <p className="text-xs text-stone-500 mb-4 flex items-center gap-1.5">
              <span className="text-amber-600">🔒</span>
              Tabela somente leitura — registrada automaticamente pelo banco de dados.
            </p>
          )}

          {addingNew && (
            <RowForm
              tableName={tableName}
              config={config}
              initialData={null}
              onSave={handleSaved}
              onCancel={() => setAddingNew(false)}
            />
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-amber-400 w-8 h-8" />
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id}>
                  {editingId === row.id ? (
                    <RowForm
                      tableName={tableName}
                      config={config}
                      initialData={row}
                      onSave={handleSaved}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-stone-900 rounded-xl border border-stone-800 hover:border-stone-700 transition group">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {previewCols.map((col) => (
                            <div key={col.key} className="text-xs">
                              <span className="text-stone-500">{col.label}: </span>
                              <span className={`font-medium ${
                                tableName === 'audit_log' && col.key === 'operation'
                                  ? row[col.key] === 'DELETE' ? 'text-red-400'
                                    : row[col.key] === 'INSERT' ? 'text-emerald-400'
                                    : 'text-amber-400'
                                  : 'text-stone-200'
                              }`}>
                                {col.type === 'boolean'
                                  ? row[col.key] ? '✓' : '✗'
                                  : String(row[col.key] ?? '—').slice(0, 80)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {row.featured_image_url && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                            <Image size={10} /> imagem definida
                          </span>
                        )}
                        {row.embed_code && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400 mt-1 ml-3">
                            <Code2 size={10} /> embed definido
                          </span>
                        )}
                      </div>
                      {!config.readOnly && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button
                            onClick={() => setEditingId(row.id)}
                            className="p-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-amber-300 transition"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          {tableName !== 'admin_settings' && (
                            <button
                              onClick={() => handleDelete(row.id)}
                              disabled={deleting === row.id}
                              className="p-1.5 rounded-lg bg-stone-700 hover:bg-red-900 text-red-400 transition disabled:opacity-50"
                              title="Excluir"
                            >
                              {deleting === row.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExuTableEditor;
