/** Friendly fallback when Shopify env vars aren't set yet (e.g. fresh clone). */
export default function StoreNotice() {
  return (
    <div className="container empty">
      <h2>Store not connected yet</h2>
      <p style={{ maxWidth: 520, margin: "0 auto" }}>
        Add your Shopify credentials to <code>.env.local</code> (see{" "}
        <code>.env.local.example</code> and the plans&rsquo; <code>SETUP.md</code>),
        then restart the dev server. Products will appear here automatically.
      </p>
    </div>
  );
}
