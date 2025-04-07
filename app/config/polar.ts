import { Polar } from "@polar-sh/sdk";
import { POLAR_TOKEN } from "./Config";

// Create checkout function to be called at runtime
export const createCheckout = async ({
  email,
  id,
}: {
  email: string;
  id: string;
}) => {
  if (!POLAR_TOKEN) {
    throw new Error("Polar access token is not configured");
  }

  const polar = new Polar({
    accessToken: POLAR_TOKEN,
    server: "sandbox",
  });

  return await polar.checkouts.create({
    productId: "66289435-2223-42af-aba0-b4cffc76abac",
    customerEmail: email,
    customerExternalId: id,
    successUrl: "http://localhost:3000/projects/settings",
  });
};

// export const verifySubscription = async ({ session }: { session: string }) => {
//   const polar = new Polar({
//     accessToken: "polar_oat_7BTz90s3GYZ33vfD6MKxXg47OMLRy2rmdqqwp0dQ21c",
//     server: "sandbox",
//   });

//   return await polar.subscriptions.get({
//     id: session,
//   });
// };
