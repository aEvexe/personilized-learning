import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface HomePageProps {
  onLoginClick: () => void;
}

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Learning', desc: 'Our advanced AI creates a personalized curriculum tailored to your level, goals, and interests' },
  { icon: '📚', title: 'Comprehensive Content', desc: 'Master vocabulary through flashcards, stories, and interactive tests designed for retention' },
  { icon: '📊', title: 'Track Your Progress', desc: 'Monitor your learning journey with detailed progress tracking and completion statistics' },
  { icon: '🎯', title: 'Goal-Oriented', desc: 'Learn what matters to you - whether it\'s travel, career, education, or personal growth' },
  { icon: '🌍', title: 'Multiple Languages', desc: 'Learn English with support for speakers of Russian, Spanish, French, Arabic, and more' },
  { icon: '⚡', title: 'Adaptive Learning', desc: 'Content adapts to your proficiency level from beginner (A1) to advanced (C2)' },
];

export default function HomePage({ onLoginClick }: HomePageProps) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <div className="landing-hero">
          <h1 className="hero-title" style={{ fontSize: '2.5em' }}>Welcome Back!</h1>
          <p className="hero-subtitle">Ready to continue your learning journey?</p>
          <div className="hero-cta">
            <button
              className="btn-large btn-primary-large"
              onClick={() => navigate('/curriculum')}
            >
              View My Curriculum
            </button>
            <button
              className="btn-large btn-secondary-large"
              onClick={() => navigate('/onboarding')}
            >
              Create New Curriculum
            </button>
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{ marginTop: 16 }}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="landing-hero">
        <h1 className="hero-title">Learn Languages with AI</h1>
        <p className="hero-subtitle">
          Personalized curriculum powered by artificial intelligence, designed just for you
        </p>
        <div className="hero-cta">
          <button className="btn-large btn-primary-large" onClick={onLoginClick}>
            Get Started
          </button>
          <button className="btn-large btn-secondary-large" onClick={onLoginClick}>
            Sign In
          </button>
        </div>
      </div>

      <div className="divider"></div>

      <div className="features-section">
        <h2 className="features-title">Why Choose Zehn AI?</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
