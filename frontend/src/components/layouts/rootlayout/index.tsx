import { Outlet } from 'react-router-dom';
import NavBar from '../../organisms/NavBar/NavBar';

const RootLayout: React.FC = () => {

    return (
        <>
            <NavBar />
            <main>
                <Outlet />
            </main>
        </>
    )
}

export default RootLayout;