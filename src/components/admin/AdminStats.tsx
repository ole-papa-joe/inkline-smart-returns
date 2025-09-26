import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calculator, TrendingUp, DollarSign } from 'lucide-react';

interface AdminStatsData {
  totalUsers: number;
  totalScenarios: number;
  totalInvestment: number;
  avgROI: number;
}

export const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsData>({
    totalUsers: 0,
    totalScenarios: 0,
    totalInvestment: 0,
    avgROI: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Get scenario stats
      const { data: scenarios, error: scenarioError } = await supabase
        .from('scenarios')
        .select('inkline_investment, roi');

      if (scenarioError) throw scenarioError;

      const totalScenarios = scenarios?.length || 0;
      const totalInvestment = scenarios?.reduce((sum, s) => sum + (s.inkline_investment || 0), 0) || 0;
      const validROIs = scenarios?.filter(s => s.roi !== null).map(s => s.roi) || [];
      const avgROI = validROIs.length > 0 
        ? validROIs.reduce((sum, roi) => sum + roi, 0) / validROIs.length 
        : 0;

      setStats({
        totalUsers: userCount || 0,
        totalScenarios,
        totalInvestment,
        avgROI,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-card bg-gradient-card border-border">
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-card bg-gradient-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Registered accounts
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-gradient-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Scenarios
          </CardTitle>
          <Calculator className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.totalScenarios}</div>
          <p className="text-xs text-muted-foreground">
            ROI calculations created
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-gradient-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Investment
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(stats.totalInvestment)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all scenarios
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-gradient-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average ROI
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatPercent(stats.avgROI)}
          </div>
          <p className="text-xs text-muted-foreground">
            Mean return on investment
          </p>
        </CardContent>
      </Card>
    </div>
  );
};