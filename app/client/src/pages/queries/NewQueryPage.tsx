import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { create_query } from "../../api/queries";
import type { QueryCategory, QueryPriority } from "../../types/query.types";
import { Api_Error } from "../../api/client";

const NewQueryPage = () => {
  const navigate = useNavigate();

  const [recipientOrgId, setRecipientOrgId] = useState(2); // hardcoded value until api endpoint is adjusted/created
  const [category, setCategory] = useState<QueryCategory>("prescription");
  const [priority, setPriority] = useState<QueryPriority>("medium");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [initials, setInitials] = useState("");
  const [dob, setDob] = useState("");
  const [hcn, setHcn] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
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

  return (
    <div>
      <div>
        <h2>New Query</h2>
        <button>Cancek</button>
      </div>

      <form onSubmit={handle_submit}>
        <div>
          <div>Patient details</div>
          <p>
            Optional. If adding a patient, provide at least 2 identifiers:
            initials, DOB, HCN
          </p>
          <div>
            <div>
              <label>Initials</label>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder="e.g. LM"
              />
            </div>
            <div>
              <label>DOB</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <label>HCN</label>
              <input
                type="text"
                value={hcn}
                onChange={(e) => setHcn(e.target.value)}
                placeholder="xxx-xxx-xxxx"
              />
            </div>
          </div>
        </div>

        <div>
          <div>
            <label>GP Surgery</label>
            <select
              value={recipientOrgId}
              onChange={(e) => setRecipientOrgId(Number(e.target.value))}
            >
              <option value={2}>Hillview Surgery</option>
            </select>
          </div>
          <div>
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QueryCategory)}
            >
              <option value="prescription">Prescription</option>
              <option value="stock">Stock</option>
              <option value="patient">Patient</option>
              <option value="routine">Routine</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as QueryPriority)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <div>
            <label>Subject</label>
            <span>{subject.length}/80</span>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={80}
            required
            placeholder="Enter Query Subject"
          />
        </div>

        <div>
          <div>
            <label>Message</label>
            <span>{body.length}/1000</span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            required
            placeholder="Enter Query Message"
          ></textarea>
        </div>

        {error && <p className="txt-sm text-status-danger-text">{error}</p>}

        <div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Query"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewQueryPage;
