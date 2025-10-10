const featureList = [
  {
    title: 'Brand-aware intelligence',
    description: 'Feed Hubon AI your guidelines once—every execution stays unmistakably on-brand.'
  },
  {
    title: 'Production-ready output',
    description: 'Launch visuals, lifecycle creative, and product storytelling in the exact ratios you need.'
  },
  {
    title: 'Collaborative workflow',
    description: 'Share concepts, manage versions, and handoff final assets to the channels that matter.'
  }
];

export default function LandingPage({ onSignIn, onRequestAccess }) {
  function handleSignIn(event) {
    event.preventDefault();
    if (typeof onSignIn === 'function') {
      onSignIn();
    }
  }

  function handleRequestAccess(event) {
    event.preventDefault();
    if (typeof onRequestAccess === 'function') {
      onRequestAccess();
    } else if (typeof onSignIn === 'function') {
      onSignIn();
    }
  }

  return (
    <div className="landing-page">
      <header className="landing-header" data-section="top">
        <div className="landing-brand">
          <a className="landing-logo" href="/" aria-label="Hubon AI">
            <img src="/hubon-logo.svg" alt="" />
          </a>
          <nav className="landing-nav" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#partners">Teams</a>
          </nav>
        </div>
        <div className="landing-actions">
          <button type="button" className="landing-button secondary" onClick={handleSignIn}>
            Sign in
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <div className="landing-hero-copy">
              <p className="eyebrow">Creative OS for modern brands</p>
              <h1>
                Build campaign-ready visuals with <span>Hubon AI</span>.
              </h1>
              <p className="lead">
                Your brand controls the story—Hubon AI handles the execution. Generate product hero shots, launch
                graphics, and lifecycle assets without design bottlenecks.
              </p>
              <div className="landing-cta">
                <button type="button" className="landing-button primary" onClick={handleRequestAccess}>
                  Request access
                </button>
                <button type="button" className="landing-button outline" onClick={handleSignIn}>
                  Sign in
                </button>
              </div>
              <div className="landing-stats">
                <div>
                  <span>8× faster</span>
                  <p>Asset production across go-to-market teams.</p>
                </div>
                <div>
                  <span>92%</span>
                  <p>Brand compliance score out of the box.</p>
                </div>
                <div>
                  <span>30+</span>
                  <p>High-impact templates ready to launch.</p>
                </div>
              </div>
            </div>
            <div className="landing-hero-media" aria-hidden="true">
              <div className="hero-media-surface">
                <div className="hero-media-frame">
                  <img
                    src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80"
                    alt=""
                  />
                </div>
                <div className="hero-media-glow" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="section-heading">
            <p className="eyebrow">Why Hubon</p>
            <h2>Ship beautiful, on-brand experiences without starting from scratch.</h2>
            <p className="section-lead">
              We combine multimodal reasoning with your brand system so every output feels intentional.
            </p>
          </div>
          <div className="feature-grid">
            {featureList.map(feature => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="landing-section split">
          <div className="section-heading">
            <p className="eyebrow">Workflow</p>
            <h2>Three steps to a finished launch visual.</h2>
          </div>
          <ol className="workflow-steps">
            <li>
              <span className="step-index">01</span>
              <div>
                <h3>Choose a template</h3>
                <p>Select the campaign, launch, or lifecycle format you need.</p>
              </div>
            </li>
            <li>
              <span className="step-index">02</span>
              <div>
                <h3>Highlight the story</h3>
                <p>Hubon AI blends your product copy, assets, and brand rules into a cohesive direction.</p>
              </div>
            </li>
            <li>
              <span className="step-index">03</span>
              <div>
                <h3>Export with confidence</h3>
                <p>Download launch assets or sync them to your channels in the exact format you need.</p>
              </div>
            </li>
          </ol>
        </section>

        <section id="partners" className="landing-section landing-partners">
          <h2>Built for product marketing, brand, and growth teams.</h2>
          <p>Join teams using Hubon AI to keep every launch consistent while moving with startup speed.</p>
        </section>
      </main>

      <footer className="landing-footer">
        <div>
          <a className="landing-logo" href="/" aria-label="Hubon AI">
            <img src="/hubon-logo.svg" alt="" />
          </a>
          <p>© {new Date().getFullYear()} Hubon AI. Creative automation for ambitious teams.</p>
        </div>
        <div className="landing-footer-actions">
          <button type="button" className="landing-button outline" onClick={handleRequestAccess}>
            Request access
          </button>
          <button type="button" className="landing-button secondary" onClick={handleSignIn}>
            Sign in
          </button>
        </div>
      </footer>
    </div>
  );
}
