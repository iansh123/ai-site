export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            About IC AI Solutions
          </h2>
        </div>
        
        <div className="prose prose-lg max-w-none text-center">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We are a technology company dedicated to helping businesses harness the power of artificial intelligence for operational excellence.
          </p>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Our team of AI specialists work closely with clients to identify opportunities for efficiency gains, cost reduction, and process optimization through intelligent automation solutions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <h4 className="text-lg font-medium mb-2 text-gray-900">Expert Development</h4>
              <p className="text-gray-600">Custom AI agents tailored to your specific business needs.</p>
            </div>
            
            <div className="text-center">
              <h4 className="text-lg font-medium mb-2 text-gray-900">Seamless Integration</h4>
              <p className="text-gray-600">Easy integration with your existing systems and tools.</p>
            </div>
            
            <div className="text-center">
              <h4 className="text-lg font-medium mb-2 text-gray-900">Ongoing Support</h4>
              <p className="text-gray-600">Continuous monitoring and optimization of your AI solutions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
