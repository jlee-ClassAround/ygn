interface Props {
  productPrice: number;
  amount: number;
  remainingAmount: number;
}

export default function AmountInfo({
  productPrice,
  amount,
  remainingAmount,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 text-sm text-foreground/50">
      <div className="border rounded-lg p-2 text-center">
        <div className="text-sm">총 결제금액</div>
        <div className="font-semibold">{productPrice.toLocaleString()}원</div>
      </div>
      <div className="border rounded-lg p-2 text-center">
        <div className="text-sm">지금까지 결제한 금액</div>
        <div className="font-semibold">
          {(productPrice - remainingAmount).toLocaleString()}원
        </div>
      </div>
      <div className="border rounded-lg p-2 text-center col-span-2 md:col-span-1">
        <div className="text-sm">남은 결제금액</div>
        <div className="font-semibold text-foreground">
          {remainingAmount.toLocaleString()}원
        </div>
      </div>
    </div>
  );
}
