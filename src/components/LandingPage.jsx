export default function LandingPage({ onSignIn, onRequestAccess }) {
  return (
    <div className="landing-hero">
      <div className="landing-hero__radial" aria-hidden="true" />
      <div className="landing-hero__grid" aria-hidden="true" />
      <div className="landing-hero__arc" aria-hidden="true" />

      <header className="landing-hero__brand">
        <img src="/hubon-logo.svg" alt="Hubon AI" />
      </header>

      <section className="landing-hero__section">
        <div className="landing-hero__badge">
          <span className="landing-hero__badge-dot" />
          Branded Content, Powered by AI
        </div>

        <h1 className="landing-hero__heading">
          <span>Personalized Prompts.</span>
          <span className="landing-hero__line-break">On-Brand, On Demand.</span>
        </h1>

        <p className="landing-hero__copy">
          Upload your brand guide once. Hubon auto-styles every prompt to your fonts, colors, and voice—so teams can
          generate publish-ready content in seconds.
        </p>

        <div className="landing-hero__actions" role="group" aria-label="Primary actions">
          <button
            type="button"
            className="landing-hero__button landing-hero__button--primary"
            onClick={() => (typeof onRequestAccess === 'function' ? onRequestAccess() : onSignIn?.())}
          >
            Request Access
          </button>
          <button
            type="button"
            className="landing-hero__button landing-hero__button--secondary"
            onClick={() => onSignIn?.()}
          >
            Sign In
          </button>
        </div>

        <div className="landing-hero__chips" aria-label="Key capabilities">
          <span>Branded Prompt Library</span>
          <span>Auto-Style to Your Brand</span>
          <span>Team Templates</span>
          <span>API &amp; Webhooks</span>
        </div>
      </section>
    </div>
  );
}
