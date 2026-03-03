import { v } from 'convex/values';

import { action } from './_generated/server';

export const reverseGeocode = action({
  args: { latitude: v.number(), longitude: v.number() },
  handler: async (ctx, args) => {
    const apiKey = process.env.LOCATIONIQ_API_KEY;
    const data = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${args.latitude}&lon=${args.longitude}&format=json`
    );
    const dataJson = await data.json();

    return dataJson as {
      place_id: string;
      licence: string;
      lat: string;
      lon: string;
      display_name: string;
      osm_id: string;
      osm_type: string;
      address: {
        road?: string;
        bar?: string;
        county?: string;
        state?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
        village?: string;
        city?: string;
        state_district?: string;
        suburb?: string;
      };
      boundingbox: string[];
    };
  },
});
