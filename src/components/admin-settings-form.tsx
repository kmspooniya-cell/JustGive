"use client";
import { useState } from "react";

export function AdminSettingsForm({ universe, tree }: { universe: boolean; tree: boolean }) {
  const [values, setValues] = useState({ kindness_universe: universe, kindness_tree: tree });
  const [savedValues, setSavedValues] = useState({ kindness_universe: universe, kindness_tree: tree });
  const [status, setStatus] = useState("");
  async function save(key: keyof typeof values) {
    setStatus("");
    try {
      const response = await fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, enabled: values[key] }) });
      if (!response.ok) throw new Error("save failed");
      setSavedValues(current => ({ ...current, [key]: values[key] }));
      setStatus("Setting saved and recorded in the admin activity log.");
    } catch {
      setValues(current => ({ ...current, [key]: savedValues[key] }));
      setStatus("Could not save this setting. Your previous saved value has been restored.");
    }
  }
  return <div className="admin-settings-form">
    {([ ["kindness_universe", "Kindness Universe"], ["kindness_tree", "Digital Kindness Tree"] ] as const).map(([key, label]) => <form key={key} onSubmit={event => { event.preventDefault(); void save(key); }} className="admin-card">
      <h2>{label}</h2><label className="admin-setting-toggle"><input type="checkbox" checked={values[key]} onChange={event => setValues(current => ({ ...current, [key]: event.target.checked }))}/> Display on the public homepage</label><button className="button" type="submit">Save setting</button>
    </form>)}
    <p role="status" aria-live="polite">{status}</p>
  </div>;
}
