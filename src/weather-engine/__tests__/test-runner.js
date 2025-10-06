#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Weather Engine
 * Runs all test suites and generates quality reports
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class WeatherEngineTestRunner {
  constructor() {
    this.results = {
      testSuites: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coverage: null,
      performance: null,
      startTime: Date.now(),
      endTime: null,
    };
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    console.log("🧪 Starting Weather Engine Comprehensive Test Suite\n");

    const testSuites = [
      {
        name: "Basic Tests",
        pattern: "src/weather-engine/__tests__/basic.test.js",
        description: "Core functionality and type validation tests",
      },
      {
        name: "Integration Tests",
        pattern:
          "src/weather-engine/__tests__/integration-tests-simple.test.ts",
        description: "End-to-end integration testing",
      },
      {
        name: "Test Data Generators",
        pattern: "src/weather-engine/__tests__/test-data-generators.test.ts",
        description: "Test data generation and validation",
      },
      {
        name: "Quality Assurance",
        pattern: "src/weather-engine/__tests__/quality-assurance.test.ts",
        description: "Code coverage and quality metrics",
      },
      {
        name: "Performance Monitoring",
        pattern: "src/weather-engine/__tests__/performance-monitoring.test.ts",
        description: "Performance benchmarks and monitoring",
      },
      {
        name: "Weather Manager Tests",
        pattern: "src/weather-engine/__tests__/weather-manager.test.ts",
        description: "Weather manager unit tests",
      },
      {
        name: "Season Manager Tests",
        pattern: "src/weather-engine/__tests__/season-manager.test.ts",
        description: "Season manager unit tests",
      },
      {
        name: "Card System Tests",
        pattern: "src/weather-engine/__tests__/weather-card-manager.test.ts",
        description: "Weather card system tests",
      },
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    this.results.endTime = Date.now();
    this.generateReport();
  }

  /**
   * Run a single test suite
   */
  async runTestSuite(suite) {
    console.log(`📋 Running ${suite.name}...`);
    console.log(`   ${suite.description}`);

    try {
      const startTime = Date.now();
      const output = execSync(`npm test ${suite.pattern}`, {
        encoding: "utf8",
        stdio: "pipe",
      });
      const endTime = Date.now();

      const result = this.parseTestOutput(output);
      result.name = suite.name;
      result.pattern = suite.pattern;
      result.description = suite.description;
      result.duration = endTime - startTime;
      result.status = "passed";

      this.results.testSuites.push(result);
      this.results.totalTests += result.total;
      this.results.passedTests += result.passed;
      this.results.failedTests += result.failed;
      this.results.skippedTests += result.skipped;

      console.log(
        `   ✅ ${result.passed}/${result.total} tests passed (${result.duration}ms)\n`
      );
    } catch (error) {
      const result = this.parseTestOutput(error.stdout || error.message);
      result.name = suite.name;
      result.pattern = suite.pattern;
      result.description = suite.description;
      result.status = "failed";
      result.error = error.message;

      this.results.testSuites.push(result);
      this.results.totalTests += result.total;
      this.results.passedTests += result.passed;
      this.results.failedTests += result.failed;
      this.results.skippedTests += result.skipped;

      console.log(
        `   ❌ ${result.failed} tests failed, ${result.passed} passed\n`
      );
    }
  }

  /**
   * Parse Jest test output
   */
  parseTestOutput(output) {
    const result = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      suites: 0,
    };

    // Parse test results from Jest output
    const testMatch = output.match(
      /Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/
    );
    if (testMatch) {
      result.failed = parseInt(testMatch[1]);
      result.passed = parseInt(testMatch[2]);
      result.total = parseInt(testMatch[3]);
    } else {
      const passedMatch = output.match(
        /Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/
      );
      if (passedMatch) {
        result.passed = parseInt(passedMatch[1]);
        result.total = parseInt(passedMatch[2]);
        result.failed = 0;
      }
    }

    const skippedMatch = output.match(/(\d+)\s+skipped/);
    if (skippedMatch) {
      result.skipped = parseInt(skippedMatch[1]);
    }

    const suitesMatch = output.match(
      /Test Suites:\s+(\d+)\s+passed,\s+(\d+)\s+total/
    );
    if (suitesMatch) {
      result.suites = parseInt(suitesMatch[2]);
    }

    return result;
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const duration = this.results.endTime - this.results.startTime;
    const successRate =
      (this.results.passedTests / this.results.totalTests) * 100;

    console.log("\n" + "=".repeat(80));
    console.log("🏆 WEATHER ENGINE TEST REPORT");
    console.log("=".repeat(80));

    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Total Test Suites: ${this.results.testSuites.length}`);
    console.log(`   Total Tests: ${this.results.totalTests}`);
    console.log(
      `   Passed: ${this.results.passedTests} (${successRate.toFixed(1)}%)`
    );
    console.log(`   Failed: ${this.results.failedTests}`);
    console.log(`   Skipped: ${this.results.skippedTests}`);
    console.log(
      `   Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`
    );

    console.log(`\n📋 Test Suite Results:`);
    this.results.testSuites.forEach((suite) => {
      const status = suite.status === "passed" ? "✅" : "❌";
      const rate =
        suite.total > 0
          ? ((suite.passed / suite.total) * 100).toFixed(1)
          : "0.0";
      console.log(
        `   ${status} ${suite.name}: ${suite.passed}/${suite.total} (${rate}%)`
      );

      if (suite.status === "failed" && suite.error) {
        console.log(`      Error: ${suite.error.split("\n")[0]}`);
      }
    });

    // Quality Assessment
    console.log(`\n🎯 Quality Assessment:`);
    const passedSuites = this.results.testSuites.filter(
      (s) => s.status === "passed"
    ).length;
    const suiteSuccessRate =
      (passedSuites / this.results.testSuites.length) * 100;

    console.log(`   Test Suite Success Rate: ${suiteSuccessRate.toFixed(1)}%`);
    console.log(`   Overall Test Success Rate: ${successRate.toFixed(1)}%`);

    if (successRate >= 95) {
      console.log(`   Quality Grade: A+ (Excellent)`);
    } else if (successRate >= 90) {
      console.log(`   Quality Grade: A (Very Good)`);
    } else if (successRate >= 85) {
      console.log(`   Quality Grade: B+ (Good)`);
    } else if (successRate >= 80) {
      console.log(`   Quality Grade: B (Acceptable)`);
    } else {
      console.log(`   Quality Grade: C (Needs Improvement)`);
    }

    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (this.results.failedTests > 0) {
      console.log(`   - Fix ${this.results.failedTests} failing tests`);
    }
    if (successRate < 90) {
      console.log(`   - Improve test coverage and reliability`);
    }
    if (this.results.skippedTests > 0) {
      console.log(`   - Review ${this.results.skippedTests} skipped tests`);
    }

    const avgDuration = duration / this.results.testSuites.length;
    if (avgDuration > 5000) {
      console.log(
        `   - Consider optimizing test performance (avg ${avgDuration.toFixed(
          0
        )}ms per suite)`
      );
    }

    console.log(`\n📄 Detailed Results:`);
    this.results.testSuites.forEach((suite) => {
      console.log(`\n   ${suite.name}:`);
      console.log(`     Description: ${suite.description}`);
      console.log(`     Pattern: ${suite.pattern}`);
      console.log(`     Status: ${suite.status}`);
      console.log(`     Tests: ${suite.passed}/${suite.total} passed`);
      if (suite.duration) {
        console.log(`     Duration: ${suite.duration}ms`);
      }
    });

    // Save report to file
    this.saveReportToFile();

    console.log("\n" + "=".repeat(80));

    // Exit with appropriate code
    if (this.results.failedTests > 0) {
      console.log("❌ Some tests failed. Please review and fix failing tests.");
      process.exit(1);
    } else {
      console.log("✅ All tests passed successfully!");
      process.exit(0);
    }
  }

  /**
   * Save detailed report to file
   */
  saveReportToFile() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSuites: this.results.testSuites.length,
        totalTests: this.results.totalTests,
        passed: this.results.passedTests,
        failed: this.results.failedTests,
        skipped: this.results.skippedTests,
        successRate: (this.results.passedTests / this.results.totalTests) * 100,
        duration: this.results.endTime - this.results.startTime,
      },
      suites: this.results.testSuites,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    const reportPath = path.join(__dirname, "test-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Run specific test categories
   */
  async runCategory(category) {
    const categories = {
      unit: [
        "src/weather-engine/__tests__/basic.test.js",
        "src/weather-engine/__tests__/weather-manager.test.ts",
        "src/weather-engine/__tests__/season-manager.test.ts",
      ],
      integration: [
        "src/weather-engine/__tests__/integration-tests-simple.test.ts",
        "src/weather-engine/__tests__/weather-manager-integration.test.ts",
      ],
      performance: [
        "src/weather-engine/__tests__/performance-monitoring.test.ts",
      ],
      quality: [
        "src/weather-engine/__tests__/quality-assurance.test.ts",
        "src/weather-engine/__tests__/test-data-generators.test.ts",
      ],
    };

    const patterns = categories[category];
    if (!patterns) {
      console.error(`Unknown category: ${category}`);
      console.log(
        `Available categories: ${Object.keys(categories).join(", ")}`
      );
      process.exit(1);
    }

    console.log(`🧪 Running ${category} tests...\n`);

    for (const pattern of patterns) {
      const suite = {
        name: path.basename(pattern, path.extname(pattern)),
        pattern,
        description: `${category} test`,
      };
      await this.runTestSuite(suite);
    }

    this.results.endTime = Date.now();
    this.generateReport();
  }
}

// CLI Interface
const args = process.argv.slice(2);
const runner = new WeatherEngineTestRunner();

if (args.length === 0) {
  // Run all tests
  runner.runAllTests().catch((error) => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
} else if (args[0] === "--category" && args[1]) {
  // Run specific category
  runner.runCategory(args[1]).catch((error) => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
} else if (args[0] === "--help") {
  console.log(`
Weather Engine Test Runner

Usage:
  node test-runner.js                    Run all tests
  node test-runner.js --category unit    Run unit tests only
  node test-runner.js --category integration  Run integration tests only
  node test-runner.js --category performance  Run performance tests only
  node test-runner.js --category quality      Run quality assurance tests only
  node test-runner.js --help             Show this help

Categories:
  unit         - Basic unit tests and core functionality
  integration  - End-to-end integration tests
  performance  - Performance benchmarks and monitoring
  quality      - Code quality and coverage tests
`);
} else {
  console.error("Invalid arguments. Use --help for usage information.");
  process.exit(1);
}
