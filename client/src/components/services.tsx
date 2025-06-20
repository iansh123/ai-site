export default function Services() {
  const services = [
    {
      title: "Process Automation",
      description: "Streamline repetitive tasks and workflows with intelligent AI agents."
    },
    {
      title: "Customer Support",
      description: "Deploy intelligent chatbots that provide 24/7 customer service."
    },
    {
      title: "Data Analytics",
      description: "Transform raw data into actionable insights with AI-powered analytics."
    },
    {
      title: "Email Automation",
      description: "Automate email campaigns and responses with personalized messaging."
    },
    {
      title: "Schedule Management",
      description: "Optimize scheduling and resource allocation with AI agents."
    },
    {
      title: "Security Monitoring",
      description: "Protect your business with AI-powered security monitoring systems."
    }
  ];

  return (
    <section id="services" className="py-32 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground tracking-tight">
            Our Services
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            Discover how our AI solutions can transform your business operations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-card rounded-2xl p-8 border border-border hover:border-muted-foreground/20 transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
