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

export const EMPTY_REALTOR: Omit<Realtor, 'id' | 'created_at'> = {
  // FIX: Add user_id to satisfy the type. It will be set by RLS on insert.
  user_id: '',
  full_name: '',
  agency: '',
  role: '',
  phone: '',
  email: '',
  location: '',
  // FIX: Changed from `''` to `null` to match the updated `Realtor` interface type.
  instagram_profile_url: null,
  production_level: ProductionLevel.Low,
  team_size: TeamSize.Individual,
  experience_years: null,
  specialization: '',
  annual_transactions: null,
  pain_points: '',
  pain_point_tags: null,
  tech_adoption: TechAdoption.Low,
  current_tools: '',
  ai_interest: AIInterest.Low,
  lead_source: '',
  first_contact_date: null,
  funnel_stage: FunnelStage.Prospect,
  last_activity_date: null,
  next_action: '',
  notes: '',
  proposed_solution: '',
  potential_contract_value: null,
};