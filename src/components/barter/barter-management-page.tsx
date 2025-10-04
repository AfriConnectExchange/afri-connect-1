'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Handshake, Repeat, Check, X, Package, ArrowRight, Loader2, Info } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { ConfirmationModal } from '../ui/confirmation-modal';
import { useUser } from '@/firebase';

interface BarterProposal {
    id: string;
    proposer_id: string;
    recipient_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    proposer_product: { title: string, images: string[] };
    recipient_product: { title: string, images: string[] };
    proposer: { full_name: string };
    recipient: { full_name: string };
}

function ProposalSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <Skeleton className="h-24 w-24 rounded-lg" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-24 w-24 rounded-lg" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-8 w-24" />
                             <Skeleton className="h-8 w-24" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export function BarterManagementPage() {
    const [proposals, setProposals] = useState<BarterProposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const { user } = useUser();
    const [showConfirmModal, setShowConfirmModal] = useState<{ proposal: BarterProposal; action: 'accepted' | 'rejected' } | null>(null);
    const [isResponding, setIsResponding] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        if (!user) return;

        const fetchProposals = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/barter/list?type=${activeTab}`);
                if (!res.ok) throw new Error('Failed to fetch proposals.');
                const data = await res.json();
                setProposals(data.proposals);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProposals();
    }, [activeTab, user, toast]);

    const handleRespond = (proposal: BarterProposal, action: 'accepted' | 'rejected') => {
        setShowConfirmModal({ proposal, action });
    };
    
    const confirmResponse = async () => {
        if (!showConfirmModal) return;

        setIsResponding(true);
        const { proposal, action } = showConfirmModal;

        try {
            const response = await fetch('/api/barter/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposal_id: proposal.id, action }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Failed to ${action} proposal.`);
            
            toast({ title: 'Success', description: `Proposal has been ${action}.` });
            
            setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: action } : p));

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsResponding(false);
            setShowConfirmModal(null);
        }
    };

    const ProposalCard = ({ proposal }: { proposal: BarterProposal }) => {
        const isReceived = proposal.recipient_id === user?.uid;
        const myItem = isReceived ? proposal.recipient_product : proposal.proposer_product;
        const theirItem = isReceived ? proposal.proposer_product : proposal.recipient_product;
        const theirName = isReceived ? proposal.proposer.full_name : proposal.recipient.full_name;

        return (
            <Card className="flex flex-col">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-base">Trade with {theirName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(proposal.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={proposal.status === 'pending' ? 'secondary' : proposal.status === 'accepted' ? 'default' : 'destructive'} className="capitalize">{proposal.status}</Badge>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                    <div className="flex items-center justify-around text-center gap-2">
                        <div className="w-2/5">
                            <p className="text-xs text-muted-foreground mb-1">Your Item</p>
                            <Image src={myItem.images?.[0] || 'https://placehold.co/100x100'} alt={myItem.title} width={100} height={100} className="rounded-md object-cover aspect-square mx-auto" />
                            <p className="text-sm font-medium mt-2 line-clamp-2">{myItem.title}</p>
                        </div>
                        <Repeat className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div className="w-2/5">
                            <p className="text-xs text-muted-foreground mb-1">Their Offer</p>
                            <Image src={theirItem.images?.[0] || 'https://placehold.co/100x100'} alt={theirItem.title} width={100} height={100} className="rounded-md object-cover aspect-square mx-auto" />
                            <p className="text-sm font-medium mt-2 line-clamp-2">{theirItem.title}</p>
                        </div>
                    </div>
                    {isReceived && proposal.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleRespond(proposal, 'accepted')}><Check className="w-4 h-4 mr-2" /> Accept</Button>
                            <Button size="sm" variant="destructive" className="w-full" onClick={() => handleRespond(proposal, 'rejected')}><X className="w-4 h-4 mr-2" /> Decline</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <CardHeader className="px-0">
                <CardTitle>Manage Barter Proposals</CardTitle>
                <CardDescription>Review proposals you've received and track the ones you've sent.</CardDescription>
            </CardHeader>
             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="received">Received Proposals</TabsTrigger>
                    <TabsTrigger value="sent">Sent Proposals</TabsTrigger>
                </TabsList>
                <TabsContent value="received" className="mt-6">
                    {isLoading ? <ProposalSkeleton /> : proposals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {proposals.map(p => <ProposalCard key={p.id} proposal={p} />)}
                        </div>
                    ) : (
                        <Card className="text-center py-12 border-dashed">
                             <Handshake className="mx-auto h-12 w-12 text-muted-foreground" />
                             <h3 className="mt-4 text-lg font-semibold">No proposals received</h3>
                             <p className="mt-2 text-sm text-muted-foreground">Proposals you receive from other users will appear here.</p>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="sent" className="mt-6">
                    {isLoading ? <ProposalSkeleton /> : proposals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {proposals.map(p => <ProposalCard key={p.id} proposal={p} />)}
                        </div>
                    ) : (
                         <Card className="text-center py-12 border-dashed">
                             <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                             <h3 className="mt-4 text-lg font-semibold">No proposals sent</h3>
                             <p className="mt-2 text-sm text-muted-foreground">Proposals you send to other users will appear here.</p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
            
            {showConfirmModal && (
                <ConfirmationModal
                    isOpen={!!showConfirmModal}
                    onClose={() => setShowConfirmModal(null)}
                    onConfirm={confirmResponse}
                    title={`Confirm ${showConfirmModal.action === 'accepted' ? 'Acceptance' : 'Rejection'}`}
                    description={`Are you sure you want to ${showConfirmModal.action} this barter proposal?`}
                    confirmText={showConfirmModal.action === 'accepted' ? 'Accept' : 'Reject'}
                    isLoading={isResponding}
                    loadingText={isResponding ? 'Processing...' : ''}
                    type={showConfirmModal.action === 'accepted' ? 'default' : 'destructive'}
                    icon={showConfirmModal.action === 'accepted' ? <Check /> : <X />}
                />
            )}
        </div>
    );
}
