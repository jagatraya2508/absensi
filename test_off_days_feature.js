const http = require('http');

function postRequest(path, data, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

function getRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', reject);
        req.end();
    });
}

function deleteRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', reject);
        req.end();
    });
}

async function runTest() {
    try {
        console.log('1. Login as Admin...');
        const loginRes = await postRequest('/api/auth/login', {
            employee_id: 'ADMIN001',
            password: 'Admin2026' // Trying default or updated one. If this fails, I'll try 123456
        });

        let token;
        if (loginRes.statusCode === 200) {
            token = loginRes.body.token;
            console.log('Login success!');
        } else {
            console.log('Login failed with Admin2026, trying 123456...');
            const loginRes2 = await postRequest('/api/auth/login', {
                employee_id: 'ADMIN001',
                password: '123456'
            });
            if (loginRes2.statusCode === 200) {
                token = loginRes2.body.token;
                console.log('Login success with 123456!');
            } else {
                console.error('Login failed:', loginRes2.body);
                return;
            }
        }

        console.log('\n2. Get Users to find a target...');

        const usersGetRes = await getRequest('/api/auth/users', token);
        if (usersGetRes.statusCode !== 200) {
            console.error('Failed to get users:', usersGetRes.body);
            return;
        }

        const targetUser = usersGetRes.body.find(u => u.role === 'employee');
        if (!targetUser) {
            console.error('No employee found');
            return;
        }
        console.log(`Target User: ${targetUser.name} (${targetUser.id})`);

        console.log('\n3. Add Off Day...');
        const today = new Date().toISOString().split('T')[0];
        const addRes = await postRequest('/api/off-days', {
            user_id: targetUser.id,
            date: today
        }, token);

        if (addRes.statusCode === 201) {
            console.log('Off day added:', addRes.body);
        } else if (addRes.statusCode === 400 && addRes.body.error.includes('sudah ada')) {
            console.log('Off day already exists, that is fine.');
        } else {
            console.error('Failed to add off day:', addRes.body);
            return;
        }

        console.log('\n4. Get Off Days...');
        const getOffRes = await getRequest(`/api/off-days/${targetUser.id}`, token);
        console.log('Off days list:', getOffRes.body);

        // Find the off day we expect
        const offDayRecord = getOffRes.body.find(d => d.user_id === targetUser.id);

        if (offDayRecord) {
            const offDateStr = offDayRecord.off_date;
            console.log(`Using Off Day Date: ${offDateStr}`);

            console.log('\n4b. Verify History (User Specific) contains Off Day...');
            const historyRes = await getRequest(`/api/attendance/history?user_id=${targetUser.id}&limit=5`, token);
            const historyOffDay = historyRes.statusCode === 200 ? historyRes.body.find(r => r.type === 'off_day' && r.recorded_at === offDateStr) : null;

            if (historyOffDay) {
                console.log('SUCCESS: Off day found in user specific history.');
            } else {
                console.log('FAILURE: Off day NOT found in user specific history response.');
                if (historyRes.statusCode === 200) console.log('Sample user history:', historyRes.body.slice(0, 2));
            }

            console.log('\n4c. Verify History (All Users) contains Off Day...');
            const allHistoryRes = await getRequest(`/api/attendance/history?limit=100`, token); // No user_id filter
            const allHistoryOffDay = allHistoryRes.statusCode === 200 ? allHistoryRes.body.find(r => r.type === 'off_day' && r.recorded_at === offDateStr && r.user_id === targetUser.id) : null;

            if (allHistoryOffDay) {
                console.log('SUCCESS: Off day found in ALL users history.');
            } else {
                console.log('FAILURE: Off day NOT found in ALL users history response.');
                if (allHistoryRes.statusCode === 200) {
                    const anyOffDay = allHistoryRes.body.find(r => r.type === 'off_day');
                    console.log('First off-day found in all history:', anyOffDay || 'None');
                }
            }

            console.log('\n5. Delete Off Day...');
            const deleteRes = await deleteRequest(`/api/off-days/${offDayRecord.id}`, token);
            if (deleteRes.statusCode === 200) {
                console.log('Off day deleted');
            } else {
                console.error('Failed to delete:', deleteRes.body);
            }
        } else {
            console.log('Off day not found in list for target user?');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();
