document.addEventListener('DOMContentLoaded', () => {
    const usersContainer = document.getElementById('users-container');
    const loadingMessage = document.getElementById('users-loading');
    const messageContainer = document.getElementById('users-message');

    if (!usersContainer) return;

    let currentUser = null;

    const showMessage = (message, type = 'info') => {
        messageContainer.textContent = message;
        messageContainer.className = type;
    };

    const createElement = (tag, text, className = '') => {
        const element = document.createElement(tag);
        element.textContent = text;
        if (className) element.className = className;
        return element;
    };

    const loadUsers = async () => {
        loadingMessage.hidden = false;
        usersContainer.replaceChildren();

        try {
            const response = await fetch('/api/users');

            if (!response.ok) {
                throw new Error('Unable to load user accounts.');
            }

            const data = await response.json();
            currentUser = data.currentUser || null;

            loadingMessage.hidden = true;

            if (!data.users || data.users.length === 0) {
                showMessage('No user accounts found.');
                return;
            }

            showMessage('');
            renderUsers(data.users);
        } catch (error) {
            loadingMessage.hidden = true;
            showMessage(error.message, 'error');
        }
    };

    const renderUsers = (users) => {
        const table = document.createElement('table');
        table.className = 'users-table';

        const header = document.createElement('thead');
        const headerRow = document.createElement('tr');

        ['Name', 'Username', 'Email', 'Role', 'Actions'].forEach((heading) => {
            headerRow.append(createElement('th', heading));
        });

        header.append(headerRow);
        table.append(header);

        const body = document.createElement('tbody');

        users.forEach((user) => {
            const row = document.createElement('tr');

            row.append(createElement('td', user.displayName));
            row.append(createElement('td', user.username));
            row.append(createElement('td', user.email));
            row.append(createElement('td', user.role?.name || 'Customer'));

            const actions = document.createElement('td');

            const editButton = createElement('button', 'Edit');
            editButton.type = 'button';
            editButton.addEventListener('click', () => editUser(user));

            const deleteButton = createElement('button', 'Delete');
            deleteButton.type = 'button';
            deleteButton.addEventListener('click', () => removeUser(user));

            actions.append(editButton, deleteButton);
            row.append(actions);
            body.append(row);
        });

        table.append(body);
        usersContainer.append(table);
    };

    const editUser = async (user) => {
        const displayName = prompt('Display name:', user.displayName);
        if (displayName === null) return;

        const username = prompt('Username:', user.username);
        if (username === null) return;

        const email = prompt('Email:', user.email);
        if (email === null) return;

        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, username, email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to update user.');
            }

            showMessage(data.message || 'User updated successfully.', 'success');
            await loadUsers();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    const removeUser = async (user) => {
        if (!confirm(`Delete the account for ${user.displayName}?`)) return;

        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to delete user.');
            }

            showMessage(data.message || 'User deleted successfully.', 'success');

            if (currentUser && currentUser.id === user._id) {
                window.location.href = '/login';
                return;
            }

            await loadUsers();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    loadUsers();
});