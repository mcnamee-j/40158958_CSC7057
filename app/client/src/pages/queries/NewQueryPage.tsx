import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { create_query } from "../../api/queries";
import type { QueryCategory, QueryPriority } from "../../types/query.types";
import { Api_Error } from "../../api/client";
import {
  get_linked_orgs,
  type LinkedOrganisation,
} from "../../api/organisations";

const NewQueryPage = () => {
  const navigate = useNavigate();

  const [recipientOrgId, setRecipientOrgId] = useState<number | undefined>(
    undefined,
  );
  const [category, setCategory] = useState<QueryCategory>("prescription");
  const [priority, setPriority] = useState<QueryPriority>("medium");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [initials, setInitials] = useState("");
  const [dob, setDob] = useState("");
  const [hcn, setHcn] = useState("");

  const [linkedOrgs, setLinkedOrgs] = useState<LinkedOrganisation[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!recipientOrgId) {
      setError("Please select a GP surgery.");
      return;
    }

    setSubmitting(true);

    const patient =
      initials || dob || hcn
        ? {
            initials: initials || undefined,
            dob: dob || undefined,
            hcn: hcn || undefined,
          }
        : undefined;

    try {
      const query = await create_query({
        recipient_org_id: recipientOrgId,
        category,
        priority,
        patient,
        subject,
        body,
      });
      navigate(`/queries/${query.id}`);
    } catch (e) {
      if (e instanceof Api_Error) {
        setError(e.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    get_linked_orgs()
      .then(setLinkedOrgs)
      .catch(() => setLinkedOrgs([]));
  }, []);

  return (
    <div className="flex flex-col gap-5 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-green-700">New Query</h2>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm bg-green-700 font-medium text-white rounded-md border border-surface-mid"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handle_submit} className="flex flex-col gap-4">
        <div className="bg-surface-light rounded-md px-4 py-3">
          <div className="text-sm font-medium text-green-900 mb-1">
            Patient details
          </div>
          <p className="text-xs text-placeholder-text mb-3">
            Optional. If adding a patient, provide at least 2 identifiers:
            initials, DOB, HCN
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-green-700 mb-1">
                Initials
              </label>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder="e.g. LM"
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-green-700 mb-1">DOB</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm text-placeholder-text"
              />
            </div>
            <div>
              <label className="block text-xs text-green-700 mb-1">HCN</label>
              <input
                type="text"
                value={hcn}
                onChange={(e) => setHcn(e.target.value)}
                placeholder="xxx-xxx-xxxx"
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap 3">
          <div>
            <label className="block text-sm text-green-900 mb-1">
              Recipient
            </label>
            <select
              value={recipientOrgId}
              onChange={(e) => setRecipientOrgId(Number(e.target.value))}
              required
              className="w-full rounded-md border border-surface-mid px-3 py-2 text-sm text-placeholder-text"
            >
              <option value="">Select a linked recipient</option>
              {linkedOrgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-green-900 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QueryCategory)}
              className="w-full rounded-md border border-surface-mid px-3 py-2 text-sm text-placeholder-text"
            >
              <option value="prescription">Prescription</option>
              <option value="stock">Stock</option>
              <option value="patient">Patient</option>
              <option value="routine">Routine</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-green-900 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as QueryPriority)}
              className="w-full rounded-md border border-surface-mid px-3 py-2 text-sm text-placeholder-text"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="block text-sm text-green-900 mb-1">Subject</label>
            <span className="text-xs text-placeholder-text">
              {subject.length}/80
            </span>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={80}
            required
            placeholder="Enter Query Subject"
            className="w-full rounded-md border border-surface-mid px-3 py-2 text-sm text-placeholder-text"
          />
        </div>

        <div>
          <div className="flex justify-between">
            <label className="block text-sm text-green-900 mb-1">Message</label>
            <span className="text-xs text-placeholder-text">
              {body.length}/1000
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            required
            placeholder="Enter Query Message"
            className="w-full min-h-24 rounded-md border border-surface-mid px-3 py-2 text-sm text-placeholder-text"
          ></textarea>
        </div>

        {error && <p className="txt-sm text-status-danger-text">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium rounded-md bg-green-700 text-white disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Query"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewQueryPage;
