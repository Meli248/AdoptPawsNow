import http from 'http';

const fetch = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
};

const debug = async () => {
    try {
        const stats = await fetch('http://localhost:5000/api/stats/home');
        console.log('Stats Response:', stats);

        const pets = await fetch('http://localhost:5000/api/pets?limit=4');
        console.log('Pets Response:', pets);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

debug();
