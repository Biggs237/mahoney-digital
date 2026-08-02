/**
 * Returns Meta Pixel ID from Vercel env (safe for browser bootstrap).
 * Set either NEXT_PUBLIC_META_PIXEL_ID or META_PIXEL_ID in Vercel project settings.
 */
module.exports = function handler(req, res) {
  const pixelId = (
    process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    process.env.META_PIXEL_ID ||
    ""
  ).trim();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json({ pixelId });
};
