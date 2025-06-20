export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-5xl md:text-6xl font-light mb-8 text-gray-900 text-balance">
          AI Automation for Business
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          We create intelligent automation systems that save your business time and money.
        </p>
        
        <button 
          onClick={scrollToContact}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
