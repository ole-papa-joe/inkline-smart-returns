import hiveAiLogo from "@/assets/hive-ai-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-border/30 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center">
          <div className="w-1/4 flex items-center justify-center gap-2">
            <span className="text-primary text-sm italic">Powered By</span>
            <a 
              href="https://buddy.gohive.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={hiveAiLogo} 
                alt="Hive AI" 
                className="h-24 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};