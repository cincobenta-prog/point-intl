import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Local API Serverless Middleware Plugin for Vite Dev Mode
function localApiMiddlewarePlugin(env: Record<string, string>) {
  return {
    name: 'local-api-middleware',
    configureServer(server: any) {
      Object.assign(process.env, env);

      server.middlewares.use(async (req: any, res: any, next: any) => {
        const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const pathname = urlObj.pathname;

        if (pathname.startsWith('/api/')) {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              let parsedBody = {};
              if (body) {
                try { parsedBody = JSON.parse(body); } catch { parsedBody = body; }
              }

              const customReq = {
                method: req.method,
                headers: req.headers,
                body: parsedBody,
                query: Object.fromEntries(urlObj.searchParams.entries())
              };

              const customRes = {
                status(code: number) {
                  res.statusCode = code;
                  return this;
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                send(data: any) {
                  res.end(data);
                  return this;
                }
              };

              // Live API Gateway Health Check Endpoint
              if (pathname === '/api/health') {
                return customRes.status(200).json({
                  status: 'healthy',
                  timestamp: new Date().toISOString(),
                  gateways: {
                    twilio: Boolean(process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_ACCOUNT_SID),
                    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
                    openai: Boolean(process.env.OPENAI_API_KEY),
                    quickbooks: Boolean(process.env.QBO_CLIENT_SECRET || process.env.QBO_CLIENT_ID),
                    docusign: Boolean(process.env.DOCUSIGN_CLIENT_SECRET || process.env.DOCUSIGN_RSA_PRIVATE_KEY)
                  }
                });
              }

              const routeMap: Record<string, string> = {
                '/api/twilio/sms': './api/twilio/sms.ts',
                '/api/ai/chat': './api/ai/chat.ts',
                '/api/stripe/create-payment-intent': './api/stripe/create-payment-intent.ts',
                '/api/quickbooks/sync': './api/quickbooks/sync.ts',
                '/api/docusign/envelope': './api/docusign/envelope.ts'
              };

              const targetRelativePath = routeMap[pathname];
              if (targetRelativePath) {
                const targetFilePath = path.resolve(__dirname, targetRelativePath);
                const module = await server.ssrLoadModule(targetFilePath);
                const handler = module.default || module.handler;
                if (typeof handler === 'function') {
                  return await handler(customReq, customRes);
                }
              }

              return customRes.status(404).json({ error: `API route ${pathname} not found.` });
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'API Middleware Error' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      localApiMiddlewarePlugin(env)
    ],
    server: {
      host: true,
      allowedHosts: true,
      port: 5173
    },
    preview: {
      host: true,
      allowedHosts: true,
      port: 5173
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              return 'vendor-libs';
            }
            if (id.includes('batesvilleCatalog')) {
              return 'data-batesville-catalog';
            }
            if (id.includes('mockCases') || id.includes('firstCallHelper')) {
              return 'data-mock-cases';
            }
            if (id.includes('digitalTributeQuestionBank') || id.includes('discrepancyAuditHelper') || id.includes('dayOfServiceHUDHelper')) {
              return 'data-helpers-bank';
            }

            // Subsystem Back-Office Modals
            if (id.includes('StripePaymentGatewayModal') || id.includes('QuickBooksSyncModal') || id.includes('CashAdvanceCheckPrinterModal') || id.includes('FinancialVerificationCenter') || id.includes('PrintableFormAP47Modal') || id.includes('ArrangementContractBuilderModal')) {
              return 'backoffice-financial-suite';
            }
            if (id.includes('EdrsRapidFillModal') || id.includes('DocuSignEnvelopeModal') || id.includes('DocumentJourneyMatrix') || id.includes('DiscrepancyGuardrailModal')) {
              return 'backoffice-regulatory-suite';
            }
            if (id.includes('FirstCallIntakeModal') || id.includes('RemovalSchedulingModal') || id.includes('FacilityCalendarView') || id.includes('ManagerDirectorSchedulingView') || id.includes('PartnerScheduleModal') || id.includes('ServicePartnerNetworkManager') || id.includes('TwoWayVendorSmsModal')) {
              return 'backoffice-operations-suite';
            }
            if (id.includes('MemorialProgramBuilderModal') || id.includes('CommercialPressFulfillmentModal') || id.includes('WebcastLiveStreamHubModal') || id.includes('WebcastSchedulingModal') || id.includes('DirectorDayOfServiceHUDModal') || id.includes('AIGatewaySettingsModal') || id.includes('TwilioGatewaySettingsModal') || id.includes('CloudSyncStorageModal') || id.includes('CaseLifecycleSimulatorModal') || id.includes('LiveNotificationSimulatorModal') || id.includes('FamilyProofApprovalModal')) {
              return 'backoffice-ceremonial-suite';
            }
            if (id.includes('/components/backoffice/')) {
              return 'backoffice-core';
            }

            // Family Portal Subsystem
            if (id.includes('/components/family/')) {
              return 'family-portal-suite';
            }

            // Public Showroom Subsystem
            if (id.includes('/components/public/')) {
              return 'public-showroom-suite';
            }

            if (id.includes('/lib/services/')) {
              return 'lib-services-gateway';
            }
          }
        }
      }
    }
  };
});
