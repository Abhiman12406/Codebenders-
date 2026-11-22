const fs = require('fs');

const uaDir = 'C:/Users/Asus/Desktop/Codebenders/.ua';
const graph = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/assembled-graph.json`, 'utf8'));
const tour = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/tour.normalized.json`, 'utf8'));

// Build map of file nodes
const fileNodesMap = new Map();
graph.nodes.filter(n => ['file', 'config', 'document', 'service', 'pipeline', 'table', 'schema', 'resource', 'endpoint'].includes(n.type))
  .forEach(n => fileNodesMap.set(n.filePath, n));

// Map tour steps to file paths
const tourFileMap = new Map();
tour.forEach(step => {
  step.nodeIds.forEach(id => {
    const p = id.replace(/^(file|document|config|service):/, '');
    if (!tourFileMap.has(p)) {
      tourFileMap.set(p, step.order);
    }
  });
});

const detailedLessons = {
  "README.md": {
    overview: "StudioFlow's primary architectural reference, explaining the one-person back office concept, tech stack, API catalog, and startup instructions.",
    sections: [
      {
        title: "Introduction and core capabilities",
        lineRange: [1, 5],
        explanation: "Presents StudioFlow's mission: helping solo designers handle AR aging, cash forecasting, and payment tracking.",
        tourOrder: 1
      },
      {
        title: "Architecture breakdown",
        lineRange: [6, 21],
        explanation: "Outlines the dual architecture: React 18 / Vite frontend alongside the Express 5 API backend.",
        tourOrder: 1
      },
      {
        title: "API catalog and verification",
        lineRange: [46, 86],
        explanation: "Documents the REST endpoints under /api and test verification steps.",
        tourOrder: 1
      }
    ]
  },
  "package.json": {
    overview: "Manifest defining project dependencies for both the frontend (React, Tailwind, Lucide, GSAP) and backend (Express, CORS, dotenv, concurrently).",
    sections: [
      {
        title: "Scripts and concurrent runner",
        lineRange: [6, 11],
        explanation: "Configures concurrently to boot both the Express server on port 3001 and Vite client on port 5173.",
        tourOrder: 1
      },
      {
        title: "Production dependencies",
        lineRange: [12, 23],
        explanation: "Lists core runtime libraries including Express 5, React 18, GSAP, and Supabase client.",
        tourOrder: 1
      }
    ]
  },
  "src/main.jsx": {
    overview: "Application entry point mounting the root React tree into the DOM container with global CSS imports.",
    sections: [
      {
        title: "DOM root mounting",
        lineRange: [1, 10],
        explanation: "Imports index.css styles and initializes the ReactDOM root rendering the App component in StrictMode.",
        tourOrder: 2
      }
    ]
  },
  "src/App.jsx": {
    overview: "Central application shell coordinating StudioFlow views, state synchronization, active modals, and quick invoice input.",
    sections: [
      {
        title: "Imports and icon definitions",
        lineRange: [1, 34],
        explanation: "Imports Lucide icons, UI sub-components, and API / dataService utilities.",
        tourOrder: 2
      },
      {
        title: "Application state and effect hooks",
        lineRange: [35, 120],
        explanation: "Declares state for invoices, outflows, active modal dialogs, and loads initial data from dataService.",
        tourOrder: 2
      },
      {
        title: "Dashboard rendering and views",
        lineRange: [121, 300],
        explanation: "Renders top metrics cards, aging tables, cash projection charts, and interactive simulators.",
        tourOrder: 2
      }
    ]
  },
  "src/components/AgingDashboard.jsx": {
    overview: "Accounts receivable dashboard categorizing unpaid invoices into 0-30, 31-60, 61-90, and 90+ day overdue buckets.",
    sections: [
      {
        title: "Aging calculation logic",
        lineRange: [1, 50],
        explanation: "Computes elapsed days past due and groups invoices into color-coded risk tiers.",
        tourOrder: 3
      },
      {
        title: "Bucket breakdown rendering",
        lineRange: [51, 120],
        explanation: "Displays visual summary cards for each aging bucket with quick action triggers.",
        tourOrder: 3
      }
    ]
  },
  "src/components/DebtorCard.jsx": {
    overview: "Client debtor card displaying accumulated overdue debt, contact information, and WhatsApp follow-up action.",
    sections: [
      {
        title: "Debtor card layout and actions",
        lineRange: [1, 60],
        explanation: "Renders debtor profile, total balance, days overdue badge, and triggers WhatsApp reminder modal.",
        tourOrder: 3
      }
    ]
  },
  "src/components/WhatsAppModal.jsx": {
    overview: "Pre-formatted WhatsApp reminder generator crafting polite payment follow-up messages.",
    sections: [
      {
        title: "Template construction",
        lineRange: [1, 50],
        explanation: "Generates custom message text with debtor name, amount, and due date for instant WhatsApp web dispatch.",
        tourOrder: 3
      }
    ]
  },
  "src/components/CashForecastChart.jsx": {
    overview: "Interactive visual chart rendering projected cash balances over a 30 to 90 day future horizon.",
    sections: [
      {
        title: "Chart trajectory rendering",
        lineRange: [1, 80],
        explanation: "Plots daily cash curves combining scheduled receivables and outgoing operational expenses.",
        tourOrder: 4
      }
    ]
  },
  "src/components/WhatIfSimulator.jsx": {
    overview: "Interactive scenario simulator allowing the designer to test what happens if key clients pay 15-45 days late.",
    sections: [
      {
        title: "Scenario slider controls",
        lineRange: [1, 60],
        explanation: "Adjusts payment delay parameters dynamically recalculating cash forecast curves in real-time.",
        tourOrder: 4
      }
    ]
  },
  "src/lib/forecastEngine.js": {
    overview: "Pure calculation engine projecting future cash balances across calendar days from receivables and recurring outflows.",
    sections: [
      {
        title: "Forecast algorithm",
        lineRange: [1, 80],
        explanation: "Aggregates opening balance, planned invoice due dates, and recurring expense outflows per day.",
        tourOrder: 4
      }
    ]
  },
  "src/components/BadDayTriageModal.jsx": {
    overview: "Crisis triage tool providing a prioritized checklist of essential outflows and rapid collection actions when cash is dangerously low.",
    sections: [
      {
        title: "Triage prioritization logic",
        lineRange: [1, 90],
        explanation: "Separates must-pay survival expenses from deferrable outflows and highlights fast payment targets.",
        tourOrder: 5
      }
    ]
  },
  "src/components/OutflowsManager.jsx": {
    overview: "Studio expense manager allowing tracking and management of fixed subscriptions and variable studio bills.",
    sections: [
      {
        title: "Outflow CRUD operations",
        lineRange: [1, 100],
        explanation: "Renders existing studio expenses and handles adding or modifying recurring cost items.",
        tourOrder: 5
      }
    ]
  },
  "src/components/InvoiceModal.jsx": {
    overview: "Invoice editor modal for creating and updating client invoice details, line items, and payment due dates.",
    sections: [
      {
        title: "Invoice form inputs and validation",
        lineRange: [1, 110],
        explanation: "Collects client name, amount, status, and due dates, saving records through dataService.",
        tourOrder: 6
      }
    ]
  },
  "src/components/QuickInputBar.jsx": {
    overview: "Conversational input field enabling the user to type natural language sentences to draft invoices instantly.",
    sections: [
      {
        title: "NLP input handling",
        lineRange: [1, 75],
        explanation: "Captures user sentence input and routes it through nlpParser or the backend AI route.",
        tourOrder: 6
      }
    ]
  },
  "src/lib/nlpParser.js": {
    overview: "Client-side regex and keyword extraction engine parsing freeform sentences into structured invoice parameters.",
    sections: [
      {
        title: "Regex extraction patterns",
        lineRange: [1, 90],
        explanation: "Extracts dollar amounts, client company names, and relative date expressions (e.g., 'in 2 weeks').",
        tourOrder: 6
      }
    ]
  },
  "src/lib/dataService.js": {
    overview: "Unified data access layer providing offline-first persistence with seamless fallback from API to Supabase to localStorage.",
    sections: [
      {
        title: "Multi-tier data provider resolution",
        lineRange: [1, 100],
        explanation: "Attempts Express API fetch, then Supabase PostgreSQL client, falling back cleanly to localStorage.",
        tourOrder: 7
      }
    ]
  },
  "src/lib/api.js": {
    overview: "Fetch wrapper communicating with the Express backend REST endpoints under /api.",
    sections: [
      {
        title: "REST endpoint methods",
        lineRange: [1, 80],
        explanation: "Exposes structured async functions for invoices, outflows, forecasts, and server health checks.",
        tourOrder: 7
      }
    ]
  },
  "src/lib/supabaseClient.js": {
    overview: "Supabase client initialization reading environment variables or gracefully idling in guest demo mode.",
    sections: [
      {
        title: "Client configuration",
        lineRange: [1, 30],
        explanation: "Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to instantiate the Supabase client.",
        tourOrder: 7
      }
    ]
  },
  "src/components/AuthModal.jsx": {
    overview: "Authentication modal allowing user signup, login, and session management with Supabase Auth.",
    sections: [
      {
        title: "Auth flow UI",
        lineRange: [1, 70],
        explanation: "Handles credentials submission and triggers Supabase auth methods.",
        tourOrder: 7
      }
    ]
  },
  "server/index.js": {
    overview: "Express 5 application entry point configuring middleware, registering API routers, and starting the listener.",
    sections: [
      {
        title: "Express app configuration",
        lineRange: [1, 35],
        explanation: "Initializes Express, enables CORS, parses JSON bodies, and registers routers under /api.",
        tourOrder: 8
      }
    ]
  },
  "server/store.js": {
    overview: "Server-side JSON persistence manager reading and atomically updating server/data/db.json with automatic re-seeding.",
    sections: [
      {
        title: "JSON database access",
        lineRange: [1, 55],
        explanation: "Provides readDb and writeDb helpers with automatic initialization from seed data if missing.",
        tourOrder: 8
      }
    ]
  },
  "server/routes/invoices.js": {
    overview: "Express router managing CRUD endpoints for client invoices and payment status transitions.",
    sections: [
      {
        title: "Invoice route handlers",
        lineRange: [1, 60],
        explanation: "Handles GET /api/invoices, POST creation, PATCH updates, and DELETE actions.",
        tourOrder: 8
      }
    ]
  },
  "server/routes/forecast.js": {
    overview: "Express router serving cash forecast calculations over requested horizon periods.",
    sections: [
      {
        title: "Forecast endpoint handler",
        lineRange: [1, 40],
        explanation: "Reads invoices and outflows from the store and delegates projection math to the forecast engine.",
        tourOrder: 8
      }
    ]
  },
  "server/engine/forecast.js": {
    overview: "Backend cash forecasting algorithm projecting daily cash balance curves across configurable horizons.",
    sections: [
      {
        title: "Cash calculation logic",
        lineRange: [1, 70],
        explanation: "Iterates daily increments applying expected inflows and outflow deductions to calculate net cash.",
        tourOrder: 9
      }
    ]
  },
  "server/engine/nlp.js": {
    overview: "Backend natural language processing engine parsing conversational invoice prompts into invoice records.",
    sections: [
      {
        title: "Sentence tokenization and parsing",
        lineRange: [1, 65],
        explanation: "Matches patterns for client names, dollar values, and due date offsets.",
        tourOrder: 9
      }
    ]
  },
  "server/test-api.js": {
    overview: "Backend integration test script running 8 verification checks against the live Express server.",
    sections: [
      {
        title: "API test suite execution",
        lineRange: [1, 90],
        explanation: "Executes HTTP assertions testing health, invoices, portal payment, forecast, triage, and outflows.",
        tourOrder: 10
      }
    ]
  },
  "test_forecastEngine.js": {
    overview: "Unit test suite verifying client forecastEngine calculations, horizon bounds, and zero-balance handling.",
    sections: [
      {
        title: "Forecast engine assertions",
        lineRange: [1, 60],
        explanation: "Validates math accuracy, leap-year calculations, and outflow deductions.",
        tourOrder: 10
      }
    ]
  },
  "test_e2e_phase3.js": {
    overview: "End-to-end verification script testing Phase 3 features including triage workflows, NLP drafting, and outflows.",
    sections: [
      {
        title: "E2E scenario verification",
        lineRange: [1, 75],
        explanation: "Runs simulated user workflows verifying integration between frontend services and backend routes.",
        tourOrder: 10
      }
    ]
  }
};

// Assemble normalized code lessons
const allFiles = {};

// Detailed files
for (const [filePath, lesson] of Object.entries(detailedLessons)) {
  const node = fileNodesMap.get(filePath);
  if (!node) continue;
  const tourOrder = tourFileMap.get(filePath);

  allFiles[filePath] = {
    overview: lesson.overview,
    sections: lesson.sections.map(s => ({
      title: s.title,
      lineRange: s.lineRange,
      explanation: s.explanation,
      tourOrder: s.tourOrder || tourOrder
    }))
  };
}

// Deterministic overview-only entries for remaining file nodes
for (const [filePath, node] of fileNodesMap.entries()) {
  if (!allFiles[filePath]) {
    allFiles[filePath] = {
      overview: node.summary || "Source file contributing to StudioFlow.",
      sections: []
    };
  }
}

const stagedDoc = {
  version: 1,
  generatedAt: new Date().toISOString(),
  files: allFiles
};

fs.writeFileSync(`${uaDir}/intermediate/code-lessons.normalized.json`, JSON.stringify(stagedDoc, null, 2));
console.log('code-lessons.normalized.json written successfully. Total files:', Object.keys(allFiles).length);
