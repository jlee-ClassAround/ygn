import { Button } from "@/components/ui/button";
import {
  PaymentMethod,
  PaymentMethodItem,
} from "@/constants/payments/payment-method";
import { cn } from "@/lib/utils";

interface Props {
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (paymentMethod: PaymentMethod) => void;
  list: PaymentMethodItem[];
}

export function PaymentMethodWrapper({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  list,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {list.map((method) => {
        const isSelected = selectedPaymentMethod === method.id;
        return (
          <Button
            key={method.id}
            variant="outline"
            onClick={() => setSelectedPaymentMethod(method.id)}
            className={cn(
              "hover:bg-foreground/5 hover:text-foreground h-12 transition",
              isSelected && "ring-foreground font-semibold ring-1"
            )}
          >
            <method.Icon />
            {method.name}
          </Button>
        );
      })}
    </div>
  );
}
