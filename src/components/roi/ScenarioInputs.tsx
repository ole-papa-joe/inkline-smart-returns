import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2 } from "lucide-react";

interface ScenarioInputsProps {
  name: string;
  currentOutreach: string;
  bookingPct: string;
  closePct: string;
  avgCustomerValue: string;
  projectedOutreach: string;
  inklineInvestment: string;
  onNameChange: (value: string) => void;
  onCurrentOutreachChange: (value: string) => void;
  onBookingPctChange: (value: string) => void;
  onClosePctChange: (value: string) => void;
  onAvgCustomerValueChange: (value: string) => void;
  onProjectedOutreachChange: (value: string) => void;
  onInklineInvestmentChange: (value: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  activeId: string | null;
  loading?: boolean;
}

export const ScenarioInputs: React.FC<ScenarioInputsProps> = ({
  name,
  currentOutreach,
  bookingPct,
  closePct,
  avgCustomerValue,
  projectedOutreach,
  inklineInvestment,
  onNameChange,
  onCurrentOutreachChange,
  onBookingPctChange,
  onClosePctChange,
  onAvgCustomerValueChange,
  onProjectedOutreachChange,
  onInklineInvestmentChange,
  onSave,
  onDelete,
  activeId,
  loading = false,
}) => {
  return (
    <Card className="h-full shadow-card bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Scenario Inputs</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name" className="text-foreground">Scenario Name</Label>
            <Input
              id="scenario-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter scenario name"
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-outreach" className="text-foreground">Current Outreach (annual)</Label>
              <Input
                id="current-outreach"
                type="number"
                value={currentOutreach}
                onChange={(e) => onCurrentOutreachChange(e.target.value)}
                placeholder="1000"
                min="0"
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="booking-pct" className="text-foreground">Lead Booking Conversion (%)</Label>
              <Input
                id="booking-pct"
                type="number"
                value={bookingPct}
                onChange={(e) => onBookingPctChange(e.target.value)}
                placeholder="8"
                min="0"
                max="100"
                step="0.1"
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="close-pct" className="text-foreground">Sales Close Rate (%)</Label>
              <Input
                id="close-pct"
                type="number"
                value={closePct}
                onChange={(e) => onClosePctChange(e.target.value)}
                placeholder="30"
                min="0"
                max="100"
                step="0.1"
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avg-customer-value" className="text-foreground">Average Customer Value (USD)</Label>
              <Input
                id="avg-customer-value"
                type="number"
                value={avgCustomerValue}
                onChange={(e) => onAvgCustomerValueChange(e.target.value)}
                placeholder="8000"
                min="0"
                step="0.01"
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projected-outreach" className="text-foreground">Projected Outreach (annual)</Label>
              <Input
                id="projected-outreach"
                type="number"
                value={projectedOutreach}
                onChange={(e) => onProjectedOutreachChange(e.target.value)}
                placeholder="2000"
                min="0"
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inkline-investment" className="text-foreground">inkline LeadGen Investment (USD)</Label>
              <Input
                id="inkline-investment"
                type="number"
                value={inklineInvestment}
                onChange={(e) => onInklineInvestmentChange(e.target.value)}
                placeholder="24000"
                min="0"
                step="0.01"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button 
            onClick={onSave} 
            disabled={loading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : activeId ? "Save Changes" : "Save Scenario"}
          </Button>
          
          {activeId && onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              disabled={loading}
              className="px-4"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
          <strong>Tip:</strong> Percentages accept values from 0-100 and are automatically converted to decimals for calculations (e.g., 8% → 0.08).
        </div>
      </CardContent>
    </Card>
  );
};