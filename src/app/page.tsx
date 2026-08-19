import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import PortfolioSection from "@/components/public/PortfolioSection";
import OrderSection from "@/components/public/OrderSection";
import Footer from "@/components/public/Footer";
import ChatBot from "@/components/public/ChatBot";

export default function Home() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <OrderSection />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
