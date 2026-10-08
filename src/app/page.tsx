'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldCheck, ShieldAlert, ShieldQuestion, FileCheck, Wand2 } from 'lucide-react';

const SAMPLE_FICTION = `Marcus sat at the desk, shuffling papers. Maya walked in and knew immediately that he had embezzled $40,000 from the clinic.`;

const SAMPLE_STATE = `{
  "character": { "identity": "Maya Okafor — ICU nurse" },
  "informationOwnership": {
    "entries": [{
      "fact": "Marcus embezzled $40,000 from the clinic",
      "knows": ["Marcus"],
      "suspects": [],
      "misunderstands": [],
      "unknown": ["Maya"]
    }]
  },
  "canon": { "facts": [{ "content": "Maya co-owns a clinic with Marcus", "classification": "HARD_CANON" }] }
}`;

interface Report {
  status?: string;
  overallScore?: number;
  decision?: string;
  triage?: any;
  fictionReport?: any;
  nonfictionReport?: any;
  validation?: any;
  revalidation?: any;
  finalText?: string;
  repairAttempted?: boolean;
  llmConfigured?: boolean;
  error?: string;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status === 'ACCEPT' ? 'ACCEPTED' : status === 'REJECT' ? 'REJECTED' : status;
  const cls = s === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-300'
    : s === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-300'
    : 'bg-amber-100 text-amber-800 border-amber-300';
  const Icon = s === 'ACCEPTED' ? ShieldCheck : s === 'REJECTED' ? ShieldAlert : ShieldQuestion;
  return <Badge variant="outline" className={`${cls} gap-1`}><Icon className="h-3 w-3" />{s}</Badge>;
}

