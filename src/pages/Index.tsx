import { ROICalculator } from "@/components/ROICalculator";
import { InklineHeader } from "@/components/InklineHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <InklineHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <ROICalculator />
      </div>
    </div>
  );
};

export default Index;