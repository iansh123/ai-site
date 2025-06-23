import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/logo-color-code-0F2D45_1750696003186.png";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoImage} alt="IC AI Solutions" className="h-8 w-auto" />
            <span className="text-xl font-bold text-foreground">IC AI Solutions</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Contact
            </button>
            <Link href="/admin">
              <span className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer">
                Admin
              </span>
            </Link>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-6 py-4 space-y-4">
            <button 
              onClick={() => scrollToSection('home')}
              className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
