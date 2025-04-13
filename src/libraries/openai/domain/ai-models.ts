import { AIPrice } from '@/types/ai-price';
import { AIModel } from './ai-model';
import { AIProvider } from './ai-provider';

export const AI_MODELS = {
  GPT_4O: new AIModel(
    'gpt-4o',
    AIPrice.set(0.005),
    AIPrice.set(0.015),
    'built-in',
    true,
  ),
  GPT_4O_MINI: new AIModel(
    'gpt-4o-mini',
    AIPrice.set(0.00015),
    AIPrice.set(0.0006),
    'built-in',
    true,
  ),
  GPT_4O_TTS: new AIModel(
    'gpt-4o-tts',
    AIPrice.set(0),
    AIPrice.set(0),
    'built-in',
    false,
  ),
  GPT_4O_MINI_TTS: new AIModel(
    'gpt-4o-mini-tts',
    AIPrice.set(0),
    AIPrice.set(0),
    'built-in',
    false,
  ),
  GPT_4O_TRANSCRIBE: new AIModel(
    'gpt-4o-transcribe',
    AIPrice.set(0),
    AIPrice.set(0),
    'built-in',
    false,
  ),
  GPT_4O_MINI_TRANSCRIBE: new AIModel(
    'gpt-4o-mini-transcribe',
    AIPrice.set(0),
    AIPrice.set(0),
    'built-in',
    false,
  ),
  GEMINI_2_FLASH: new AIModel(
    'gemini-2.0-flash',
    AIPrice.set(0.00035), // $0.00035 per 1K input tokens
    AIPrice.set(0.00035), // $0.00035 per 1K output tokens
    'built-in',
    true,
    AIProvider.GOOGLE,
  ),
};
