import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { ChevronDown, LogOut } from 'lucide-react';

export default function UserProfile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!showDropdown) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) setShowDropdown(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userName = user?.full_name || 'User';
  const userEmail = user?.email || 'Email unavailable';
  const userRole = user?.role || 'VIEWER';
  const initials = userName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={profileRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        ref={triggerRef}
        aria-expanded={showDropdown}
        aria-haspopup="dialog"
        aria-controls="user-profile-menu"
        aria-label={`Account menu for ${userName}`}
        className="app-account-button"
      >
        <span className="app-avatar" aria-hidden="true">{initials}</span>
        <span className="text-sm truncate max-w-[100px]">{userName.split(' ')[0]}</span>
        <ChevronDown size={16} />
      </button>

      {showDropdown && (
        <div id="user-profile-menu" className="app-account-menu" role="dialog" aria-label="Account details">
          {/* User Info */}
          <div className="app-account-details">
            <div className="flex items-center gap-3">
              <span className="app-avatar app-avatar-large" aria-hidden="true">{initials}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs app-muted truncate">{userEmail}</p>
                <p className="text-xs app-accent mt-1 capitalize">{userRole.toLowerCase().replaceAll('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="app-logout-button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
