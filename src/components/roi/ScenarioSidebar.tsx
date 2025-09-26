import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";

export interface Scenario {
  id: string;
  owner_id: string;
  org_id: string | null;
  name: string;
  current_outreach: number;
  booking_pct: number;
  close_pct: number;
  avg_customer_value: number;
  projected_outreach: number;
  inkline_investment: number;
  current_leads: number;
  current_customers: number;
  current_revenue: number;
  projected_leads: number;
  projected_customers: number;
  projected_revenue: number;
  increase_leads: number;
  increase_revenue: number;
  leads_needed: number | null;
  outreach_needed: number | null;
  roi: number | null;
  created_at: string;
  updated_at: string;
}

interface ScenarioSidebarProps {
  scenarios: Scenario[];
  activeId: string | null;
  onScenarioSelect: (id: string) => void;
  onNewScenario: () => void;
  onSignOut: () => void;
  userEmail?: string;
}

export const ScenarioSidebar: React.FC<ScenarioSidebarProps> = ({
  scenarios,
  activeId,
  onScenarioSelect,
  onNewScenario,
  onSignOut,
  userEmail,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatROI = (roi: number | null) => {
    if (roi === null) return "—";
    return `${(roi * 100).toFixed(1)}%`;
  };

  const getROIColor = (roi: number | null) => {
    if (roi === null) return "secondary";
    return roi >= 0 ? "success" : "destructive";
  };

  return (
    <Card className="h-full flex flex-col shadow-card bg-gradient-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">My Scenarios</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Button>
        </div>
        {userEmail && (
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1 overflow-auto">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                activeId === scenario.id
                  ? 'border-primary bg-primary/10 shadow-inkline'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground truncate pr-2">
                  {scenario.name}
                </h3>
                <Badge 
                  variant={getROIColor(scenario.roi) as any}
                  className="ml-2 flex-shrink-0"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {formatROI(scenario.roi)}
                </Badge>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(scenario.updated_at)}
              </div>
            </button>
          ))}
          
          {scenarios.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No scenarios yet</p>
              <p className="text-sm">Create your first ROI scenario to get started</p>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-border">
          <Button 
            onClick={onNewScenario} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            New Scenario
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};