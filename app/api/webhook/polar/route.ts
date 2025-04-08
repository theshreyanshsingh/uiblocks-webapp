import { API, POLAR_WEBHOOK_SECRET } from "@/app/config/Config";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: POLAR_WEBHOOK_SECRET as string,
  onPayload: async (payload) => {
    if (
      payload.type === "subscription.created" ||
      payload.type === "subscription.updated" ||
      payload.type === "subscription.active" ||
      payload.type === "subscription.canceled" ||
      payload.type === "subscription.revoked" ||
      payload.type === "subscription.uncanceled"
    ) {
      const res = await fetch(`${API}/webhook-sub`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error("Error occured", res.status, res.statusText);
      }
    }
  },
});
