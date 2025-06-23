import Header from "@/components/header";
import Hero from "@/components/hero";
import Services from "@/components/services";
import About from "@/components/about";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import logoImage from "@assets/logo-color-code-0F2D45_1750696003186.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
