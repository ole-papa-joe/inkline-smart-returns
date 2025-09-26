import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calculator } from "lucide-react";
import type { Scenario } from "./ScenarioSidebar";

interface ScenarioResultsProps {
  scenario: Scenario | null;
}

export const ScenarioResults: React.FC<ScenarioResultsProps> = ({ scenario }) => {
  const formatCurrency = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "—";
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatPercent = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "—";
    return `${(value * 100).toFixed(1)}%`;
  };

  const getROIStatus = (roi: number | null) => {
    if (roi === null) return { color: "secondary", icon: Calculator, label: "Calculating..." };
    if (roi >= 0) return { color: "success", icon: TrendingUp, label: "Positive ROI" };
    return { color: "destructive", icon: TrendingDown, label: "Negative ROI" };
  };

  if (!scenario) {
    return (
      <Card className="h-full shadow-card bg-gradient-card border-border">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Scenario Selected</p>
            <p className="text-sm">Create or select a scenario to see ROI results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const roiStatus = getROIStatus(scenario.roi);
  const ROIIcon = roiStatus.icon;

  return (
    <Card className="h-full shadow-card bg-gradient-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Results</CardTitle>
          <div className="text-xs text-muted-foreground">
            Updated {new Date(scenario.updated_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">ROI</div>
                <Badge variant={roiStatus.color as any} className="flex items-center gap-1">
                  <ROIIcon className="w-3 h-3" />
                  {formatPercent(scenario.roi)}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {roiStatus.label}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Revenue Increase</div>
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(scenario.increase_revenue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current vs Projected */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Target className="w-4 h-4 mr-2 text-muted-foreground" />
              Current Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Outreach</span>
                <span className="font-medium text-foreground">{formatNumber(scenario.current_outreach)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Leads / Meetings</span>
                <span className="font-medium text-foreground">{formatNumber(scenario.current_leads)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Customers</span>
                <span className="font-medium text-foreground">{formatNumber(scenario.current_customers)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-semibold text-foreground">{formatCurrency(scenario.current_revenue)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              Projected Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Outreach</span>
                <span className="font-medium text-foreground">{formatNumber(scenario.projected_outreach)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Leads / Meetings</span>
                <span className="font-medium text-foreground">{formatNumber(scenario.projected_leads)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Customers</span>
                <span className="font-medium text-foreground">{formatNumber(scenario.projected_customers)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-semibold text-foreground">{formatCurrency(scenario.projected_revenue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Increase */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2 text-success" />
            Performance Increase
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-3 px-4 bg-success/5 rounded-lg border border-success/20">
              <span className="text-sm text-muted-foreground">Leads Increase</span>
              <span className="font-semibold text-success">+{formatNumber(scenario.increase_leads)}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-success/5 rounded-lg border border-success/20">
              <span className="text-sm text-muted-foreground">Revenue Increase</span>
              <span className="font-semibold text-success">+{formatCurrency(scenario.increase_revenue)}</span>
            </div>
          </div>
        </div>

        {/* Breakeven Analysis */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Calculator className="w-4 h-4 mr-2 text-accent" />
            Breakeven Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Leads Needed to Break Even</div>
                <div className="text-xl font-bold text-foreground">
                  {formatNumber(scenario.leads_needed)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Outreach Needed to Break Even</div>
                <div className="text-xl font-bold text-foreground">
                  {formatNumber(scenario.outreach_needed)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Investment Summary */}
        <div className="bg-muted/10 rounded-lg p-4 border border-border">
          <h4 className="font-medium text-foreground mb-3">Investment Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">inkline Investment:</span>
              <span className="text-foreground">{formatCurrency(scenario.inkline_investment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue Increase:</span>
              <span className="text-success">{formatCurrency(scenario.increase_revenue)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span className="text-foreground">Net Gain/Loss:</span>
              <span className={scenario.increase_revenue - scenario.inkline_investment >= 0 ? "text-success" : "text-destructive"}>
                {formatCurrency(scenario.increase_revenue - scenario.inkline_investment)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};