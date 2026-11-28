
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

// Return users without password hashes.
const getAllUsers = async () => {
    return User.find({})
        .select('-passwordHash')
        .populate('role', 'name')
        .lean();
};

const getUserById = async (id) => {
    return User.findById(id)
        .select('-passwordHash')
        .populate('role', 'name')
        .lean();
};

const updateUser = async (id, updates) => {
    return User.findByIdAndUpdate(
        id,
        { $set: updates },
        {
            returnDocument: 'after',
            runValidators: true
        }
    )
        .select('-passwordHash')
        .populate('role', 'name')
        .lean();
};

const deleteUser = async (id) => {
    return User.findByIdAndDelete(id).lean();
};

export {
    createUser,
    findUserByEmail,
    verifyPassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
