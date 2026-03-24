import Hero from "./(user)/home/Hero";
import BhagwatPadAshtakam from "./(user)/home/BhagwatPadAshtakam";
import PrabhupadQuotes from "./(user)/home/PrabhupadQuotes";
import Gallery from "./(user)/home/Gallery";

export default function Home() {
  return (
    <div>
      <Hero />
      <BhagwatPadAshtakam />
      <PrabhupadQuotes />
      <Gallery />
    </div>
  );
}
