import axios from "axios";

import AtmosRecord from "../../models/AtmosRecord";
import { FLASK_METRICS_URL, POLL_INTERVAL_MS } from "../../common/constants/env";

let running = false;

/**
 * Compare two metric objects (simple shallow compare)
 */
function isSameReading(a: any, b: any) {
  if (!a || !b) return false;
  return a.pm2_5 === b.pm2_5 &&
         a.pm10 === b.pm10 &&
         a.no2 === b.no2 &&
         a.o3 === b.o3 &&
         a.co === b.co &&
         a.aqi === b.aqi;
}

/**
 * Convert the fetched payload (from flask broker) to our model shape
 */
function normalizePayload(payload: any) {
  // payload might contain keys: pm2_5, pm10, nitrogen_dioxide, ozone, carbon_monoxide, air_quality_index
  return {
    pm2_5: Number(payload.pm2_5 ?? payload.pm25 ?? payload["pm2.5"] ?? 0),
    pm10: Number(payload.pm10 ?? payload.pm10 ?? 0),
    no2: Number(payload.nitrogen_dioxide ?? payload.no2 ?? 0),
    o3: Number(payload.ozone ?? payload.o3 ?? 0),
    co: Number(payload.carbon_monoxide ?? payload.co ?? 0),
    aqi: Number(payload.air_quality_index ?? payload.aqi ?? 0)
  };
}

export function startPoller() {
  if (running) return;
  running = true;
  console.log(`[poller] starting - polling ${FLASK_METRICS_URL} every ${POLL_INTERVAL_MS}ms`);

  const loop = async () => {
    try {
      const res = await axios.get(FLASK_METRICS_URL, { timeout: 5000 });
      if (res.status === 200 && res.data) {
        const raw = normalizePayload(res.data);
        // get last saved doc
        const last = await AtmosRecord.findOne().sort({ collectedAt: -1 }).lean().exec();

        if (!last || !isSameReading(raw, last)) {
          const doc = new AtmosRecord({ ...raw, collectedAt: new Date() });
          await doc.save();
          console.log(`[poller] saved new reading: aqi=${raw.aqi}, pm2_5=${raw.pm2_5}`);
        } else {
          console.log(`[poller] identical reading, skip save (aqi=${raw.aqi})`);
        }
      } else {
        console.warn(`[poller] unexpected response status ${res.status}`);
      }
    } catch (err) {
      console.warn(`[poller] fetch error: ${(err as any).message || err}`);
    } finally {
      setTimeout(loop, POLL_INTERVAL_MS);
    }
  };

  loop().catch((e) => console.error("[poller] fatal:", e));
}
