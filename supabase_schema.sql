-- REMOVE tabelas antigas se existirem (CUIDADO: APAGA DADOS)
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS bibliography;

-- CRIAÇÃO DA TABELA PROJECTS
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    year TEXT, -- Pode ser texto ("2025" ou "2024-2025")
    status TEXT,
    type TEXT,
    access_link TEXT,
    target_audience TEXT,
    version TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRIAÇÃO DA TABELA BIBLIOGRAPHY
CREATE TABLE bibliography (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    link TEXT,
    year TEXT, -- Flexibilidade para ano
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bibliography ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS DE ACESSO (Leitura Pública)
CREATE POLICY "Public Read Projects"
ON projects FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public Read Bibliography"
ON bibliography FOR SELECT
TO anon
USING (true);

-- SEED DATA - PROJETOS
INSERT INTO projects (title, summary, year, status, type, access_link, target_audience, version, is_featured) 
VALUES 
('EcELab - Educação com Evidências', 'Plataforma oficial da Educação com Evidências. A instituição que fundei e dirijo.', '2025', 'Ativo', 'Plataforma', 'https://ecelab.com.br', 'Professores, Gestores, Pesquisadores', '1.0', TRUE),
('Mapa dos Slams do RJ', 'Mapeamento interativo de todos os espaços de poesia slam na cidade do Rio de Janeiro, incluindo datas de eventos, histórico e contatos.', NULL, 'Concluído', 'Mapa', NULL, 'Comunidade Local, Estudantes, Profissionais', '1.2', FALSE),
('CafeLab', 'Sistema de acompanhamento afetivo de resultados escolares, programado em R com Quarto Dashboard e Shiny.', '2025', 'Concluído', 'Dashboard', NULL, 'Comunidade Local, Estudantes, Profissionais', '4', FALSE),
('Estudo de Equidade Racial - Recife', 'Estudo sobre desigualdades raciais em Recife, usando o SAEB.', NULL, 'Concluído', 'Estudo', NULL, 'Comunidade Local, Profissionais, Setor Público', 'unica', FALSE),
('Estudo de Equidade Racial - Maricá', 'Pesquisa sobre desigualdades raciais em Maricá, usando SAEB.', NULL, 'Concluído', 'Estudo', NULL, 'Comunidade Local, Profissionais, Setor Público', 'unica', FALSE),
('Masculinidades Quilombolas', 'Estudo etnográfico sobre construções de masculinidade em comunidades quilombolas, explorando tradição, resistência e transformações contemporâneas.', NULL, 'Concluído', 'Estudo', NULL, 'Comunidade Local, Estudantes, Profissionais', '0.6', FALSE),
('Parentalidade em ONGs', 'Análise sobre práticas de apoio à parentalidade em ONGs educacionais, com foco em metodologias, resultados e desafios enfrentados.', '2024', 'Concluído', 'Estudo', NULL, 'Estudantes, Profissionais, Setor Público', '1.5', FALSE),
('Calculadora de INSE', 'Ferramenta interativa para cálculo de Nível Socioeconômico (NSE) desenvolvida com Canva Code, permitindo visualização de dados e geração de relatórios personalizados.', '2025', 'Concluído', 'Calculadora', NULL, 'Estudantes, Profissionais, Setor Público', '1.0', FALSE),
('Jogos Educativos - Efeito Estufa e Aquecimento Global', 'Coletânea de jogos educativos desenvolvidos por alunos para ensinar conceitos relacionados ao efeito estufa e aquecimento global de forma interativa e lúdica.', NULL, 'Concluído', 'Jogo', NULL, 'Adolescentes, Crianças, Estudantes', '1.1', FALSE),
('Jogos Educativos - Sistema Solar', 'Série de jogos interativos criados por alunos para ensinar sobre o sistema solar, planetas, estrelas e fenômenos astronômicos através de desafios e narrativas envolventes.', NULL, 'Concluído', 'Jogo', NULL, 'Adolescentes, Crianças, Estudantes', '1.0', FALSE),
('Ciência do Afeto', NULL, NULL, 'Concluído', NULL, NULL, NULL, '6', FALSE),
('Jogo educativo - Separação de misturas', NULL, NULL, 'Concluído', NULL, NULL, NULL, '1', FALSE),
('Olhar científico na escola', NULL, NULL, 'Concluído', NULL, NULL, NULL, '20', FALSE),
('Jogo sobre fontes de energia pra 7 ano', NULL, NULL, 'Concluído', NULL, NULL, NULL, '9', FALSE),
('Painel do Maui', NULL, '2025', 'Concluído', 'Dashboard', 'https://paineldomaui.netlify.app', 'artista', '1', FALSE);

-- SEED DATA - BIBLIOGRAFIA
INSERT INTO bibliography (title, link, year, type)
VALUES
('Pesquisadoras da educação básica: germinando ações e saberes nas escolas públicas periféricas', 'https://observatoriodeeducacao.institutounibanco.org.br/cedoc/detalhe/pesquisadoras-da-educacao-basica-germinando-acoes-e-saberes-nas-escolas-publicas-perifericas,c3c5881a-c221-44be-ac60-d7dbc09cd7fb', '2020', 'Participação em livro'),
('Por um clima escolar racializado', 'https://pp.nexojornal.com.br/opiniao/2020/Por-um-clima-escolar-racializado', '2020', 'Texto'),
('Ciência do Afeto | Como a educação pode mudar as realidades de garotos negros', 'https://papodehomem.com.br/ciencia-do-afeto-or-como-a-educacao-pode-mudar-as-realidades-de-garotos-negros/', '2020', 'Texto'),
('“Ciência do afeto” e clima escolar: (re)pensando as masculinidades negras na escola pública', 'https://revistaperiferias.org/materia/ciencia-do-afeto-e-clima-escolar/', '2019', 'Texto'),
('Trajetórias escolares no município do Rio de Janeiro: estratégias familiares de escolarização', 'https://ppge.educacao.ufrj.br/disserta%C3%A7%C3%B5es2018/dWilliam%20Correa%20de%20Melo.pdf', '2018', 'Texto'),
('Trajetórias escolares no município do Rio de Janeiro: estratégias familiares de escolarização', 'http://revista.cfch.ufrj.br/images/edicao-siac2017/105.pdf', '2017', 'Texto'),
('Escrevivendo diálogos com a escola pública: por um projeto de educação antirracista e democrática', 'https://observatoriodeeducacao.institutounibanco.org.br/cedoc/detalhe/escrevivendo-dialogos-com-a-escola-publica-por-um-projeto-de-educacao-antirracista-e-democratica,f186428a-fab3-44e1-b8fc-006506e9b190?utm_source=Linkedin&utm_medium=Social&utm_id=Insituto+Unibanco+&utm_term=equidade,+antirracismo,+igualdade+nas+escolas', '2022', 'Participação em livro'),
('Cenário de Viela: o filme', 'https://www.youtube.com/watch?v=UHXyZp_XaFs', '2020', 'Cultura hiphop'),
('Cenário de Viela: album musical', 'https://www.youtube.com/watch?v=YTXACX0-CZY&list=PLE8tYNAPBV7ISqFf9zciHkFIUefPrpqBK', '2020', 'Cultura hiphop'),
('Queira ver e verá: entre os dados e o compromisso com a luta por igualdade racial', 'https://www.vozdascomunidades.com.br/geral/queira-ver-e-vera-entre-os-dados-e-o-compromisso-com-luta-por-igualdade-racial/', '2018', 'Texto'),
('“Não adianta mas vamos continuar”: da insatisfação ao julgamento moral que mata', 'https://www.vozdascomunidades.com.br/geral/opiniao-nao-adianta-mas-vamos-continuar-da-insatisfacao-ao-julgamento-moral-que-mata/', '2018', 'Texto'),
('“Tiroteio? Só se for de ideias!”: Educação, cultura e protagonismo juvenil', 'https://www.vozdascomunidades.com.br/geral/opiniao-tiroteio-so-se-for-de-ideias-educacao-cultura-e-protagonismo-juvenil/', '2018', 'Texto'),
('O uso de celulares para a ampliação de possibilidades de atuação juvenil', 'https://www.vozdascomunidades.com.br/geral/artigo-o-uso-de-celulares-para-ampliacao-de-possibilidades-de-atuacao-juvenil/', '2018', 'Texto'),
('Família, escola e sucesso escolar dos jovens de camadas populares', 'https://www.vozdascomunidades.com.br/geral/familia-escola-e-sucesso-escolar-dos-jovens-de-camadas-populares/', '2018', 'Texto'),
('Evasão escolar: mais uma das faces do racismo', 'https://www.vozdascomunidades.com.br/geral/opiniao-evasao-escolar-mais-uma-das-faces-do-racismo/', '2018', 'Texto'),
('Dicas para estudar com base em evidências científicas, pensando no território de favela', 'https://www.vozdascomunidades.com.br/geral/dicas-para-estudar-com-base-em-evidencias-cientificas-pensando-no-territorio-de-favela/', '2018', 'Texto'),
('Pelo fim das “demonizações” políticas e pela ampliação do diálogo: um início de reflexão', 'https://www.vozdascomunidades.com.br/geral/pelo-fim-das-demonizacoes-politicas-e-pela-ampliacao-do-dialogo-um-inicio-de-reflexao/', '2018', 'Texto'),
('Pandemia de Covid-19 e escolas públicas: entre as reinvenções e desigualdades educacionais', 'https://www.vozdascomunidades.com.br/destaques/pandemia-de-covid-19-e-escolas-publicas-entre-as-reinvencoes-e-desigualdades-educacionais/', '2018', 'Texto'),
('Escola pública e afeto: por uma prática dos elogios', 'https://www.vozdascomunidades.com.br/geral/opiniaoescola-publica-e-afeto-por-uma-pratica-dos-elogios/', '2018', 'Texto'),
('Ówe - demarcando identidades, suelando novos olhares educacionais: a centralidade de dados raciais para a educação', 'https://observatoriodeeducacao.institutounibanco.org.br/cedoc/detalhe/owe-demarcando-identidades-suelando-novos-olhares-educacionais,1c889b7f-8c3f-455f-a468-459e32c7291c', '2021', 'Participação em livro'),
('A atuação intersetorial na ampliação das oportunidades educacionais', 'https://www.youtube.com/watch?v=kbik9Xarf7g&ab_channel=cedacvideos', '2021', 'Mesa/Seminário');
