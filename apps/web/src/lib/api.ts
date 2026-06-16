const API_URL = "http://localhost:4321/api";
const API_KEY = "ask_live_2a5f3dd33680e9b5531603466c2e6359e6ace73f3182d85f";

//GET -- Metrics Summary
export async function getMetricsSummary() {
  const response = await fetch(`${API_URL}/metrics/summary`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics summary: ${response.statusText}`);
  }

  return response.json();
}

//GET -- Test Cases List
export async function getTestCases(page = 1, limit = 20) {
  const response = await fetch(
    `${API_URL}/test-cases?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch test cases: ${response.statusText}`);
  }

  return response.json();
}

//GET -- Test Case Details
export async function getTestCase(id: string) {
  const response = await fetch(`${API_URL}/test-cases/${id}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch test case: ${response.statusText}`);
  }

  return response.json();
}

//GET -- Test Case History
export async function getTestCaseHistory(id: string) {
  const response = await fetch(`${API_URL}/test-cases/${id}/history`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch test case history: ${response.statusText}`,
    );
  }

  return response.json();
}

//GET -- Test Runs List
export async function getTestRuns(page = 1, limit = 20) {
  const response = await fetch(
    `${API_URL}/test-runs?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch test runs: ${response.statusText}`);
  }

  return response.json();
}

//GET -- Run Batch Details
export async function getRunBatches(page = 1, limit = 20) {
  const response = await fetch(
    `${API_URL}/run-batches?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch run batches: ${response.statusText}`);
  }

  return response.json();
}

//GET -- Run Batch Details
export async function getRunBatch(id: string) {
  const response = await fetch(`${API_URL}/run-batches/${id}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  return response.json();
}

// GET -- Analytics Summary
export async function getAnalyticsSummary() {
  const response = await fetch(`${API_URL}/analytics/summary`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch analytics summary: ${response.statusText}`,
    );
  }

  return response.json();
}

//GET -- Most Failing Tests
export async function getMostFailingTests() {
  const response = await fetch(`${API_URL}/analytics/failures`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch most failing tests: ${response.statusText}`,
    );
  }

  return response.json();
}

//GET -- Slowest Tests
export async function getSlowestTests() {
  const response = await fetch(`${API_URL}/analytics/slowest`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch slowest tests: ${response.statusText}`);
  }

  return response.json();
}

//GET -- Flaky Tests
export async function getFlakyTests() {
  const response = await fetch(`${API_URL}/analytics/flaky`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch flaky tests: ${response.statusText}`);
  }

  return response.json();
}

//GET -- Status Distribution
export async function getStatusDistribution() {
  const response = await fetch(`${API_URL}/analytics/status-distribution`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  return response.json();
}

//POST -- Manual Overrides
export async function overrideTestCaseStatus(
  id: string,
  status: "PASSED" | "FAILED" | "SKIPPED",
  comment: string,
) {
  const response = await fetch(
    `${API_URL}/manual-overrides/test-cases/${id}/status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, comment }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to override test case status: ${response.statusText}`,
    );
  }

  return response.json();
}

//GET -- Project Settings
export async function getProject() {
  const response = await fetch(`${API_URL}/project`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  return response.json();
}

//PATCH -- Update Project Settings
export async function updateProject(name: string) {
  const response = await fetch(`${API_URL}/project`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
    }),
  });

  return response.json();
}

//GET -- API Keys
export async function getApiKeys() {
  const response = await fetch(`${API_URL}/api-keys`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  return response.json();
}

//POST -- Create API Key
export async function createApiKey(name: string) {
  const response = await fetch(`${API_URL}/api-keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  return response.json();
}

//DELETE -- Revoke API Key
export async function revokeApiKey(id: string) {
  await fetch(`${API_URL}/api-keys/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
}
