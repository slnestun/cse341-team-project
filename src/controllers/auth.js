import {
    createUser,
    findUserByEmail,
    verifyPassword
} from '../models/users.js';

const renderRegisterPage = (res, { error = null, form = {}, status = 200 } = {}) => {
    return res.status(status).render('auth/register', {
        title: 'Register',
        error,
        form
    });
};

const renderLoginPage = (res, { error = null, email = '', status = 200 } = {}) => {
    return res.status(status).render('auth/login', {
        title: 'Login',
        error,
        email
    });
};

const registerPage = (req, res) => renderRegisterPage(res);

const register = async (req, res, next) => {
    const {
        displayName = '',
        username = '',
        email = '',
        password = ''
    } = req.body;
    const form = { displayName, username, email };

    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
        return renderRegisterPage(res, {
            error: 'Display name, username, email, and password are required.',
            form,
            status: 400
        });
    }

    if (password.length < 8) {
        return renderRegisterPage(res, {
            error: 'Password must contain at least 8 characters.',
            form,
            status: 400
        });
    }

    try {
        await createUser({ displayName, username, email, password });
        return res.redirect('/login');
    } catch (error) {
        if (error.code === 11000) {
            return renderRegisterPage(res, {
                error: 'That username or email address is already registered.',
                form,
                status: 409
            });
        }

        return next(error);
    }
};

const loginPage = (req, res) => renderLoginPage(res);

const login = async (req, res, next) => {
    const { email = '', password = '' } = req.body;

    if (!email.trim() || !password) {
        return renderLoginPage(res, {
            error: 'Email and password are required.',
            email,
            status: 400
        });
    }

    try {
        const user = await findUserByEmail(email);
        const passwordMatches = user && await verifyPassword(password, user.passwordHash);

        if (!passwordMatches) {
            return renderLoginPage(res, {
                error: 'Invalid email or password.',
                email,
                status: 401
            });
        }

        req.session.user = {
            id: user._id.toString(),
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            role: user.role.name
        };

        const dashboardPath = user.role.name === 'admin' ? '/admin' : '/dashboard';
        return res.redirect(dashboardPath);
    } catch (error) {
        return next(error);
    }
};

const logout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }

        res.clearCookie('connect.sid');
        return res.redirect('/');
    });
};

const adminDashboardPage = (req, res) => {
    return res.render('auth/admin', { title: 'Admin Dashboard' });
};

const userDashboardPage = (req, res) => {
    return res.render('auth/dashboard', {
        title: 'User Dashboard',
        user: req.user
    });
};

export {
    registerPage,
    register,
    loginPage,
    login,
    logout,
    adminDashboardPage,
    userDashboardPage
};