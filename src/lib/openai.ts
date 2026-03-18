import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('Chave da OpenAI (VITE_OPENAI_API_KEY) não encontrada no arquivo .env!');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'missing-key',
  dangerouslyAllowBrowser: true, // Permite rodar direto no front-end para facilitar testes/hospedagem simples
});
