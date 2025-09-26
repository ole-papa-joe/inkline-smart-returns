import { ROICalculator } from "@/components/ROICalculator";
import { InklineHeader } from "@/components/InklineHeader";
import { FloatingLogo } from "@/components/FloatingLogo";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <InklineHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <ROICalculator />
      </div>
      <FloatingLogo />
    </div>
  );
};

export default Index;