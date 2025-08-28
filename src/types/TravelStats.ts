export interface TravelStats {
  totalMileageKm: number;
  townsVisited: number;
  townsPerState: Record<string, number>;
}

export interface TravelStatsBoxProps {
  stats: TravelStats;
  title?: string;
  expandable?: boolean;
  initialExpanded?: boolean;
  className?: string;
}
