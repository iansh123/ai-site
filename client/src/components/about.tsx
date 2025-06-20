export default function About() {
  return (
    <section id="about" className="py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground tracking-tight">
            About IC AI Solutions
          </h2>
        </div>
        
        <div className="text-center">
          <p className="text-2xl md:text-3xl text-muted-foreground mb-12 leading-relaxed font-medium max-w-4xl mx-auto">
            We are a technology company dedicated to helping businesses harness the power of artificial intelligence for operational excellence.
          </p>
          <p className="text-xl text-muted-foreground mb-16 leading-relaxed max-w-3xl mx-auto">
            Our team of AI specialists work closely with clients to identify opportunities for efficiency gains, cost reduction, and process optimization through intelligent automation solutions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="text-center p-8 rounded-2xl bg-card border border-border">
              <h4 className="text-2xl font-bold mb-4 text-foreground">Expert Development</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">Custom AI agents tailored to your specific business needs.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-card border border-border">
              <h4 className="text-2xl font-bold mb-4 text-foreground">Seamless Integration</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">Easy integration with your existing systems and tools.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-card border border-border">
              <h4 className="text-2xl font-bold mb-4 text-foreground">Ongoing Support</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">Continuous monitoring and optimization of your AI solutions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
