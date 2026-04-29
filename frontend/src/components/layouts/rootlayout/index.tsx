import { Outlet } from 'react-router-dom';
import NavBar from '../../organisms/NavBar/NavBar';
import ChatWidget from '../../organisms/ChatWidget/ChatWidget';

const RootLayout: React.FC = () => {

    return (
        <>
            <NavBar />
            <main>
                <ChatWidget/>
                <Outlet />
            </main>
        </>
    )
}

export default RootLayout;