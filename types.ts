
export enum FunnelStage {
  Prospect = 'Prospect',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  DemoScheduled = 'Demo/Presentation Agendada',
  ProposalSent = 'Propuesta Enviada',
  Negotiation = 'Negociación',
  Won = 'Ganado/Cerrado',
  Lost = 'Perdido',
  Nurturing = 'En Nurturing',
}

export enum ProductionLevel {
  Low = '$50k-$100k',
  Medium = '$100k-$250k',
  High = '$250k+',
}

export enum TeamSize {
  Individual = 'Individual',
  Small = 'Equipo Pequeño (2-5)',
  Large = 'Equipo Grande (6+)',
}

export enum TechAdoption {
  Low = 'Bajo',
  Medium = 'Medio',
  High = 'Alto',
}

export enum AIInterest {
  Low = 'Bajo',
  Medium = 'Medio',
  High = 'Alto',
}

export interface Realtor {
  id: string;
  user_id: string; // Added user_id to link realtor to a user
  created_at: string;
  full_name: string;
  agency: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  instagram_profile_url: string | null;
  production_level: ProductionLevel;
  team_size: TeamSize;
  experience_years: number | null;
  specialization: string;
  annual_transactions: number | null;
  pain_points: string;
  pain_point_tags: string[] | null;
  tech_adoption: TechAdoption;
  current_tools: string;
  ai_interest: AIInterest;
  lead_source: string;
  first_contact_date: string | null;
  funnel_stage: FunnelStage;
  last_activity_date: string | null;
  next_action: string;
  notes: string;
  proposed_solution: string;
  potential_contract_value: number | null;
}

export interface RealtorActivity {
  id: string;
  realtor_id: string;
  user_id: string;
  created_at: string;
  activity_type: string;
  details: string;
}