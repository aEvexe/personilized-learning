import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onLoginClick: () => void;
  onDebugToggle: () => void;
}

export default function Header({ onLoginClick, onDebugToggle }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="header">
      <h1>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Zehn AI
        </Link>
      </h1>
      <div className="header-right">
        {isAuthenticated ? (
          <>
            <Link to="/progress" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85em', padding: '6px 14px' }}>
              Progress
            </Link>
            <button className="btn-secondary" onClick={logout} style={{ fontSize: '0.85em', padding: '6px 14px' }}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={onLoginClick} style={{ fontSize: '0.85em', padding: '6px 14px' }}>
            Login
          </button>
        )}
        <button className="debug-toggle-btn" onClick={onDebugToggle}>
          Debug
        </button>
      </div>
    </div>
  );
}
