import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '@/components/landing/PublicPageShell';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { COMPANY_NAME } from '@/lib/companyBranding';
import {
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plug,
  Terminal,
  Globe,
  ArrowLeft,
  Sparkles,
  Bot,
} from 'lucide-react';

export default function Connect() {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const serverUrl = new URL('/api/mcp', window.location.origin).toString();
  const claudeConnectUrl = `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(
    COMPANY_NAME
  )}&connectorUrl=${encodeURIComponent(serverUrl)}`;

  const cursorJsonSnippet = JSON.stringify(
    {
      mcpServers: {
        'compliancehr-infinity': {
          url: serverUrl,
        },
      },
    },
    null,
    2
  );

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(serverUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(cursorJsonSnippet);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <PublicPageShell>
      <div className="space-y-6">
        <PageHeader
          title="Connect Your AI Assistant (MCP)"
          description={`Point your preferred AI client to ${COMPANY_NAME} using Model Context Protocol (MCP) to query live records, registers, and assistants with your own account permissions.`}
          moduleKey="assistant"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Dashboard
              </Link>
            </Button>
          }
        />

        {/* Read-only MCP Server URL */}
        <section className="rounded-2xl border border-border bg-secondary/40 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">MCP Server URL</h2>
            </div>
            <Badge variant="secondary" className="font-bold">
              Streamable HTTP · OAuth
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this endpoint when connecting any compatible AI assistant to {COMPANY_NAME}.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              readOnly
              value={serverUrl}
              aria-label="MCP Server URL"
              onClick={(e) => e.currentTarget.select()}
              className="bg-card font-mono text-xs sm:text-sm font-semibold text-foreground"
            />
            <Button
              type="button"
              onClick={handleCopyUrl}
              className="shrink-0"
            >
              {copiedUrl ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Client Setup Instructions */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground">
            Choose Your AI Client
          </h2>

          <Tabs defaultValue="claude" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-2.5 p-2.5 sm:grid-cols-4">
              <TabsTrigger value="claude" data-hint="1-click custom connector for Claude web & desktop">
                <Sparkles className="h-3.5 w-3.5" />
                Claude
              </TabsTrigger>
              <TabsTrigger value="chatgpt" data-hint="Streamable HTTP server in ChatGPT desktop or web">
                <Bot className="h-3.5 w-3.5" />
                ChatGPT
              </TabsTrigger>
              <TabsTrigger value="cursor" data-hint="Add mcp.json server URL in Cursor IDE">
                <Terminal className="h-3.5 w-3.5" />
                Cursor
              </TabsTrigger>
              <TabsTrigger value="others" data-hint="Connect any Streamable HTTP MCP client">
                <Globe className="h-3.5 w-3.5" />
                Others
              </TabsTrigger>
            </TabsList>

            {/* 1. Claude */}
            <TabsContent value="claude" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">Connect with Claude</h3>
                    <p className="text-xs text-muted-foreground">
                      One-click custom connector setup for Claude on the web or desktop.
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <a href={claudeConnectUrl} target="_blank" rel="noopener noreferrer">
                      Add connector
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>

                <ol className="list-decimal space-y-2 pl-5 text-xs sm:text-sm text-foreground">
                  <li>
                    Click <strong>Add connector</strong> above to open Claude&apos;s custom-connector form pre-filled with <strong>{COMPANY_NAME}</strong>.
                  </li>
                  <li>
                    Verify the server URL is filled in (or paste the copied URL above if it is missing), then click <strong>Add</strong>.
                  </li>
                  <li>
                    Complete the sign-in and consent prompt to authorize Claude to act with your account permissions.
                  </li>
                </ol>
              </div>
            </TabsContent>

            {/* 2. ChatGPT */}
            <TabsContent value="chatgpt" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Connect with ChatGPT</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure {COMPANY_NAME} in the ChatGPT desktop app or web interface.
                  </p>
                </div>

                <ol className="list-decimal space-y-2 pl-5 text-xs sm:text-sm text-foreground">
                  <li>
                    In the <strong>ChatGPT desktop app</strong>, open ChatGPT&apos;s <strong>Settings</strong> and choose <strong>Plugins</strong>.
                  </li>
                  <li>
                    Open the <strong>MCPs</strong> tab and click <strong>Add server</strong>.
                  </li>
                  <li>
                    Give the server a name (for example, <strong>{COMPANY_NAME}</strong>), set <strong>Type</strong> to <strong>Streamable HTTP</strong>, and paste the MCP Server URL above.
                  </li>
                  <li>
                    Click <strong>Save</strong>, then <strong>Restart</strong> ChatGPT and enable the server.
                  </li>
                </ol>

                <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs text-foreground">
                  <strong>Using ChatGPT on the web?</strong> On the web, custom MCP servers are added and managed through <strong>Developer mode</strong> instead.
                </div>
              </div>
            </TabsContent>

            {/* 3. Cursor */}
            <TabsContent value="cursor" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">Connect with Cursor</h3>
                    <p className="text-xs text-muted-foreground">
                      Add {COMPANY_NAME} to Cursor&apos;s MCP configuration file.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopyJson}>
                    {copiedJson ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied JSON
                      </>
                    ) : (
                      <>
                        <Terminal className="h-3.5 w-3.5" />
                        Copy mcp.json entry
                      </>
                    )}
                  </Button>
                </div>

                <ol className="list-decimal space-y-2 pl-5 text-xs sm:text-sm text-foreground">
                  <li>
                    In Cursor, open <strong>Customize</strong> → <strong>MCPs</strong> tab → click <strong>New MCP Server</strong>, which opens <code>mcp.json</code>.
                  </li>
                  <li>
                    Add an entry whose <code>url</code> is the MCP Server URL shown above:
                  </li>
                </ol>

                <pre className="overflow-x-auto rounded-xl border border-border bg-secondary/50 p-3 font-mono text-xs text-foreground">
                  {cursorJsonSnippet}
                </pre>

                <p className="text-xs sm:text-sm text-foreground">
                  3. Save <code>mcp.json</code> and toggle the server <strong>on</strong>.
                </p>
              </div>
            </TabsContent>

            {/* 4. Others */}
            <TabsContent value="others" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-extrabold text-foreground">Other MCP Clients</h3>
                </div>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  Copy the MCP Server URL above and add it to your client as a <strong>streamable HTTP</strong> MCP server. A server name and this URL are all most clients need — once saved, reload the client to load the available tools.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* OAuth & Refresh Guidance */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Final Step: Sign In &amp; Approve (OAuth)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When connecting, your AI client opens this app&apos;s consent page where you sign in with your own {COMPANY_NAME} account and approve access. The assistant only ever acts as you and follows your role permissions.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span>Refresh the Connector After Updates</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI assistants cache the tool list. Whenever we publish new features, registers, or tools to {COMPANY_NAME}, refresh or reconnect the connector in your AI client to pick up the latest capabilities.
            </p>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}