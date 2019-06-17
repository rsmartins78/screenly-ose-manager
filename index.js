require('dotenv').config({ path: `${process.cwd()}/env/.env` });

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
