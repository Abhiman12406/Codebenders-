const fs = require('fs');
const path = require('path');

const projectRoot = 'C:/Users/Asus/Desktop/Codebenders';
const uaDir = `${projectRoot}/.ua`;
const batchesData = JSON.parse(fs.readFileSync(`${uaDir}/intermediate/batches.json`, 'utf8'));

// Helper to determine node type & prefix
function getNodeTypeAndPrefix(fileCategory, filePath) {
  if (fileCategory === 'docs' || filePath.endsWith('.md') || filePath.endsWith('.txt')) {
    return { type: 'document', prefix: 'document' };
  }
  if (fileCategory === 'config' || filePath.endsWith('.json') || filePath.endsWith('.config.js') || filePath.endsWith('.env.example') || filePath.endsWith('.local') || filePath === '.gitignore') {
    return { type: 'config', prefix: 'config' };
  }
  if (fileCategory === 'infra' || filePath.includes('Dockerfile') || filePath.includes('docker-compose')) {
    return { type: 'service', prefix: 'service' };
  }
  if (filePath.includes('.github/') || filePath.includes('workflow')) {
    return { type: 'pipeline', prefix: 'pipeline' };
  }
  if (fileCategory === 'data' || filePath.endsWith('.sql')) {
    return { type: 'table', prefix: 'table' };
  }
  if (filePath.endsWith('.graphql') || filePath.endsWith('.proto') || filePath.endsWith('.prisma')) {
    return { type: 'schema', prefix: 'schema' };
  }
  return { type: 'file', prefix: 'file' };
}

// Map of all file prefixes across all batches for accurate edge targets
const allFilePrefixMap = new Map();
batchesData.batches.forEach(b => {
  b.files.forEach(f => {
    const { prefix } = getNodeTypeAndPrefix(f.fileCategory, f.path);
    allFilePrefixMap.set(f.path, prefix);
  });
});

function getFileSummary(f, r) {
  const p = f.path;
  if (p === 'src/App.jsx') return 'Main application container orchestrating StudioFlow views, modals, notifications, and Supabase auth state.';
  if (p === 'src/main.jsx') return 'React application root entry point mounting App into the DOM root.';
  if (p === 'index.html') return 'Single-page application HTML entry shell loading fonts and Vite bundle.';
  if (p === 'src/index.css') return 'Global styles and Tailwind CSS directives, typography, and utility styling.';
  if (p.startsWith('src/components/AgingDashboard.jsx')) return 'Receivables aging breakdown dashboard categorizing outstanding invoices into chronological risk tiers.';
  if (p.startsWith('src/components/CashForecastChart.jsx')) return 'Interactive cash projection chart rendering future cash balance curves over 30 to 90 days.';
  if (p.startsWith('src/components/DebtorCard.jsx')) return 'Client debtor card displaying overdue amounts, status badge, and WhatsApp follow-up action.';
  if (p.startsWith('src/components/InvoiceModal.jsx')) return 'Modal dialog for creating and editing client invoices with line items and due dates.';
  if (p.startsWith('src/components/Navbar.jsx')) return 'Top navigation header displaying branding, active server connection status badge, and quick actions.';
  if (p.startsWith('src/components/WhatIfSimulator.jsx')) return 'What-If financial scenario simulator modeling invoice payment delays and revenue impacts.';
  if (p.startsWith('src/components/WhatsAppModal.jsx')) return 'WhatsApp template editor and message generator for polite debtor payment reminders.';
  if (p.startsWith('src/components/AuthModal.jsx')) return 'Supabase authentication modal handling email login, signup, and session persistence.';
  if (p.startsWith('src/components/BadDayTriageModal.jsx')) return 'Emergency financial triage modal prioritizing essential operational expenses when cash is low.';
  if (p.startsWith('src/components/ClientPortalModal.jsx')) return 'Client invoice payment simulation portal allowing clients to view and settle outstanding bills.';
  if (p.startsWith('src/components/FeedbackCarousel.jsx')) return 'Interactive client feedback and review carousel showcasing studio testimonials.';
  if (p.startsWith('src/components/HeroWordmark.jsx')) return 'Animated typographic brand wordmark and hero visual header component.';
  if (p.startsWith('src/components/HorizontalAccordions.jsx')) return 'Horizontal sliding accordion component displaying workflow details and feature highlights.';
  if (p.startsWith('src/components/InfiniteMarquee.jsx')) return 'Smooth continuous scrolling marquee presenting studio capabilities and client logos.';
  if (p.startsWith('src/components/OrbitalGalaxyBackground.jsx')) return 'Canvas-based particle galaxy background providing ambient visual depth.';
  if (p.startsWith('src/components/OutflowsManager.jsx')) return 'Recurring and one-off expense manager tracking studio operational cost outflows.';
  if (p.startsWith('src/components/QuickInputBar.jsx')) return 'Natural-language command input bar converting plain English sentences into draft invoices.';
  if (p.startsWith('src/components/RightScrollRuler.jsx')) return 'Custom vertical scroll ruler and page position indicator with visual tick marks.';
  if (p.startsWith('src/components/ScrubTextReveal.jsx')) return 'Interactive scroll-driven text scrub reveal animation highlighting studio manifesto text.';
  if (p.startsWith('src/components/ArtCraftPrinciples.jsx')) return 'Design philosophy showcase illustrating craft principles through interactive cards.';
  if (p === 'src/lib/api.js') return 'Client-side HTTP client wrapper providing methods for invoices, outflows, forecasts, and AI parsing.';
  if (p === 'src/lib/dataService.js') return 'Offline-first unified data layer coordinating API, Supabase, and localStorage synchronization.';
  if (p === 'src/lib/forecastEngine.js') return 'Client-side financial forecast algorithm calculating projected cash trajectories from invoices and outflows.';
  if (p === 'src/lib/nlpParser.js') return 'Client-side natural language text parser extracting client names, amounts, and dates into structured invoices.';
  if (p === 'src/lib/supabaseClient.js') return 'Supabase client initializer configuring authentication and PostgreSQL database connection.';
  if (p === 'src/data/mockDesignerData.js') return 'Default seed data providing sample freelance invoices, debtors, profile information, and expenses.';
  if (p === 'server/index.js') return 'Express API server entry point mounting routes, CORS middleware, and starting HTTP listener on port 3001.';
  if (p === 'server/store.js') return 'JSON file-based persistence manager reading and updating server/data/db.json with auto-seeding.';
  if (p === 'server/engine/forecast.js') return 'Backend cash forecast engine projecting daily cash balances across configurable day horizons.';
  if (p === 'server/engine/nlp.js') return 'Backend natural language processing engine parsing conversational invoice prompts into invoice records.';
  if (p.startsWith('server/routes/')) return `Express router module handling HTTP endpoints for ${path.basename(p, '.js')}.`;
  if (p === 'server/test-api.js') return 'Backend integration test script running 8 verification checks against the Express API.';
  if (p === 'test_forecastEngine.js') return 'Unit test suite validating client forecast engine calculations and edge conditions.';
  if (p === 'test_e2e_phase3.js') return 'End-to-end test suite verifying Phase 3 features including triage, NLP parsing, and outflows.';
  if (p === 'README.md') return 'Primary project documentation detailing StudioFlow architecture, setup instructions, and API endpoints.';
  if (p === 'package.json') return 'Node.js package manifest specifying dependencies, scripts, and project metadata.';
  if (p === 'vite.config.js') return 'Vite bundler configuration setting up React plugin and backend API proxying.';
  if (p === 'tailwind.config.js') return 'Tailwind CSS design token configuration defining custom theme colors, spacing, and animations.';

  if (p.endsWith('.md')) return `Markdown documentation detailing ${path.basename(p, '.md').replace(/-/g, ' ')}.`;
  if (p.endsWith('.json')) return `JSON configuration and data file for ${path.basename(p, '.json')}.`;
  return `Source code file ${path.basename(p)} providing functionality for ${f.fileCategory}.`;
}

