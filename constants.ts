import { FunnelStage, ProductionLevel, TeamSize, TechAdoption, AIInterest, Realtor } from './types';

export const FUNNEL_STAGES_ORDER: FunnelStage[] = [
  FunnelStage.Prospect,
  FunnelStage.Contacted,
  FunnelStage.Qualified,
  FunnelStage.DemoScheduled,
  FunnelStage.ProposalSent,
  FunnelStage.Negotiation,
  FunnelStage.Won,
  FunnelStage.Lost,
  FunnelStage.Nurturing,
];

export const FUNNEL_STAGE_COLORS: { [key in FunnelStage]: string } = {
  [FunnelStage.Prospect]: '#7dd3fc',
  [FunnelStage.Contacted]: '#38bdf8',
  [FunnelStage.Qualified]: '#0ea5e9',
  [FunnelStage.DemoScheduled]: '#0284c7',
  [FunnelStage.ProposalSent]: '#0369a1',
  [FunnelStage.Negotiation]: '#a16207',
  [FunnelStage.Won]: '#16a34a',
  [FunnelStage.Lost]: '#dc2626',
  [FunnelStage.Nurturing]: '#ca8a04',
};

// FIX: Remove user_id as it will be set by RLS on insert, which is a more secure and reliable pattern.
// The type is updated to Omit user_id as well to enforce this at compile time.
export const EMPTY_REALTOR: Omit<Realtor, 'id' | 'created_at' | 'user_id'> = {
  full_name: '',
  agency: null,
  role: null,
  phone: null,
  email: null,
  location: null,
  // FIX: Changed from `''` to `null` to match the updated `Realtor` interface type.
  instagram_profile_url: null,
  production_level: ProductionLevel.Low,
  team_size: TeamSize.Individual,
  experience_years: null,
  specialization: null,
  annual_transactions: null,
  pain_points: null,
  pain_point_tags: null,
  tech_adoption: TechAdoption.Low,
  current_tools: null,
  ai_interest: AIInterest.Low,
  lead_source: null,
  first_contact_date: null,
  funnel_stage: FunnelStage.Prospect,
  last_activity_date: null,
  next_action: null,
  notes: null,
  proposed_solution: null,
  potential_contract_value: null,
};