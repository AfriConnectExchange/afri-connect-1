'use client';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { Input } from '../ui/input';
import { useEffect } from 'react';
import { Loader2, MapPin } from 'lucide-react';

interface GoogleAddressInputProps {
    onAddressSelect: (place: { description: string, place_id: string }) => void;
    initialValue?: string;
}

export function GoogleAddressInput({ onAddressSelect, initialValue }: GoogleAddressInputProps) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here */
        },
        debounce: 300,
    });

    useEffect(() => {
        if(initialValue) {
            setValue(initialValue, false);
        }
    }, [initialValue, setValue]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleSelect = ({ description, place_id }: { description: string, place_id: string }) => () => {
        setValue(description, false);
        clearSuggestions();
        onAddressSelect({ description, place_id });
    };

    const renderSuggestions = () => (
        <div className="absolute top-full mt-1 w-full bg-background border border-border rounded-md shadow-lg z-10">
            {data.map((suggestion) => {
                const {
                    place_id,
                    structured_formatting: { main_text, secondary_text },
                } = suggestion;

                return (
                    <div
                        key={place_id}
                        onClick={handleSelect(suggestion)}
                        className="p-3 hover:bg-accent cursor-pointer"
                    >
                        <p className="font-medium text-sm">{main_text}</p>
                        <p className="text-xs text-muted-foreground">{secondary_text}</p>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             {!ready && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            <Input
                value={value}
                onChange={handleInput}
                disabled={!ready}
                placeholder="Start typing your address..."
                className="pl-10"
            />
            {status === 'OK' && renderSuggestions()}
        </div>
    );
};
