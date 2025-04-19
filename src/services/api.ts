import axios from 'axios';

const BASE_URL = 'http://localhost';

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
}

export const api = {
  getProjects: async (): Promise<Project[]> => {
    const response = await axios.get(`${BASE_URL}/service-test-runner/projects`);
    return response.data.data;
  },

  getTestSuites: async (project: string): Promise<string[]> => {
    const response = await axios.get(`${BASE_URL}/service-test-runner/testsuites`, {
      params: { project }
    });
    return response.data.data.testsuites;
  },

  runTest: async (testsuite_id: string, project: string): Promise<TestRun> => {
    const response = await axios.post(`${BASE_URL}/service-test-runner/automation/run`, {
      testsuite_id,
      project
    });
    return response.data.data;
  },

  checkStatus: async (id_test: string): Promise<TestStatus> => {
    const response = await axios.post(`${BASE_URL}/service-test-runner/automation/check-status`, {
      id_test
    });
    return response.data.data;
  }
};