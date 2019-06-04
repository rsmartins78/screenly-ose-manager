require('dotenv').config({ path: `${process.cwd()}/env/.env` });

const app = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
