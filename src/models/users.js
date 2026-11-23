import bcrypt from 'bcrypt';
import Role from './schemas/roles.js';
import User from './schemas/users.js';

const createUser = async ({ displayName, username, email, password }) => {
    const customerRole = await Role.findOne({ name: 'customer' });

    if (!customerRole) {
        throw new Error('Default customer role not found.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return User.create({
        displayName,
        username,
        email,
        passwordHash,
        role: customerRole._id
    });
};

const findUserByEmail = async (email) => {
    return User.findOne({ email: email.toLowerCase() }).populate('role');
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

export {
    createUser,
    findUserByEmail,
    verifyPassword
};
