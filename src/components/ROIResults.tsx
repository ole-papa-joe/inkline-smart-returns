import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar } from "lucide-react";

interface ROIData {
  initialInvestment: number;
  finalValue: number;
  timePeriod: number;
  roiPercentage: number;
  totalReturn: number;
  annualizedReturn: number;
}

interface ROIResultsProps {
  data: ROIData;
}

export const ROIResults = ({ data }: ROIResultsProps) => {
  const isPositive = data.roiPercentage > 0;
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatPercentage = (percentage: number) => 
    `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Main ROI Result */}
      <Card className={`${
        isPositive 
          ? "bg-gradient-success shadow-success border-success/20" 
          : "bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20"
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-6 h-6 text-success-foreground" />
              ) : (
                <TrendingDown className="w-6 h-6 text-destructive" />
              )}
              ROI Result
            </span>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                isPositive ? "text-success-foreground" : "text-destructive"
              }`}>
                {formatPercentage(data.roiPercentage)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Return: {formatCurrency(data.totalReturn)}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Initial Investment</div>
                <div className="text-2xl font-semibold">{formatCurrency(data.initialInvestment)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Final Value</div>
                <div className="text-2xl font-semibold">{formatCurrency(data.finalValue)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Time Period</div>
                <div className="text-2xl font-semibold">{data.timePeriod} {data.timePeriod === 1 ? 'Year' : 'Years'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annualized Return */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            Annualized Return
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">
              Average yearly return over {data.timePeriod} {data.timePeriod === 1 ? 'year' : 'years'}
            </div>
            <div className={`text-2xl font-bold ${
              data.annualizedReturn > 0 ? "text-success" : "text-destructive"
            }`}>
              {formatPercentage(data.annualizedReturn)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Summary */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Investment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-muted-foreground">Initial Investment:</span>
            <span className="font-medium">{formatCurrency(data.initialInvestment)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-muted-foreground">Final Value:</span>
            <span className="font-medium">{formatCurrency(data.finalValue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-muted-foreground">Net Gain/Loss:</span>
            <span className={`font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
              {formatCurrency(data.totalReturn)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 pt-4">
            <span className="text-lg font-medium">ROI Percentage:</span>
            <span className={`text-lg font-bold ${isPositive ? "text-success" : "text-destructive"}`}>
              {formatPercentage(data.roiPercentage)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};