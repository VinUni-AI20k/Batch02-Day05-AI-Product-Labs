import { TopUtilityBar } from "./components/TopUtilityBar";
import { MainHeader } from "./components/MainHeader";
import { MegaNav } from "./components/MegaNav";
import { HeroBanner } from "./components/HeroBanner";
import { SecondaryPromo } from "./components/SecondaryPromo";
import { FloatingSupportWidget } from "./components/FloatingSupportWidget";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { TrustBar } from "./components/TrustBar";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* MARKER-MAKE-KIT-INVOKED */}

      {/* Top utility bar */}
      <TopUtilityBar />

      {/* Sticky main header + quick categories */}
      <MainHeader />

      {/* Mega navigation */}
      <MegaNav />

      {/* Page content */}
      <main className="max-w-[1400px] mx-auto px-4 py-5 space-y-5">
        {/* Hero carousel */}
        <HeroBanner />

        {/* Trust signals */}
        <TrustBar />

        {/* Secondary promos + info cards */}
        <SecondaryPromo />

        {/* Featured products grid */}
        <FeaturedProducts />
      </main>

      {/* Footer spacer */}
      <div className="h-16" />

      {/* Floating support widget */}
      <FloatingSupportWidget />
    </div>
  );
}
