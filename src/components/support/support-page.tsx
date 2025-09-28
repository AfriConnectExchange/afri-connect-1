'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Bot, Phone, Mail, Send, Search, HelpCircle,
  Clock, CheckCircle, User, FileText, Headphones, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

interface SupportPageProps {
  onNavigate: (page: string) => void;
}

// Mock data for demonstration - in a real app, this would be fetched
const mockTickets = [
  {
    id: 'TKT-001',
    subject: 'Payment Issue with Order AC-12345',
    category: 'billing',
    status: 'open',
    priority: 'high',
    lastUpdate: '2024-07-21T10:30:00Z',
  },
  {
    id: 'TKT-002',
    subject: 'Unable to Upload Product Images',
    category: 'technical',
    status: 'in-progress',
    priority: 'medium',
    lastUpdate: '2024-07-20T14:00:00Z',
  },
  {
    id: 'TKT-003',
    subject: 'Question About Seller Verification',
    category: 'general',
    status: 'resolved',
    priority: 'low',
    lastUpdate: '2024-07-18T09:00:00Z',
  }
];

const mockFAQs = [
  {
    id: 'faq-001',
    question: 'How do I become a verified seller?',
    answer: 'To become a verified seller, you need to complete your profile, upload valid identification documents, and provide proof of address. The verification process typically takes 24-48 hours.',
    category: 'seller',
  },
  {
    id: 'faq-002',
    question: 'What payment methods are accepted?',
    answer: 'We accept major credit cards (Visa, Mastercard, American Express), PayPal, and digital wallets. All payments are processed securely through our encrypted payment system.',
    category: 'payment',
  },
  {
    id: 'faq-003',
    question: 'How does the escrow system work?',
    answer: 'Our escrow system holds buyer payments securely until the product is delivered and confirmed. This protects both buyers and sellers in every transaction.',
    category: 'general',
  },
];


const categories = [
  { value: 'general', label: 'General Question' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'account', label: 'Account & Profile' },
  { value: 'orders', label: 'Orders & Shipping' },
  { value: 'seller', label: 'Seller Support' }
];

const priorityLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];


export function SupportPage({ onNavigate }: SupportPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
  });

  const filteredFAQs = useMemo(() => mockFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery]);

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description || !ticketForm.category) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill in all required fields.' });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const ticketId = `TKT-${String(Date.now()).slice(-4)}`;
    toast({ variant: 'default', title: 'Ticket Created!', description: `Your support ticket ${ticketId} has been submitted.` });
    
    setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
    setIsLoading(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-amber-100 text-amber-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      case 'high': return 'text-red-600';
      case 'urgent': return 'text-red-700 font-bold';
      default: return 'text-gray-600';
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3">
              <Headphones className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Support Center</h1>
                <p className="text-muted-foreground">We're here to help you</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Submit Ticket */}
            <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Submit a New Ticket</CardTitle>
                  <CardDescription>
                    Can't find an answer in the FAQ? Our team is ready to assist you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="e.g., Issue with order #AC12345" value={ticketForm.subject} onChange={(e) => setTicketForm(prev => ({...prev, subject: e.target.value}))}/>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({...prev, category: value}))}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({...prev, priority: value}))}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Please describe your issue in detail..." className="min-h-[120px]" value={ticketForm.description} onChange={(e) => setTicketForm(prev => ({...prev, description: e.target.value}))}/>
                  </div>
                  
                  <Button onClick={handleSubmitTicket} disabled={isLoading} className="w-full">
                    {isLoading ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Right Column: My Tickets & Contact */}
            <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>My Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockTickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">{ticket.id}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>{ticket.status}</Badge>
                    </div>
                  ))}
                   <Button variant="outline" size="sm" className="w-full">View All Tickets</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Mail className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <p className="font-medium text-sm">Email Support</p>
                            <a href="mailto:info@africonnectexchange.org" className="text-sm text-muted-foreground hover:underline">info@africonnectexchange.org</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Phone className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <p className="font-medium text-sm">Phone Support</p>
                            <p className="text-sm text-muted-foreground">+44 20 1234 5678</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-2">Find quick answers to common questions.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search FAQs..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map(faq => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No FAQs match your search.</p>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