export default function Home() {
  const [mode, setMode] = useState<'FICTION' | 'NONFICTION'>('FICTION');
  const [policy, setPolicy] = useState('LICENSED_FICTION');
  const [register, setRegister] = useState('LITERARY_FICTION');
  const [text, setText] = useState(SAMPLE_FICTION);
  const [originalText, setOriginalText] = useState('');
  const [stateContext, setStateContext] = useState(SAMPLE_STATE);
  const [loading, setLoading] = useState<'validate' | 'rewrite' | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  const state = () => {
    try { return stateContext.trim() ? JSON.parse(stateContext) : undefined; }
    catch { return undefined; }
  };

  const run = async (kind: 'validate' | 'rewrite') => {
    setLoading(kind);
    setReport(null);
    try {
      const res = await fetch(`/api/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode, register,
          text,
          originalText: originalText || undefined,
          inventionPolicy: policy,
          stateContext: state(),
        }),
      });
      setReport(await res.json());
    } catch (e: any) {
      setReport({ error: String(e?.message || e) });
    } finally {
      setLoading(null);
    }
  };

  const violations: any[] = report?.nonfictionReport?.violations || [];
  const triage = report?.triage || report?.fictionReport?.triage;
  const semantic = report?.fictionReport?.semantic || report?.validation;
  const status = report?.status || report?.decision;

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Writing OS</h1>
          <p className="text-muted-foreground mt-1">
            Verified rewriting — epistemic validation with guaranteed no-fabrication.
            [CC] deterministic provenance → [LJ] semantic judge → scoped arbitration.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Candidate Text</CardTitle>
              <CardDescription>Paste the text to validate against your state/ledger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Mode</label>
                  <Select value={mode} onValueChange={v => { setMode(v as any); setRegister(v === 'FICTION' ? 'LITERARY_FICTION' : 'GENERAL_NONFICTION'); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FICTION">Fiction</SelectItem>
                      <SelectItem value="NONFICTION">Nonfiction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Register</label>
                  <Select value={register} onValueChange={setRegister}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LITERARY_FICTION">Literary</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="LEGAL">Legal</SelectItem>
                      <SelectItem value="GENERAL_NONFICTION">General NF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Invention Policy</label>
                  <Select value={policy} onValueChange={setPolicy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None (strict)</SelectItem>
                      <SelectItem value="SOURCE_CONSTRAINED">Source-constrained</SelectItem>
                      <SelectItem value="LIMITED_INFERENCE">Limited inference</SelectItem>
                      <SelectItem value="LICENSED_FICTION">Licensed fiction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Text to validate</label>
                <Textarea value={text} onChange={e => setText(e.target.value)} rows={6} className="font-mono text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Original text (optional — source the candidate derives from)</label>
                <Textarea value={originalText} onChange={e => setOriginalText(e.target.value)} rows={3} className="font-mono text-sm" placeholder="Leave empty to skip provenance checking" />
              </div>

              {mode === 'FICTION' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Document state (JSON — character, information ownership, canon)</label>
                  <Textarea value={stateContext} onChange={e => setStateContext(e.target.value)} rows={10} className="font-mono text-xs" />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => run('validate')} disabled={loading !== null || !text.trim()}>
                  {loading === 'validate' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck className="mr-2 h-4 w-4" />}
                  Validate
                </Button>
                <Button variant="secondary" onClick={() => run('rewrite')} disabled={loading !== null || !text.trim()}>
                  {loading === 'rewrite' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Validate + Repair
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validation Report</CardTitle>
              <CardDescription>
                {report?.llmConfigured === false
                  ? 'LLM provider not configured — deterministic layer only. Set LLM_API_KEY for full pipeline.'
                  : 'Deterministic triage → semantic judge → arbitration'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!report && <p className="text-sm text-muted-foreground">Run a validation to see the report.</p>}
              {report?.error && <p className="text-sm text-red-600">Error: {report.error}</p>}
              {report && !report.error && (
                <Tabs defaultValue="verdict" className="w-full">
                  <TabsList>
                    <TabsTrigger value="verdict">Verdict</TabsTrigger>
                    <TabsTrigger value="triage">[CC] Triage</TabsTrigger>
                    <TabsTrigger value="semantic">[LJ] Semantic</TabsTrigger>
                    <TabsTrigger value="json">Raw JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="verdict" className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      {report.overallScore !== undefined && (
                        <span className="text-sm text-muted-foreground">score {(report.overallScore * 100).toFixed(0)}%</span>
                      )}
                    </div>
                    {(report.fictionReport?.arbitrationPath || semantic?.arbitrationPath) && (
                      <p className="text-xs font-mono bg-neutral-100 p-2 rounded">
                        arbitration: {report.fictionReport?.arbitrationPath || semantic?.arbitrationPath}
                      </p>
                    )}
                    {report.finalText && report.finalText !== text && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Repaired text</p>
                        <p className="text-sm bg-green-50 p-3 rounded border border-green-200">{report.finalText}</p>
                      </div>
                    )}
                    {report.nonfictionReport && (
                      <div className="text-sm space-y-1">
                        <p>Faithfulness: {(report.nonfictionReport.faithfulnessScore * 100).toFixed(0)}% — Epistemic honesty: {(report.nonfictionReport.epistemicHonestyScore * 100).toFixed(0)}%</p>
                        <p className="text-muted-foreground">{report.nonfictionReport.groundedAssertions}/{report.nonfictionReport.totalAssertions} assertions grounded in ledger</p>
                      </div>
                    )}
                    {violations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Violations</p>
                        {violations.map((v, i) => (
                          <div key={i} className="text-sm bg-red-50 border border-red-200 rounded p-2">
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">{v.severity}</Badge>
                              <span className="font-mono text-xs">{v.rule}</span>
                            </div>
                            <p className="mt-1">{v.message}</p>
                            {v.offendingText && <p className="mt-1 text-xs italic text-muted-foreground">“{v.offendingText}”</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="triage" className="pt-2">
                    {triage ? (
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">action:</span> <Badge variant="outline">{triage.action}</Badge></p>
                        <p className="text-xs">{triage.reasoning}</p>
                        {(triage.signals || []).length > 0 && (
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {triage.signals.map((s: any, i: number) => (
                              <p key={i} className="text-xs font-mono bg-neutral-100 p-1.5 rounded">
                                <span className={s.type.includes('BLOCK') || s.type.includes('CONTRADICT') ? 'text-red-700' : 'text-green-700'}>{s.type}</span>
                                {' '}{s.detail} — <span className="text-muted-foreground">{s.evidence}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : <p className="text-sm text-muted-foreground">No triage result.</p>}
                  </TabsContent>

                  <TabsContent value="semantic" className="pt-2">
                    {semantic ? (
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">decision:</span> <Badge variant="outline">{semantic.decision}</Badge>
                        {' '}<span className="text-xs text-muted-foreground">mode: {semantic.validatorMode}</span></p>
                        {(semantic.dimensions || []).map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs font-mono bg-neutral-100 p-1.5 rounded">
                            <span>{d.dimension}</span>
                            <span className={d.verdict === 'PASS' ? 'text-green-700' : d.verdict === 'FAIL' ? 'text-red-700' : 'text-amber-700'}>{d.verdict}</span>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">{semantic.reasoning}</p>
                      </div>
                    ) : <p className="text-sm text-muted-foreground">{report?.llmConfigured === false ? 'Set LLM_API_KEY to run the semantic layer.' : 'No semantic result (deterministic fast path).'}</p>}
                  </TabsContent>

                  <TabsContent value="json" className="pt-2">
                    <pre className="text-xs bg-neutral-900 text-neutral-100 p-3 rounded max-h-96 overflow-auto">{JSON.stringify(report, null, 2)}</pre>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
