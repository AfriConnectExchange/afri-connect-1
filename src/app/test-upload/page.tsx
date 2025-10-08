'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileText, Server, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type LogEntry = {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
  data?: any;
};

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addLog = (message: string, type: LogEntry['type'], data?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      data,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      addLog(`File selected: ${selectedFile.name}`, 'info', { size: `${(selectedFile.size / 1024).toFixed(2)} KB`, type: selectedFile.type });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      addLog('No file selected to upload.', 'error');
      return;
    }

    setIsUploading(true);
    setLogs([]); // Clear logs for new upload
    addLog('Starting upload...', 'info');

    try {
      // Step 1: Read file as Data URL
      addLog('Reading file from browser...', 'info');
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => {
            addLog('Failed to read file.', 'error', error);
            reject(error);
        };
        reader.readAsDataURL(file);
      });
      addLog('File read successfully.', 'success');

      // Step 2: Send to API
      addLog('Sending file to server API...', 'info', { endpoint: '/api/test-upload' });
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      addLog(`Server responded with status: ${response.status}`, response.ok ? 'success' : 'error');

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(JSON.stringify(result, null, 2));
      }

      addLog('Upload successful! Received URL.', 'success', { url: result.url });

    } catch (error: any) {
      addLog('An error occurred during upload.', 'error', { error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Storage Upload Test</CardTitle>
          <CardDescription>
            This page provides an isolated environment to test file uploads to Firebase Storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-grow">
              <label htmlFor="file-upload" className="font-medium text-sm">Choose a file</label>
              <Input id="file-upload" type="file" onChange={handleFileChange} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {isUploading ? 'Uploading...' : 'Start Test Upload'}
          </Button>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Live Log</h3>
            <div className="bg-muted rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs space-y-3">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Logs will appear here...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`p-2 rounded-md ${log.type === 'error' ? 'bg-red-500/10 text-red-700' : log.type === 'success' ? 'bg-green-500/10 text-green-700' : 'bg-background'}`}>
                    <p><span className="font-semibold">{log.timestamp}</span>: {log.message}</p>
                    {log.data && (
                      <pre className="mt-1 p-2 bg-black/5 rounded-sm whitespace-pre-wrap break-all">
                        <code>{typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}</code>
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
