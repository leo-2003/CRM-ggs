

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
  // FIX: user_id is NOT NULL in the database with a default value.
  // It is defined as required here because any row selected from the database
  // will always have this field populated. The `Insert` and `Update` types
  // in `supabaseClient.ts` correctly omit it for write operations.
  user_id: string;
  created_at: string;
  full_name: string;
  agency: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  instagram_profile_url: string | null;
  production_level: ProductionLevel;
  team_size: TeamSize;
  experience_years: number | null;
  specialization: string | null;
  annual_transactions: number | null;
  pain_points: string | null;
  pain_point_tags: string[] | null;
  tech_adoption: TechAdoption;
  current_tools: string | null;
  ai_interest: AIInterest;
  lead_source: string | null;
  first_contact_date: string | null;
  funnel_stage: FunnelStage;
  last_activity_date: string | null;
  next_action: string | null;
  notes: string | null;
  proposed_solution: string | null;
  potential_contract_value: number | null;
}

export interface RealtorActivity {
  id: string;
  realtor_id: string;
  // FIX: user_id is NOT NULL in the database with a default value.
  // It is defined as required here because any row selected from the database
  // will always have this field populated. The `Insert` and `Update` types
  // in `supabaseClient.ts` correctly omit it for write operations.
  user_id: string;
  created_at: string;
  activity_type: string;
  details: string;
}