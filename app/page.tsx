import Hero from "./components/Hero";
import BhagwatPadAshtakam from "./components/BhagwatPadAshtakam";
import PrabhupadQuotes from "./components/PrabhupadQuotes";
import Gallery from "./components/Gallery";

export default function Home() {
  return (
    <main>
      <Hero />
      <BhagwatPadAshtakam />
      <PrabhupadQuotes />
      <Gallery />
    </main>
  );
}
