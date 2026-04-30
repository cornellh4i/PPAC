import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.scss';
import Button from '../../atoms/Button/Button';
import logo from '../../../assets/ppac_logo.png';

const NavBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCommunityOpen, setIsCommunityOpen] = useState(false);
    const communityRef = useRef<HTMLLIElement>(null);
    const isCommunityActive = location.pathname === '/team' || location.pathname === '/student-stories';

    useEffect(() => {
        setIsCommunityOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (communityRef.current && !communityRef.current.contains(event.target as Node)) {
                setIsCommunityOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            <img
                className="navbar__logo"
                src={logo}
                alt="PPAC logo"
                onClick={() => navigate('/')}
            />

            <div className="navbar__pill">
                <ul className="navbar__links">
                    <li>
                        <button
                        type="button"
                        className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
                        onClick={() => navigate('/')}
                        >
                        Home
                        </button>
                    </li>
                    <li>
                        <button
                        type="button"
                        className={`navbar__link ${location.pathname === '/events' ? 'navbar__link--active' : ''}`}
                        onClick={() => navigate('/events')}
                        >
                        Events
                        </button>
                    </li>
                    <li>
                        <button
                        type="button"
                        className={`navbar__link ${location.pathname === '/resources' ? 'navbar__link--active' : ''}`}
                        onClick={() => navigate('/resources')}
                        >
                        Resources
                        </button>
                    </li>
                    <li
                        className={`navbar__dropdown ${isCommunityOpen ? 'navbar__dropdown--open' : ''}`}
                        ref={communityRef}
                    >
                        <button
                            type="button"
                            className={`navbar__link navbar__dropdown-toggle ${isCommunityActive ? 'navbar__link--active' : ''}`}
                            onClick={() => setIsCommunityOpen((prev) => !prev)}
                            aria-expanded={isCommunityOpen}
                            aria-haspopup="menu"
                        >
                            Community
                        </button>

                        <div className="navbar__dropdown-menu" role="menu">
                            <button
                                type="button"
                                className={`navbar__dropdown-item ${location.pathname === '/team' ? 'navbar__dropdown-item--active' : ''}`}
                                onClick={() => navigate('/team')}
                                role="menuitem"
                            >
                                Team
                            </button>
                            <button
                                type="button"
                                className={`navbar__dropdown-item ${location.pathname === '/student-stories' ? 'navbar__dropdown-item--active' : ''}`}
                                onClick={() => navigate('/student-stories')}
                                role="menuitem"
                            >
                                Student Stories
                            </button>
                        </div>
                    </li>
                </ul>

                <Button variant="rounded" onClick={() => navigate('/providers')}>
                    Find a Provider
                </Button>
            </div>
        </nav>
    );
};

export default NavBar;
