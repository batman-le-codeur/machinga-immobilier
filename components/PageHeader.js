import ParallaxBg from './ParallaxBg';

export default function PageHeader({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden text-white">
      <ParallaxBg src="/page-header-bg.png" strength={0.15} />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/55" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">{title}</h1>
        {subtitle && <p className="text-white/80 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
