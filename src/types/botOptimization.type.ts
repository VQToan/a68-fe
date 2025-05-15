// Bot Optimization Types
export interface BotOptimizationRequest {
  bot_template_id: string;
  backtest_process_ids: string[];
  llm_provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  api_key: string;
}

export interface OptimizedParameter {
  name: string;
  current_value: any;
  optimized_value: any;
  explanation: string;
}

export interface BotOptimizationResponse {
  bot_template_id: string;
  optimized_parameters: OptimizedParameter[];
  overall_explanation: string;
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  is_recommended: boolean;
}

export interface OptimizationState {
  optimizationResults: BotOptimizationResponse | null;
  isLoading: boolean;
  error: string | null;
}