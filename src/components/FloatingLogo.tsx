import hiveAiLogoWhite from "@/assets/hive-ai-logo-white.png";

export const FloatingLogo = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href="https://buddy.gohive.ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col items-center hover:scale-105 transition-transform duration-200"
      >
        <span className="text-primary text-sm font-medium mb-1">Powered By</span>
        <img 
          src={hiveAiLogoWhite} 
          alt="Hive AI" 
          className="h-16 w-auto drop-shadow-lg"
        />
      </a>
    </div>
  );
};