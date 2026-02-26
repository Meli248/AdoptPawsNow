import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem('user'));
    const [userRole, setUserRole] = useState(localStorage.getItem('user_role'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');

        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);

        // Notify other tabs
        window.dispatchEvent(new Event('storage'));
    };

    const login = (userData) => {
        localStorage.setItem('access_token', userData.access_token);
        localStorage.setItem('user', userData.user.username);
        localStorage.setItem('user_role', userData.user.role);
        localStorage.setItem('user_id', userData.user.user_id);

        setUser(userData.user.username);
        setUserRole(userData.user.role);
        setIsAuthenticated(true);

        window.dispatchEvent(new Event('storage'));
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('access_token');
            const username = localStorage.getItem('user');
            const role = localStorage.getItem('user_role');

            setUser(username);
            setUserRole(role);
            setIsAuthenticated(!!token);

            // If we were authenticated but now token is gone, we might be on a private route
            // The routes themselves will handle the redirect because they use this context
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ user, userRole, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
