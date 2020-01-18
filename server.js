const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send(`
        <h1>Hello From Node Running Inside Docker !!!</h1>
        <h2>changes</h2>
    `);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
