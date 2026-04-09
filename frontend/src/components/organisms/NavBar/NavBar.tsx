import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.scss';
import Button from '../../atoms/Button/Button';
import logo from '../../../assets/ppac_logo.png'; 

const NavBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
                        <a
                        className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
                        onClick={() => navigate('/')}
                        >
                        Home
                        </a>
                    </li>
                    <li>
                        <a
                        className={`navbar__link ${location.pathname === '/events' ? 'navbar__link--active' : ''}`}
                        onClick={() => navigate('/events')}
                        >
                        Events
                        </a>
                    </li>
                    <li>
                        <a
                        className={`navbar__link ${location.pathname === '/resources' ? 'navbar__link--active' : ''}`}
                        onClick={() => navigate('/resources')}
                        >
                        Resources
                        </a>
                    </li>
                    <li>
                        <a
                        className={`navbar__link ${location.pathname === '/community' ? 'navbar__link--active' : ''}`}
                        onClick={() => navigate('/community')}
                        >
                        Community
                        </a>
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