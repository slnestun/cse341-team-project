
import { beforeEach, describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createUser } from '../src/models/users.js';
import User from '../src/models/schemas/users.js';
import Role from '../src/models/schemas/roles.js';

const password = 'TestPassword123';

let customer;
let anotherCustomer;
let admin;
let customerAgent;
let adminAgent;

const createTestUser = async (details) => {
    return createUser({
        displayName: details.displayName,
        username: details.username,
        email: details.email,
        password
    });
};

const login = async (email) => {
    const agent = request.agent(app);

    const response = await agent
        .post('/login')
        .send({ email, password });

    expect(response.status).toBe(302);

    return agent;
};

beforeEach(async () => {
    customer = await createTestUser({
        displayName: 'Test Customer',
        username: 'testcustomer',
        email: 'customer@example.com'
    });

    anotherCustomer = await createTestUser({
        displayName: 'Another Customer',
        username: 'anothercustomer',
        email: 'another@example.com'
    });

    admin = await createTestUser({
        displayName: 'Test Admin',
        username: 'testadmin',
        email: 'admin@example.com'
    });

    const adminRole = await Role.findOne({ name: 'admin' });

    await User.findByIdAndUpdate(admin._id, {
        role: adminRole._id
    });

    customerAgent = await login('customer@example.com');
    adminAgent = await login('admin@example.com');
});

describe('User Admin page', () => {
    test('redirects signed-out visitors to login', async () => {
        const response = await request(app).get('/users-admin');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
    });

    test('allows authenticated customers to access the page', async () => {
        const response = await customerAgent.get('/users-admin');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Manage Users');
    });

    test('allows authenticated admins to access the page', async () => {
        const response = await adminAgent.get('/users-admin');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Manage Users');
    });
});

describe('User API authentication', () => {
    test('rejects signed-out requests', async () => {
        const response = await request(app).get('/api/users');

        expect(response.status).toBe(401);
    });

    test('returns only the current customer account', async () => {
        const response = await customerAgent.get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body.users).toHaveLength(1);
        expect(response.body.users[0].email).toBe('customer@example.com');
        expect(response.body.currentUser.role).toBe('customer');
        expect(response.body).not.toHaveProperty('passwordHash');
        expect(response.body.users[0]).not.toHaveProperty('passwordHash');
    });

    test('allows admins to view all accounts', async () => {
        const response = await adminAgent.get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body.users).toHaveLength(3);
        expect(response.body.currentUser.role).toBe('admin');

        response.body.users.forEach((user) => {
            expect(user).not.toHaveProperty('passwordHash');
        });
    });
});

describe('User account permissions', () => {
    test('prevents customers from viewing another account', async () => {
        const response = await customerAgent.get(
            `/api/users/${anotherCustomer._id}`
        );

        expect(response.status).toBe(403);
    });

    test('allows customers to update their own account', async () => {
        const response = await customerAgent
            .put(`/api/users/${customer._id}`)
            .send({ displayName: 'Updated Customer' });

        expect(response.status).toBe(200);
        expect(response.body.user.displayName).toBe('Updated Customer');
    });

    test('prevents customers from updating another account', async () => {
        const response = await customerAgent
            .put(`/api/users/${anotherCustomer._id}`)
            .send({ displayName: 'Unauthorized Update' });

        expect(response.status).toBe(403);
    });

    test('prevents customers from changing their own role', async () => {
        const response = await customerAgent
            .put(`/api/users/${customer._id}`)
            .send({ role: 'admin' });

        expect(response.status).toBe(400);

        const updatedCustomer = await User.findById(customer._id)
            .populate('role');

        expect(updatedCustomer.role.name).toBe('customer');
    });

    test('prevents customers from changing their password hash', async () => {
        const originalCustomer = await User.findById(customer._id);
        const originalPasswordHash = originalCustomer.passwordHash;

        const response = await customerAgent
            .put(`/api/users/${customer._id}`)
            .send({ passwordHash: 'fake-password-hash' });

        expect(response.status).toBe(400);

        const updatedCustomer = await User.findById(customer._id);

        expect(updatedCustomer.passwordHash).toBe(originalPasswordHash);
    });

    test('allows admins to update another account', async () => {
        const response = await adminAgent
            .put(`/api/users/${customer._id}`)
            .send({ displayName: 'Admin Updated Customer' });

        expect(response.status).toBe(200);
        expect(response.body.user.displayName).toBe(
            'Admin Updated Customer'
        );
    });

    test('prevents customers from deleting another account', async () => {
        const response = await customerAgent.delete(
            `/api/users/${anotherCustomer._id}`
        );

        expect(response.status).toBe(403);
    });

    test('allows admins to delete another account', async () => {
        const response = await adminAgent.delete(
            `/api/users/${anotherCustomer._id}`
        );

        expect(response.status).toBe(200);

        const deletedUser = await User.findById(anotherCustomer._id);

        expect(deletedUser).toBeNull();
    });
});
