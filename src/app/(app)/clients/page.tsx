import { EmptyState } from "@/components/EmptyState";
import { DEMO_MODE } from "@/lib/demo";
import { listClients } from "@/lib/data";
import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "../actions";

export default async function ClientsPage() {
  const list = await listClients();

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-brand">
            Clients
          </h1>
          <p className="mt-2 text-muted">
            Create clients, then attach projects with stack details.
            {DEMO_MODE ? " (demo data)" : ""}
          </p>
        </div>
      </div>

      <section className="surface rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Add client
        </h2>
        <form action={createClientAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            required
            className="field"
            placeholder="Client name"
            aria-label="Client name"
          />
          <button type="submit" className="btn btn-primary whitespace-nowrap">
            Create client
          </button>
        </form>
      </section>

      {list.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start tracking projects and readiness."
        />
      ) : (
        <section className="surface rounded-2xl p-2 sm:p-4">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <form
                        action={updateClientAction}
                        className="flex flex-col gap-2 sm:flex-row"
                      >
                        <input type="hidden" name="id" value={client.id} />
                        <input
                          name="name"
                          required
                          defaultValue={client.name}
                          className="field"
                          aria-label={`Rename ${client.name}`}
                        />
                        <button type="submit" className="btn btn-secondary text-sm">
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="text-muted">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <form action={deleteClientAction}>
                        <input type="hidden" name="id" value={client.id} />
                        <button type="submit" className="btn btn-danger text-sm">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
