const API_URL = "/api/staff/repairs/";

function rejectExpiredStaffSession(response) {
  if (response.status === 401) {
    window.dispatchEvent(new Event("fixtrack:session-expired"));

    throw new Error("Your session has expired. Please sign in again.");
  }
}

async function getStaffCsrfToken() {
  const response = await fetch("/api/auth/csrf.php", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  rejectExpiredStaffSession(response);

  const result = await response.json();

  if (!response.ok || !result.success || typeof result.csrfToken !== "string") {
    throw new Error(result.error || "Unable to obtain security token.");
  }

  return result.csrfToken;
}

function formatRepair(repair) {
  return {
    id: Number(repair.id),
    trackingNumber: repair.tracking_number,
    customerName: repair.customer_name,
    contactNumber: repair.contact_number,
    gadgetType: repair.gadget_type,
    brand: repair.brand,
    model: repair.model,
    issue: repair.issue,
    dateReceived: repair.date_received,
    status: repair.status,
  };
}

async function request(method, body = null) {
  const options = {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  };

  // Include a CSRF token for operations that change data.
  if (["POST", "PUT", "DELETE"].includes(method)) {
    options.headers["X-CSRF-Token"] = await getStaffCsrfToken();
  }

  if (body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(API_URL, options);
  rejectExpiredStaffSession(response);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Unable to process the request.");
  }

  return result.data;
}

// READ
export async function getRepairs() {
  const records = await request("GET");
  return records.map(formatRepair);
}

// CREATE
export async function createRepair(formData) {
  const repair = await request("POST", formData);
  return formatRepair(repair);
}

// UPDATE
export async function updateRepair(id, formData) {
  const repair = await request("PUT", {
    ...formData,
    id,
  });

  return formatRepair(repair);
}

// DELETE
export async function deleteRepair(id) {
  await request("DELETE", { id });
}

export async function loginStaff(username, password) {
  const response = await fetch("/api/auth/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Login failed.");
  }

  return result.staff;
}

export async function checkStaffSession() {
  const response = await fetch("/api/auth/session.php", {
    credentials: "same-origin",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to verify staff session.");
  }

  const result = await response.json();
  return result.authenticated ? result.staff : null;
}

export async function logoutStaff() {
  const token = await getStaffCsrfToken();
  const response = await fetch("/api/auth/logout.php", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-CSRF-Token": token,
    },
  });
  rejectExpiredStaffSession(response);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Logout failed.");
  }

  return result;
}

export async function trackRepair(trackingNumber, contactNumber) {
  const response = await fetch("/api/tracking/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      trackingNumber: trackingNumber.trim().toUpperCase(),
      contactNumber: contactNumber.trim(),
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Unable to track repair.");
  }

  return {
    trackingNumber: result.data.tracking_number,
    gadgetType: result.data.gadget_type,
    brand: result.data.brand,
    model: result.data.model,
    dateReceived: result.data.date_received,
    status: result.data.status,
  };
}
