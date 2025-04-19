import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import { api, Project, TestStatus } from './services/api';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
  },
});

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [testSuites, setTestSuites] = useState<string[]>([]);
  const [selectedTestSuite, setSelectedTestSuite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTests, setActiveTests] = useState<Map<string, TestStatus>>(new Map());
  const theme = useTheme();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTestSuites(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    const interval = setInterval(() => {
      activeTests.forEach((test, id) => {
        if (test.status < 3) {
          checkTestStatus(id);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTests]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
      setError('');
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadTestSuites = async (project: string) => {
    try {
      setLoading(true);
      const suites = await api.getTestSuites(project);
      setTestSuites(suites);
      setError('');
    } catch (err) {
      setError('Failed to load test suites');
      setTestSuites([]);
    } finally {
      setLoading(false);
    }
  };

  const runTest = async () => {
    if (!selectedProject || !selectedTestSuite) return;

    try {
      const result = await api.runTest(selectedTestSuite, selectedProject);
      setActiveTests(new Map(activeTests.set(result.running_id, {
        id_test: result.running_id,
        status: 1,
        checkpoint: 0
      })));
      setError('');
    } catch (err) {
      setError('Failed to start test');
    }
  };

  const checkTestStatus = async (id: string) => {
    try {
      const status = await api.checkStatus(id);
      setActiveTests(new Map(activeTests.set(id, status)));
    } catch (err) {
      console.error('Failed to check test status:', err);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case 2:
        return <RunCircleIcon sx={{ color: theme.palette.info.main }} />;
      case 3:
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 4:
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Queued';
      case 2:
        return 'Running';
      case 3:
        return 'Done';
      case 4:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <RunCircleIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Test Runner Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={selectedProject}
                    label="Project"
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.name} value={project.name}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Test Suite</InputLabel>
                  <Select
                    value={selectedTestSuite}
                    label="Test Suite"
                    onChange={(e) => setSelectedTestSuite(e.target.value)}
                    disabled={!selectedProject}
                  >
                    {testSuites.map((suite) => (
                      <MenuItem key={suite} value={suite}>
                        {suite}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  color="primary"
                  onClick={runTest}
                  disabled={!selectedProject || !selectedTestSuite || loading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'background.paper',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <PlayArrowIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from(activeTests.entries()).map(([id, test]) => (
                <Paper
                  key={id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  {getStatusIcon(test.status)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                      Test ID: {id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {getStatusText(test.status)}
                    </Typography>
                  </Box>
                  {test.status === 2 && <CircularProgress size={20} />}
                </Paper>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
