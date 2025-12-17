import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [countryCode, setCountryCode] = React.useState("+234");
    const [phoneNumber, setPhoneNumber] = React.useState("");

    React.useEffect(() => {
      // Parse existing value
      if (value) {
        if (value.startsWith("+234")) {
          setCountryCode("+234");
          setPhoneNumber(value.substring(4).trim());
        } else {
          setPhoneNumber(value.replace(/\D/g, "").substring(0, 11));
        }
      }
    }, [value]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/\D/g, ""); // Remove non-digits
      const limited = input.substring(0, 11); // Limit to 11 digits
      setPhoneNumber(limited);
      onChange(`${countryCode}${limited}`);
    };

    return (
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={setCountryCode} disabled>
          <SelectTrigger className={cn("w-[120px]", className)}>
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇳🇬</span>
                <span>+234</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+234">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇳🇬</span>
                <span>Nigeria (+234)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          type="tel"
          placeholder="08031234567"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className={cn("flex-1", className)}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
