import { api } from '../lib/api';
import { Research } from '../types/researcher';

const ensureArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

/**
 * Busca todos os pesquisadores cadastrados.
 */
export const getAllResearchers = async (): Promise<Research[]> => {
  const { data } = await api.get('researcherName', {
    params: { name: '' },
  });
  return ensureArray(data);
};

/**
 * Busca os dados completos de uma listagem específica para fins de exportação em CSV.
 * @param tab Identificador da aba ativa (ex: bolsistas, article, book, patent, etc.)
 */
export const getListagemExportData = async (tab: string): Promise<any[]> => {
  switch (tab) {
    case 'article': {
      const { data } = await api.get('bibliographic_production_researcher', {
        params: {
          terms: '',
          researcher_id: '',
          type: 'ARTICLE',
          qualis: '',
          year: '1900',
        },
      });
      return ensureArray(data);
    }

    case 'pesquisadores': {
      const { data } = await api.get('researcherName', {
        params: { name: '' },
      });
      return ensureArray(data);
    }

    case 'speaker': {
      const { data } = await api.get('pevent_researcher', {
        params: {
          researcher_id: '',
          year: '1990',
          term: '',
          nature: '',
          distinct: '0',
        },
      });
      return ensureArray(data);
    }

    case 'patent': {
      const { data } = await api.get('patent_production_researcher', {
        params: {
          researcher_id: '',
          year: '1900',
          term: '',
          distinct: '',
        },
      });
      return ensureArray(data);
    }

    case 'book': {
      // Busca livros e capítulos simultaneamente e unifica os resultados
      const [booksResponse, chaptersResponse] = await Promise.allSettled([
        api.get('book_production_researcher', {
          params: { researcher_id: '', year: '1900', term: '', distinct: '0' },
        }),
        api.get('book_chapter_production_researcher', {
          params: { researcher_id: '', year: '1900', term: '', distinct: '0' },
        }),
      ]);

      const books =
        booksResponse.status === 'fulfilled'
          ? ensureArray(booksResponse.value.data)
          : [];
      const chapters =
        chaptersResponse.status === 'fulfilled'
          ? ensureArray(chaptersResponse.value.data)
          : [];

      return [...books, ...chapters];
    }

    case 'bolsistas': {
      const { data } = await api.get('researcher/foment');
      return ensureArray(data);
    }

    case 'software': {
      const { data } = await api.get('software_production_researcher', {
        params: { researcher_id: '', year: '1900', distinct: '0' },
      });
      return ensureArray(data);
    }

    case 'brand': {
      const { data } = await api.get('brand_production_researcher', {
        params: { researcher_id: '', year: '1900', distinct: '0' },
      });
      return ensureArray(data);
    }

    case 'relatorio-tecnico': {
      const { data } = await api.get('researcher_report', {
        params: { researcher_id: '', year: '1900', distinct: '0' },
      });
      return ensureArray(data);
    }

    case 'orientacoes': {
      const { data } = await api.get('guidance_researcher', {
        params: { researcher_id: '', year: '1990', distinct: '0' },
      });
      return ensureArray(data);
    }

    case 'research-project': {
      const { data } = await api.get('researcher_research_project', {
        params: { researcher_id: '', term: '', year: '', distinct: '0' },
      });
      return ensureArray(data);
    }

    case 'texto-revista': {
      const { data } = await api.get('papers_magazine', {
        params: { researcher_id: '', year: '1990', distinct: '0' },
      });
      return ensureArray(data);
    }

    case 'work-event': {
      const { data } = await api.get('researcher_production/events', {
        params: { researcher_id: '', year: '1990', distinct: '0' },
      });
      return ensureArray(data);
    }

    case 'magazine': {
      const { data } = await api.get('magazine', {
        params: { sort_by: 'qualis', sort_order: 'asc' },
      });
      return ensureArray(data);
    }

    case 'tecnicos': {
      const { data } = await api.get('ufmg/technician');
      return ensureArray(data);
    }

    default:
      return [];
  }
};
