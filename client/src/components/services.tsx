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
    <section id="services" className="py-24 px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Discover how our AI solutions can transform your business operations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-medium mb-4 text-gray-900">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
