import mw from '#middlewares/index.js'
import router from "../../router.js";

router.get("/api/faraday/albums",
  mw.faraday.scrapeFaradayStock,
  mw.faraday.setFaradayStock,
)