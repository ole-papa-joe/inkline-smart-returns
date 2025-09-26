import { Calculator, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import inklineHeaderLogo from "@/assets/inkline-logo-new.png";

export const InklineHeader = () => {
  return (
    <header className="bg-black border-b border-border/30">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
        Get Your FREE Online Performance Review With A 10-Step Action Plan TODAY! Email: info@inklineonline.com
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={inklineHeaderLogo} 
              alt="inkline Digital Marketing" 
              className="h-16 w-auto"
            />
          </div>

          {/* Contact Info */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>1-610-844-0300</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>info@inklineonline.com</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};