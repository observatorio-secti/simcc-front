import type {
  MariaBlock,
  MariaConversationDetail,
  MariaMessage,
  MariaSchema,
} from '@/api/maria';

// Conversa com a MarIA. Os tipos vêm do OpenAPI da MarIA
// (`src/api/generated/maria.d.ts`).

export type Conversation = MariaConversationDetail;
export type ConversationMessage = MariaMessage;
export type ConversationBlock = MariaBlock;

export type TextBlock = MariaSchema<'TextBlock'>;
export type ResearchersBlock = MariaSchema<'ResearchersBlock'>;
export type ProductionsBlock = MariaSchema<'ProductionsBlock'>;
export type GraduateProgramsBlock = MariaSchema<'GraduateProgramsBlock'>;
export type ResearchGroupsBlock = MariaSchema<'ResearchGroupsBlock'>;
export type SuggestionsBlock = MariaSchema<'SuggestionsBlock'>;
export type TableBlock = MariaSchema<'TableBlock'>;
export type ChartBlock = MariaSchema<'ChartBlock'>;
export type BlockOrigin = MariaSchema<'BlockOrigin'>;
export type CitedResearcher = MariaSchema<'ResearcherCard'>;
export type CitedProduction = MariaSchema<'ProductionCard'>;
export type CitedGraduateProgram = MariaSchema<'GraduateProgramCard'>;
export type CitedResearchGroup = MariaSchema<'ResearchGroupCard'>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A MarIA identifica conversas por UUID; outro formato nem vai à API. */
export function isConversationId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export const UNTITLED_CONVERSATION = 'Conversa sem título';

export function conversationTitle(
  conversation: Pick<Conversation, 'title'> | null | undefined,
): string {
  return conversation?.title?.trim() || UNTITLED_CONVERSATION;
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Data curta da conversa ("22 de nov. de 2026"). */
export function formatConversationDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date);
}

/** Hora de uma mensagem ("08:54"). */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : timeFormat.format(date);
}

/** Perguntas que ainda cabem na conversa; `null` quando não há limite. */
export function remainingQuestions(
  conversation: Pick<Conversation, 'questions_asked' | 'questions_limit'>,
): number | null {
  const { questions_limit: limit, questions_asked: asked } = conversation;
  if (limit == null) return null;
  return Math.max(0, limit - asked);
}

/** Texto corrido dos blocos de texto de uma mensagem (pergunta do usuário). */
export function messageText(message: Pick<ConversationMessage, 'content'>) {
  return message.content
    .filter((block): block is TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n\n');
}
