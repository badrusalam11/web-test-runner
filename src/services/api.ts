import axios from 'axios';

const BASE_URL = 'http://localhost/service-test-runner';

export interface Project {
  name: string;
  url: string;
}

export interface TestSuite {
  testsuites: string[];
}

export interface TestRun {
  running_id: string;
  testsuite_id: string;
}

export interface TestStatus {
  checkpoint: number;
  id_test: string;
  status: number;
  progress: number;
  step_name: string;
  total_steps: number;
  report_file: string; // Full URL to the report file
}

export const api = {
  getProjects: async (): Promise<Project[]> => {
    const response = await axios.get(`${BASE_URL}/projects`);
    return response.data.data;
  },

  getTestSuites: async (project: string): Promise<string[]> => {
    const response = await axios.get(`${BASE_URL}/testsuites`, {
      params: { project }
    });
    return response.data.data.testsuites;
  },

  runTest: async (testsuite_id: string, project: string): Promise<TestRun> => {
    const response = await axios.post(`${BASE_URL}/automation/run`, {
      testsuite_id,
      project
    });
    return response.data.data;
  },

  checkStatus: async (id_test: string): Promise<TestStatus> => {
    const response = await axios.post(`${BASE_URL}/automation/check-status`, {
      id_test
    });
    return response.data.data;
  }
};