import { getDb } from './drug-db.js';
import { hasAi, aiChat } from './ai-provider.js';

/**
 * @param {{ messages: {role:string,content:string}[], profile: object }} input
 */
export async function handleConversation({ messages, profile = {} }) {
  const db = getDb();
  const drugCatalog = db.drugs
    .map((d) => `${d.name} (${d.activeIngredient}): ${d.indications}`)
    .join('\n');

  if (!hasAi()) {
    return {
      reply:
        'Mình chưa kết nối AI — bạn mô tả triệu chứng hoặc tên thuốc cụ thể để mình tra trong database demo nhé.',
      lookupDrug: null,
      condition: null,
    };
  }

  const result = await aiChat(messages, profile, drugCatalog, db.meta.disclaimer);
  return result;
}
