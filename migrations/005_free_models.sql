-- 100% Free AI Models — OpenRouter + OpenCode
-- Clears old (paid) models, seeds only free models + user's API keys

-- Clear existing models
DELETE FROM ai_models;

-- ─── OpenRouter Free Models (23 models) ───
-- Tier 1 = Best quality, Tier 4 = Fast/lightweight

INSERT INTO ai_models (model_id, name, provider, tier, is_active) VALUES
-- Tier 1: Best free models for complex tasks
('meta-llama/llama-3.3-70b-instruct:free',   'Llama 3.3 70B Instruct',     'openrouter', 1, 1),
('nousresearch/hermes-3-llama-3.1-405b:free','Hermes 3 405B Instruct',     'openrouter', 1, 1),
('nvidia/nemotron-3-ultra-550b-a55b:free',    'Nemotron 3 Ultra 550B',      'openrouter', 1, 1),

-- Tier 2: Strong general-purpose
('google/gemma-4-31b-it:free',               'Gemma 4 31B',               'openrouter', 2, 1),
('qwen/qwen3-next-80b-a3b-instruct:free',    'Qwen3 Next 80B A3B',        'openrouter', 2, 1),
('nvidia/nemotron-3-super-120b-a12b:free',    'Nemotron 3 Super 120B',     'openrouter', 2, 1),

-- Tier 3: Good balance of speed/quality
('google/gemma-4-26b-a4b-it:free',           'Gemma 4 26B A4B',           'openrouter', 3, 1),
('nvidia/nemotron-3-nano-30b-a3b:free',       'Nemotron 3 Nano 30B A3B',   'openrouter', 3, 1),
('qwen/qwen3-coder:free',                     'Qwen3 Coder 480B A35B',    'openrouter', 3, 1),

-- Tier 4: Fast, lightweight
('meta-llama/llama-3.2-3b-instruct:free',    'Llama 3.2 3B Instruct',     'openrouter', 4, 1),
('nvidia/nemotron-nano-9b-v2:free',           'Nemotron Nano 9B V2',       'openrouter', 4, 1),
('tencent/hy3:free',                          'Tencent Hy3',               'openrouter', 4, 1),

-- Special: OpenRouter's free model router (tries any available free model)
('openrouter/free',                           'Free Models Router',        'openrouter', 1, 1);

-- ─── OpenCode Free Models ───
-- OpenCode's free-tier models (no pricing data returned, treated as free)

INSERT INTO ai_models (model_id, name, provider, tier, is_active) VALUES
('deepseek-v4-flash-free',   'DeepSeek V4 Flash Free',  'opencode', 1, 1),
('mimo-v2.5-free',          'Mimo V2.5 Free',          'opencode', 2, 1),
('hy3-free',                'Hy3 Free',                'opencode', 2, 1),
('nemotron-3-ultra-free',   'Nemotron 3 Ultra Free',   'opencode', 3, 1),
('north-mini-code-free',    'North Mini Code Free',    'opencode', 4, 1),
('deepseek-v4-flash',       'DeepSeek V4 Flash',       'opencode', 1, 1),
('gemini-3.5-flash',        'Gemini 3.5 Flash',        'opencode', 2, 1),
('gemini-3-flash',          'Gemini 3 Flash',          'opencode', 3, 1),
('gpt-5.4-mini',            'GPT 5.4 Mini',            'opencode', 3, 1),
('gpt-5.4-nano',            'GPT 5.4 Nano',            'opencode', 4, 1),
('qwen3.5-plus',            'Qwen 3.5 Plus',           'opencode', 2, 1),
('grok-4.5',                'Grok 4.5',                'opencode', 2, 1),
('claude-haiku-4-5',        'Claude Haiku 4.5',        'opencode', 2, 1),
('minimax-m3',              'MiniMax M3',              'opencode', 3, 1),
('glm-5',                   'GLM 5',                   'opencode', 3, 1),
('kimi-k2.5',               'Kimi K2.5',               'opencode', 3, 1);

-- API keys should be added via /api/ai/models/seed endpoint
-- or through the AI Settings page in the dashboard.
