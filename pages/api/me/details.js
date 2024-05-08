
export default async function handler(req, res) {
  try {
    if (!req.query.key) {
      return res.status(400).send("No token defined");
    }
    const response = await fetch(
      `https://api.twitter.com/2/users/me?user.fields=public_metrics,location`,
      {
        headers: { Authorization: `Bearer ${req.query.key}` },
      }
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.log(e?.response?.data || e, "backend err log");
  }
}
