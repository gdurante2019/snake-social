import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-pixel text-glow animate-blink">404</h1>
        <h2 className="text-xl font-pixel text-muted-foreground">GAME OVER</h2>
        <p className="text-sm font-mono text-muted-foreground">
          This page doesn't exist in the arcade
        </p>
      </div>
      
      <Link to="/">
        <Button variant="arcade" size="lg">
          <Home className="h-5 w-5 mr-2" />
          RETURN HOME
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
