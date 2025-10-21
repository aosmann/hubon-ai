export default function LandingPage({ onSignIn, onRequestAccess }) {
  return (
    <section className="landing-hero" role="region" aria-label="Hubon landing hero">
      <div className="landing-hero__overlay" aria-hidden="true" />
      <div className="landing-hero__pattern" aria-hidden="true" />

      <nav className="landing-hero__nav" aria-label="Landing navigation">
        <div className="landing-hero__nav-logo">
          <img src="/hubon-logo.svg" alt="Hubon" />
        </div>        
      </nav>

      <div className="landing-hero__content">
        <div className="landing-hero__stack">
          
          <h1 className="landing-hero__title">
            B2B BRANDED
            <br />
            PROMPT MARKETPLACE.
          </h1>
          <p className="landing-hero__subtitle">Turn brand guides into content.</p>
          
        </div>
        <div class="center-behind center-behind--square" aria-hidden="true"></div>
      </div>
      <div className="landing-hero__actions" role="group" aria-label="Primary actions">
            <button
              type="button"
              className="landing-hero__button landing-hero__button--primary"
              onClick={() => onSignIn?.()}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className="landing-hero__button landing-hero__button--secondary"
              onClick={() => onRequestAccess?.()}
            >
              REQUEST AN ACCOUNT
            </button>
          </div>
    </section>
  );
}

