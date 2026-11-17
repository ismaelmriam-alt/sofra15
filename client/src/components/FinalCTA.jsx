import { Reveal, WordReveal } from './Reveal.jsx';
import MagneticButton from './MagneticButton.jsx';
import Decor from './Decor.jsx';

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <Decor kind="lantern" size={48} className="cta-decor l" depth={20} delay={0.2} />
      <Decor kind="lantern" size={48} className="cta-decor r" depth={26} delay={0.6} />
      <div className="container center">
        <p className="eyebrow light">Your table is ready</p>
        <WordReveal text="Come hungry. Leave with a thousand memories." className="light" />
        <Reveal as="p" delay={0.15} className="cta-sub">Browse the menu, build your order, and we'll have it ready for pickup or delivery.</Reveal>
        <Reveal delay={0.25}><MagneticButton to="/menu" className="btn btn-light">Order now</MagneticButton></Reveal>
      </div>
    </section>
  );
}