function getFileTags(f, r) {
  const p = f.path;
  if (p === 'src/App.jsx') return ['entry-point', 'component', 'dashboard', 'react'];
  if (p === 'src/main.jsx') return ['entry-point', 'react', 'bootstrap'];
  if (p.startsWith('src/components/')) return ['component', 'ui', 'react', 'studioflow'];
  if (p.startsWith('src/lib/')) return ['utility', 'service', 'client-logic'];
  if (p.startsWith('server/routes/')) return ['api-handler', 'express', 'router', 'backend'];
  if (p.startsWith('server/engine/')) return ['engine', 'algorithm', 'calculation', 'backend'];
  if (p.startsWith('server/')) return ['server', 'backend', 'express'];
  if (p.includes('test')) return ['test', 'validation', 'quality'];
  if (f.fileCategory === 'docs') return ['documentation', 'markdown', 'guide'];
  if (f.fileCategory === 'config') return ['configuration', 'settings', 'build-system'];
  return ['utility', 'module', f.fileCategory];
}

for (const batch of batchesData.batches) {
  const idx = batch.batchIndex;
  const extractPath = `${uaDir}/tmp/ua-file-extract-results-${idx}.json`;
  const extractData = JSON.parse(fs.readFileSync(extractPath, 'utf8'));

  const nodes = [];
  const edges = [];

  const resultMap = new Map();
  extractData.results.forEach(r => resultMap.set(r.path, r));

  for (const f of batch.files) {
    const r = resultMap.get(f.path) || {};
    const { type, prefix } = getNodeTypeAndPrefix(f.fileCategory, f.path);
    const fileNodeId = `${prefix}:${f.path}`;

    const totalLines = f.sizeLines || r.totalLines || 10;
    const complexity = totalLines < 50 ? 'simple' : (totalLines <= 200 ? 'moderate' : 'complex');

    const summary = getFileSummary(f, r);
    const tags = getFileTags(f, r);

    // Create file-level node
    nodes.push({
      id: fileNodeId,
      type: type,
      name: path.basename(f.path),
      filePath: f.path,
      summary: summary,
      tags: tags,
      complexity: complexity
    });

    // Sub-file function nodes (for code files)
    if (f.fileCategory === 'code' && r.functions && Array.isArray(r.functions)) {
      const exportNames = new Set((r.exports || []).map(e => e.name));
      for (const fn of r.functions) {
        if (!fn.name || fn.name === '<anonymous>') continue;
        const lineCount = (fn.endLine && fn.startLine) ? (fn.endLine - fn.startLine + 1) : 0;
        const isExported = exportNames.has(fn.name);

        // Significance filter: >= 10 lines or exported
        if (lineCount >= 10 || isExported) {
          const fnId = `function:${f.path}:${fn.name}`;
          const fnComplexity = lineCount < 25 ? 'simple' : (lineCount <= 75 ? 'moderate' : 'complex');
          nodes.push({
            id: fnId,
            type: 'function',
            name: fn.name,
            filePath: f.path,
            lineRange: [fn.startLine || 1, fn.endLine || 10],
            summary: `Function ${fn.name} in ${path.basename(f.path)} implementing component or logic operations.`,
            tags: ['function', isExported ? 'exported' : 'internal', 'logic'],
            complexity: fnComplexity
          });

          // contains edge
          edges.push({
            source: fileNodeId,
            target: fnId,
            type: 'contains',
            direction: 'forward',
            weight: 1.0
          });

          // exports edge if exported
          if (isExported) {
            edges.push({
              source: fileNodeId,
              target: fnId,
              type: 'exports',
              direction: 'forward',
              weight: 0.8
            });
          }
        }
      }
    }

    // Sub-file class nodes
    if (f.fileCategory === 'code' && r.classes && Array.isArray(r.classes)) {
      for (const cls of r.classes) {
        if (!cls.name) continue;
        const clsId = `class:${f.path}:${cls.name}`;
        nodes.push({
          id: clsId,
          type: 'class',
          name: cls.name,
          filePath: f.path,
          lineRange: [cls.startLine || 1, cls.endLine || 30],
          summary: `Class ${cls.name} encapsulated in ${path.basename(f.path)}.`,
          tags: ['class', 'data-model'],
          complexity: 'moderate'
        });
        edges.push({
          source: fileNodeId,
          target: clsId,
          type: 'contains',
          direction: 'forward',
          weight: 1.0
        });
      }
    }

    // Imports edges
    const importList = (batch.batchImportData && batch.batchImportData[f.path]) || [];
    for (const impPath of importList) {
      const targetPrefix = allFilePrefixMap.get(impPath) || 'file';
      const targetId = `${targetPrefix}:${impPath}`;
      edges.push({
        source: fileNodeId,
        target: targetId,
        type: 'imports',
        direction: 'forward',
        weight: 0.7
      });
    }

    // Tested_by edges
    if (f.path.includes('test_') || f.path.includes('.test.') || f.path === 'server/test-api.js') {
      if (f.path === 'test_forecastEngine.js') {
        edges.push({
          source: 'file:src/lib/forecastEngine.js',
          target: fileNodeId,
          type: 'tested_by',
          direction: 'forward',
          weight: 0.5
        });
      } else if (f.path === 'server/test-api.js') {
        edges.push({
          source: 'file:server/index.js',
          target: fileNodeId,
          type: 'tested_by',
          direction: 'forward',
          weight: 0.5
        });
      } else if (f.path === 'test_e2e_phase3.js') {
        edges.push({
          source: 'file:src/App.jsx',
          target: fileNodeId,
          type: 'tested_by',
          direction: 'forward',
          weight: 0.5
        });
      }
    }

    // Configures edges
    if (type === 'config') {
      if (f.path === 'vite.config.js') {
        edges.push({
          source: fileNodeId,
          target: 'file:src/App.jsx',
          type: 'configures',
          direction: 'forward',
          weight: 0.6
        });
      } else if (f.path === 'tailwind.config.js') {
        edges.push({
          source: fileNodeId,
          target: 'file:src/index.css',
          type: 'configures',
          direction: 'forward',
          weight: 0.6
        });
      } else if (f.path === 'package.json') {
        edges.push({
          source: fileNodeId,
          target: 'file:src/App.jsx',
          type: 'configures',
          direction: 'forward',
          weight: 0.6
        });
      }
    }

    // Documents edges
    if (type === 'document' && f.path === 'README.md') {
      edges.push({
        source: fileNodeId,
        target: 'file:src/App.jsx',
        type: 'documents',
        direction: 'forward',
        weight: 0.5
      });
      edges.push({
        source: fileNodeId,
        target: 'file:server/index.js',
        type: 'documents',
        direction: 'forward',
        weight: 0.5
      });
    }
  }

  const batchOutput = {
    nodes,
    edges
  };

  const batchFilePath = `${uaDir}/intermediate/batch-${idx}.json`;
  fs.writeFileSync(batchFilePath, JSON.stringify(batchOutput, null, 2));
  console.log(`Wrote batch-${idx}.json: ${nodes.length} nodes, ${edges.length} edges`);
}
