'use client';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Handshake } from "lucide-react";
import type { BarterFormData } from "../BarterProposalForm";

interface BarterStep2Props {
    formData: BarterFormData;
    onInputChange: (field: keyof BarterFormData, value: string) => void;
    errors: Partial<Record<keyof BarterFormData, string>>;
}

export function BarterStep2_ExchangeDetails({ formData, onInputChange, errors }: BarterStep2Props) {
  return (
    <div className="space-y-6">
        <div>
            <Label htmlFor="exchangeLocation">Preferred Exchange Location</Label>
            <Select value={formData.exchangeLocation} onValueChange={(value) => onInputChange('exchangeLocation', value as BarterFormData['exchangeLocation'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="seller_location">Seller's preferred location</SelectItem>
                <SelectItem value="buyer_location">My location</SelectItem>
                <SelectItem value="mutual_location">Mutually agreed location</SelectItem>
                <SelectItem value="shipping">Ship to each other</SelectItem>
              </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="proposalExpiry">Proposal Valid For</Label>
            <Select value={formData.proposalExpiry} onValueChange={(value) => onInputChange('proposalExpiry', value as BarterFormData['proposalExpiry'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
              </SelectContent>
            </Select>
            {errors.proposalExpiry && <p className="text-destructive text-sm mt-1">{errors.proposalExpiry}</p>}
        </div>
        <div>
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea id="additionalNotes" placeholder="Any additional info, special requests, or terms..." value={formData.additionalNotes} onChange={(e) => onInputChange('additionalNotes', e.target.value)} rows={3} />
        </div>
         <Alert>
          <Handshake className="h-4 w-4" />
          <AlertTitle>Barter Guidelines</AlertTitle>
          <AlertDescription>
            If accepted, you'll need to coordinate the exchange. AfriConnect does not handle the physical trade.
          </AlertDescription>
        </Alert>
    </div>
  );
}
