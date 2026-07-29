import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Printer, ShieldCheck, Building2, Calendar, FileText, UserCheck } from 'lucide-react';

export interface ClearanceCertificateData {
  type: 'clearance' | 'rejection';
  request_title: string;
  requesting_org: string;
  evaluation_type: string;
  category_label: string;
  decision: string;
  conditions?: string | null;
  approved_by?: string | null;
  decision_date?: string;
  reference_number?: string;
  request_summary?: string;
}

interface Props {
  certificate: ClearanceCertificateData;
  onClose?: () => void;
}

export default function TechnologyClearanceCertificate({ certificate, onClose }: Props) {
  const isApproved = certificate.decision === 'Approved' || certificate.type === 'clearance';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="max-w-3xl mx-auto border-2 border-primary/20 shadow-lg print:border-none print:shadow-none bg-background">
      <CardHeader className="text-center border-b pb-6 bg-gradient-to-r from-blue-50/50 via-background to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/20">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Badge variant={isApproved ? 'default' : 'destructive'} className="text-sm px-3 py-1">
            {isApproved ? 'Official Technology Clearance' : 'Evaluation Decision'}
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Print Certificate
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-3">
          {isApproved ? (
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-10 w-10" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="h-10 w-10" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
          {isApproved ? 'Technology Clearance Certificate' : 'Technology Evaluation Decision'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Addis Ababa Innovation & Technology Development Bureau — ICT Evaluation Directorate
        </p>

        {certificate.reference_number && (
          <p className="text-xs font-mono font-semibold text-primary mt-2">
            Ref. No: {certificate.reference_number}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Requesting Organization</p>
              <p className="text-sm font-semibold text-foreground">{certificate.requesting_org}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Evaluation Category</p>
              <p className="text-sm font-semibold text-foreground">
                {certificate.category_label} ({certificate.evaluation_type})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Decision Date</p>
              <p className="text-sm font-semibold text-foreground">
                {certificate.decision_date ? new Date(certificate.decision_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserCheck className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Approved / Reviewed By</p>
              <p className="text-sm font-semibold text-foreground">{certificate.approved_by || 'Evaluation Director'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request Title</h3>
          <p className="text-lg font-bold text-foreground">{certificate.request_title}</p>
          {certificate.request_summary && (
            <p className="text-sm text-muted-foreground mt-2 italic bg-muted/20 p-3 rounded border-l-2 border-primary">
              "{certificate.request_summary}"
            </p>
          )}
        </div>

        <div className={`p-4 rounded-lg border ${
          isApproved
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {isApproved ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-rose-600" />}
            <h4 className="font-bold text-base">
              Decision: <span className="uppercase">{certificate.decision}</span>
            </h4>
          </div>
          <p className="text-sm mt-1">
            {isApproved
              ? 'This ICT request has undergone formal technical assessment and meets all city governance standards for implementation.'
              : 'This ICT request was reviewed and has not received technical clearance for implementation in its current form.'}
          </p>
        </div>

        {certificate.conditions && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {isApproved ? 'Mandatory Clearance Conditions & Requirements' : 'Evaluation Comments & Rejection Reasons'}
            </h4>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm whitespace-pre-wrap font-medium">
              {certificate.conditions}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t text-xs text-muted-foreground bg-muted/10">
        <div>
          Official Verification Code: <span className="font-mono font-bold text-foreground">AA-ICT-VERIFIED-{certificate.reference_number || 'OK'}</span>
        </div>
        <div>
          Addis Ababa Smart Governance Platform
        </div>
      </CardFooter>
    </Card>
  );
}
