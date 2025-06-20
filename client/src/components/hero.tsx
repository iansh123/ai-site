export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-32 pb-32 px-6">
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-12 text-foreground text-balance tracking-tight leading-[0.9]">
          AI Automation
          <br />
          <span className="text-muted-foreground">for Business</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
          We create intelligent automation systems that save your business time and money.
        </p>
        
        <button 
          onClick={scrollToContact}
          className="bg-foreground text-background px-12 py-4 rounded-full text-lg font-semibold hover:bg-muted-foreground transition-all duration-300 transform hover:scale-105"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
