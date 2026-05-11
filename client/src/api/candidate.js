/**
 * The above functions utilize Axios to interact with an API for various operations related to a
 * candidate's job search platform, such as fetching data, applying to jobs, saving jobs, updating
 * profiles, and retrieving dashboard statistics.
 * @param candidateId - `candidateId` is the unique identifier for a candidate in the job search
 * platform. It is used to identify and perform operations specific to a particular candidate, such as
 * fetching jobs, applying to jobs, saving jobs, accessing dashboard statistics, managing profile
 * information, and more.
 * @returns The code snippet provided contains functions that interact with an API for a candidate's
 * job search platform. Each function makes an HTTP request using Axios to perform operations like
 * fetching data, applying to jobs, saving jobs, updating profiles, and more.
 */
/* `import axios from "axios";` is importing the Axios library in JavaScript. Axios is a popular
library used for making HTTP requests from the browser or Node.js environment. In this code snippet,
Axios is being used to send HTTP requests to interact with an API for fetching data, updating
profiles, uploading files, and other operations related to a candidate's job search platform. */
import axios from "axios";

const API_BASE = "http://localhost:3001";

export async function getJobs(candidateId) {
  try {
    const url = candidateId
      ? `${API_BASE}/api/candidate/jobs?candidate_id=${candidateId}`
      : `${API_BASE}/api/candidate/jobs`;

    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("getJobs API error:", error.response?.data || error.message);
    throw error;
  }
}

export async function applyToJob(candidateId, jobId) {
  try {
    const { data } = await axios.post(`${API_BASE}/api/candidate/apply`, {
      candidate_id: candidateId,
      job_id: jobId,
    });
    return data;
  } catch (error) {
    console.error(
      "applyToJob API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function getApplications(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/applications/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getApplications API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function getAppliedJobIds(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/applied-job-ids/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getAppliedJobIds API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function getSavedJobIds(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/saved-job-ids/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getSavedJobIds API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function saveJob(candidateId, jobId) {
  try {
    const { data } = await axios.post(`${API_BASE}/api/candidate/save-job`, {
      candidate_id: candidateId,
      job_id: jobId,
    });
    return data;
  } catch (error) {
    console.error("saveJob API error:", error.response?.data || error.message);
    throw error;
  }
}

export async function unsaveJob(candidateId, jobId) {
  try {
    const { data } = await axios.delete(`${API_BASE}/api/candidate/save-job`, {
      data: {
        candidate_id: candidateId,
        job_id: jobId,
      },
    });
    return data;
  } catch (error) {
    console.error(
      "unsaveJob API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function getSavedJobs(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/saved-jobs/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getSavedJobs API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/* =========================
   DASHBOARD
========================= */

export async function getDashboardStats(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/dashboard/stats/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getDashboardStats API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function getRecentApplications(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/dashboard/recent-applications/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getRecentApplications API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function getRecommendedJobs(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/dashboard/recommended-jobs/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getRecommendedJobs API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/* =========================
   PROFILE
========================= */

export async function getCandidateProfile(candidateId) {
  try {
    const { data } = await axios.get(
      `${API_BASE}/api/candidate/profile/${candidateId}`,
    );
    return data;
  } catch (error) {
    console.error(
      "getCandidateProfile API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function updateCandidateProfile(candidateId, payload) {
  try {
    const { data } = await axios.put(
      `${API_BASE}/api/candidate/profile/${candidateId}`,
      payload,
    );
    return data;
  } catch (error) {
    console.error(
      "updateCandidateProfile API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export async function uploadCandidateCV(candidateId, file) {
  try {
    const formData = new FormData();
    formData.append("cv", file);

    const { data } = await axios.post(
      `${API_BASE}/api/candidate/upload-cv/${candidateId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  } catch (error) {
    console.error(
      "uploadCandidateCV API error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}
