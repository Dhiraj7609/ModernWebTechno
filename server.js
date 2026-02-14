import app from "./src/app.js";
import config from "./src/config.js";

const PORT = process.env.PORT || config.PORT;

app.listen(PORT, () => {
  console.log(`IncidentTracker API running on http://localhost:${PORT}`);
});
