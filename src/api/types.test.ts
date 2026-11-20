import { describe, expectTypeOf, it } from 'vitest';
import type {
  DetailData,
  DetailPath,
  ListFilters,
  ListItem,
  ListPath,
  PathParamsOf,
  QueryOf,
  Schemas,
} from './types';

// Verificações de tipo: rodam no `tsc` (typecheck) e no vitest.
describe('helpers de envelope', () => {
  it('extraem item e filtros de listas paginadas', () => {
    expectTypeOf<ListItem<'/researcher'>>().toEqualTypeOf<
      Schemas['ResearcherSummary']
    >();
    expectTypeOf<ListItem<'/production/article'>>().toEqualTypeOf<
      Schemas['ArticleSummary']
    >();
    expectTypeOf<ListFilters<'/graduate-program'>>().toEqualTypeOf<
      Schemas['GraduateProgramFilter']
    >();
  });

  it('extraem a entidade de detalhes', () => {
    expectTypeOf<DetailData<'/researcher/{researcher_id}'>>().toEqualTypeOf<
      Schemas['ResearcherDetail']
    >();
    expectTypeOf<
      DetailData<'/production/article/{article_id}'>
    >().toEqualTypeOf<Schemas['ArticleDetail']>();
  });

  it('separam lista paginada, lista curta e detalhe', () => {
    expectTypeOf<'/researcher'>().toExtend<ListPath>();
    expectTypeOf<'/researcher'>().not.toExtend<DetailPath>();
    expectTypeOf<'/researcher/{researcher_id}'>().toExtend<DetailPath>();
    expectTypeOf<'/researcher/{researcher_id}'>().not.toExtend<ListPath>();
    expectTypeOf<'/suggestion'>().not.toExtend<ListPath>();
    expectTypeOf<'/suggestion'>().not.toExtend<DetailPath>();
  });

  it('expõem parâmetros de query e de caminho', () => {
    expectTypeOf<QueryOf<'/researcher'>>().toHaveProperty('q');
    expectTypeOf<PathParamsOf<'/researcher/{researcher_id}'>>().toEqualTypeOf<{
      researcher_id: string;
    }>();
  });
});
