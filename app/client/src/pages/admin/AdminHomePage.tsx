import { useEffect, useState } from "react";
import {
  get_admin_overview,
  list_organisations,
  list_organisations_links,
  create_organisation,
  create_organisation_link,
  type Overview,
  type Organisation,
  type Organisation_Link,
  deactivate_organisation,
} from "../../api/admin";
import { format_label } from "../../utils/format";
import { Api_Error } from "../../api/client";

//going to implement different tabs for new functionality (1 for overview, organisations and links)
type Tabs = "overview" | "organisations" | "links";

const AdminHomePage = () => {
  const [tab, setTab] = useState<Tabs>("overview");

  return (
    <div className="pt-4 flex flex-col gap-5 max-w-3xl m-auto">
      <h2 className="text-xl font-medium text-green-900">Admin</h2>

      <div className="flex gap-2">
        {(["overview", "organisations", "links"] as Tabs[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-md text-sm capitalize cursor-pointer hover:bg-green-100 ${
              tab === t
                ? "bg-green-500 text-white"
                : "bg-surface-light text-green-700 border border-surface-mid"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "organisations" && <OrganisationsTab />}
      {tab === "links" && <LinksTab />}
    </div>
  );
};

const OverviewTab = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const get_overview = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await get_admin_overview();
        setOverview(data);
      } catch {
        setError("Could not load overview");
      } finally {
        setLoading(false);
      }
    };

    get_overview();
  }, []);

  if (loading)
    return <p className="text-sm text-placeholder-text pt-4">Loading...</p>;
  if (error || !overview) {
    return (
      <p className="text-sm text-status-danger-text pt-4">
        {error ?? "No data available."}
      </p>
    );
  }

  const total_orgs = overview.organisations
    .filter((org) => org.type !== "system")
    .reduce((sum, organisation) => sum + Number(organisation.count), 0);

  const total_users = overview.users
    .filter((user) => user.role !== "admin")
    .reduce((sum, user) => sum + Number(user.count), 0);

  const total_queries = overview.queries.reduce(
    (sum, query) => sum + Number(query.count),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-xs text-green-700">Organisations</div>
          <div className="text-2xl font-medium">{total_orgs}</div>
        </div>
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-xs text-green-700">Active Users</div>
          <div className="text-2xl font-medium">{total_users}</div>
        </div>
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-xs text-green-700">Total Queries</div>
          <div className="text-2xl font-medium">{total_queries}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-sm font-medium text-green-900 mb-2">
            Organisations by type
          </div>
          <div className="flex flex-col gap-1 text-sm">
            {overview.organisations.map((org) => (
              <div key={org.type} className="flex justify-between">
                <span>{format_label(org.type)}</span>
                <span className="font-medium">{org.count}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-surface-mid pt-1 mt-1 text-xs text-placeholder-text">
              <span>Linked Organisation Pairs</span>
              <span className="font-medium">{overview.organisation_links}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-light rounded-md p-4">
          <div className="text-sm font-medium text-green-900 mb-2">
            Users by role
          </div>
          <div className="flex flex-col gap-1 text-sm">
            {overview.users.map((user) => (
              <div key={user.role} className="flex justify-between">
                <span>{format_label(user.role)}</span>
                <span className="font-medium">{user.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-light rounded-md p-4">
          <div className="text-sm font-medium text-green-900 mb-2">
            Queries by status
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
            {overview.queries.map((query) => (
              <div key={query.status} className="flex justify-between">
                <span>{format_label(query.status)}</span>
                <span className="font-medium">{query.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrganisationsTab = () => {
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"pharmacy" | "gp_surgery">("pharmacy");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const get_orgs = async () => {
    setLoading(true);
    setError(null);
    try {
      setOrgs(await list_organisations());
    } catch {
      setError("Could not load organisations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    get_orgs();
  }, []);

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await create_organisation({
        name,
        type,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
      });
      setName("");
      setAddress("");
      setPhone("");
      setEmail("");
      await get_orgs();
    } catch (e) {
      setFormError(
        e instanceof Api_Error ? e.message : "Could not create organisation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handle_deactivate = async (org: Organisation) => {
    if (
      !confirm(
        `Deactivate ${org.name}? This will also deactivate all of this organisation's staff accounts.`,
      )
    )
      return;
    try {
      await deactivate_organisation(org.id);
      await get_orgs();
    } catch {
      setError("Could not deactivate organisation.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handle_submit}
        className="bg-surface-light rounded-md p-4 flex flex-col gap-3"
      >
        <div className="text-sm font-medium text-green-900">
          Add Organisation
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-green-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as "pharmacy" | "gp_surgery")
              }
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            >
              <option value="pharmacy">Pharmacy</option>
              <option value="gp_surgery">GP Surgery</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-green-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        {formError && (
          <p className="text-sm text-status-danger-text">{formError}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="self-end px-4 py-1.5 text-sm font-medium rounded-md bg-green-700 text-white disabled:opacity-60 cursor-pointer hover:bg-green-300"
        >
          {submitting ? "Adding..." : "Add Organisation"}
        </button>
      </form>

      {loading && <p className="text-sm text-placeholder-text">Loading...</p>}
      {error && <p className="text-sm text-status-danger-text">{error}</p>}
      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="flex justify-between items-center bg-surface-light rounded-md px-4 py-2.5 text-sm"
            >
              <div>
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-placeholder-text">
                  {org.address}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs capitalize ${org.active ? "text-green-700" : "text-status-danger-text"}`}
                >
                  {org.active ? format_label(org.type) : "Inactive"}
                </span>
                {org.active && (
                  <button
                    onClick={() => handle_deactivate(org)}
                    className="text-xs text-status-danger-text hover:underline cursor-pointer"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LinksTab = () => {
  const [links, setLinks] = useState<Organisation_Link[]>([]);
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pharmacyId, setPharmacyId] = useState<number | "">("");
  const [gpSurgeryId, setGpSurgeryId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const get_data = async () => {
    setLoading(true);
    setError(null);
    try {
      const [linksData, orgsData] = await Promise.all([
        list_organisations_links(),
        list_organisations(),
      ]);
      setLinks(linksData);
      setOrgs(orgsData);
    } catch {
      setError("Could not load links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    get_data();
  }, []);

  const pharmacies = orgs.filter((org) => org.type === "pharmacy");
  const surgeries = orgs.filter((org) => org.type === "gp_surgery");

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    if (!pharmacyId || !gpSurgeryId) {
      setFormError("Select both a pharmacy and a GP surgery");
      return;
    }
    setSubmitting(true);
    try {
      await create_organisation_link(pharmacyId, gpSurgeryId);
      setPharmacyId("");
      setGpSurgeryId("");
      await get_data();
    } catch (e) {
      setFormError(
        e instanceof Api_Error
          ? e.message
          : "Could not create link between organisations",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handle_submit}
        className="bg-surface-light rounded-md p-4 flex flex-col gap-3"
      >
        <div className="text-sm font-medium text-green-900">
          Link a pharmacy and GP surgery
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-green-700 mb-1">
              Pharmacy
            </label>
            <select
              value={pharmacyId}
              onChange={(event) =>
                setPharmacyId(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            >
              <option value="">Select a pharmacy</option>
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-green-700 mb-1">
              GP Surgery
            </label>
            <select
              value={gpSurgeryId}
              onChange={(event) =>
                setGpSurgeryId(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            >
              <option value="">Select a surgery</option>
              {surgeries.map((surgery) => (
                <option key={surgery.id} value={surgery.id}>
                  {surgery.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {formError && (
          <p className="text-sm text-status-danger-text">{formError}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="self-end px-4 py-1.5 text-sm font-medium rounded-md bg-green-700 text-white disabled:opacity-60 cursor-pointer hover:bg-green-300"
        >
          {submitting ? "Linking..." : "Create Link"}
        </button>
      </form>

      {loading && <p className="text-sm text-placeholder-text">Loading...</p>}
      {error && <p className="text-sm text-status-danger-text">{error}</p>}
      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-2 bg-surface-light rounded-md px-4 py-2.5 text-sm"
            >
              <span className="font-medium">{link.pharmacy_name}</span>
              <span aria-hidden="true">&harr;</span>
              <span className="font-medium">{link.gp_surgery_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHomePage;
