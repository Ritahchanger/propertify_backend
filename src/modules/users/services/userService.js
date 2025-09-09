const bcrypt = require('bcrypt');

const { User } = require("../../../database-config/index");

require('dotenv').config();

const SALT_ROUNDS = 12;

class UserService {
    static async createUser(data) {
        try {
            if (!data.password) throw new Error('Password is required');

            const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

            const user = await User.create({
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                idNumber: data.idNumber,
                role: data.role || 'owner',
                status: data.status || 'active',
            });

            user.passwordHash = undefined;

            return user;

        } catch (error) {

            throw error;

        }
    }

    static async getUserById(id) {

        return User.findByPk(id, { attributes: { exclude: ['passwordHash'] } });

    }

    static async getUserByEmail(email) {
        return User.findOne({
            where: { email },
            attributes: { exclude: ['passwordHash'] },
        });
    }


    static async getAllUsers() {

        return User.findAll({ attributes: { exclude: ['password_hash'] } });

    }

    static async updateUser(id, data) {

        const user = await User.findByPk(id);

        if (!user) throw new Error('User not found');

        if (data.password) {
            const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
            data.passwordHash = passwordHash;
            delete data.password;
        }

        await user.update(data);

        user.passwordHash = undefined;

        return user;

    }

    static async deleteUser(id) {

        const user = await User.findByPk(id);

        if (!user) throw new Error('User not found');

        await user.destroy();

        return { message: 'User deleted successfully' };
    }
}

module.exports = UserService;
