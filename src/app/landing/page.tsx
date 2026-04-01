import Navbar from "@/components/landingpage/Navbar";
import Hero from "@/components/landingpage/HeroSection";
import Features from "@/components/landingpage/Features";
import HowItWorks from "@/components/landingpage/HowItWorks";
import Testimonials from "@/components/landingpage/Testemonials";
import Footer from "@/components/landingpage/FooterSection";

export default function LandingPage() {
  return (
    <>
      <div className="min-h-screen bg-transparent">
        <div className="absolute top-0 left-1/2 w-100 h-125  blur-[140px] rounded-full pointer-events-none" />

        <Navbar />
        <Hero />
        <Features />
      </div>
      <HowItWorks />
      <Testimonials />
      <Footer />
    </>
  );
}
