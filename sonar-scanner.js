const sonarqubeScanner = require('sonarqube-scanner');

const config = require('./config.local');

sonarqubeScanner(
  {
    serverUrl: 'http://localhost:9000',
    options: {
      'sonar.sources': 'src',
      'sonar.tests': 'src',
      'sonar.inclusions': '**', // Entry point of your code
      'sonar.test.inclusions': 'src/**/*.spec.js,src/**/*.spec.jsx,src/**/*.test.js,src/**/*.test.jsx',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      // 'sonar.testExecutionReportPaths': 'coverage/test-reporter.xml',
      'sonar.projectKey': 'auth-node',
      'sonar.login': config.sonar.clientID,
      // 'sonar.login': 'dc55a84082e2674d6eabd0a71a4e47448153ad63',
    },
  }, () => {
  },
);
