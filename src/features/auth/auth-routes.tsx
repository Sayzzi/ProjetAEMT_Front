// Routes pour l'authentification
// /login -> LoginFormComponent
// /register -> RegisterFormComponent

import { RouteObject } from 'react-router-dom';
import { LoginFormComponent } from './components/LoginFormComponent';
import { RegisterFormComponent } from './components/RegisterFormComponent';

export const authRoutes: RouteObject[] = [
    {
        path: '/login',
        element: <LoginFormComponent />,
    },
    {
        path: '/register',
        element: <RegisterFormComponent />,
    },
];
