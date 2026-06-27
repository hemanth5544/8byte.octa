import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 4000;

createApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
