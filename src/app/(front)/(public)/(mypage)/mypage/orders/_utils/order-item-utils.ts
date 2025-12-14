import {
  BadgeCheck,
  Banknote,
  CircleDashedIcon,
  CircleX,
  CreditCard,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

// 쿠폰 JSON 데이터 타입 정의
interface UsedCouponData {
  id: string;
  type: "percentage" | "fixed";
  amount: number;
}

// 주문 상태 정보를 반환하는 유틸리티 함수
export function getOrderStatusInfo(status: string) {
  const statusMap = {
    PAID: {
      label: "결제완료",
      style: "text-green-600",
      icon: BadgeCheck,
      pill: "bg-green-100 text-green-700 border-green-200",
    },
    CANCELED: {
      label: "취소됨",
      style: "text-red-500",
      icon: CircleX,
      pill: "bg-red-100 text-red-600 border-red-200",
    },
    REFUNDED: {
      label: "환불됨",
      style: "text-red-500",
      icon: CircleX,
      pill: "bg-red-100 text-red-600 border-red-200",
    },
    PENDING: {
      label: "결제대기",
      style: "text-gray-500",
      icon: CircleDashedIcon,
      pill: "bg-gray-100 text-gray-500 border-gray-200",
    },
    IN_PARTIAL_PROGRESS: {
      label: "분할 결제중",
      style: "text-blue-500",
      icon: CircleDashedIcon,
      pill: "bg-blue-100 text-blue-500 border-blue-200",
    },
    FAILED: {
      label: "결제실패",
      style: "text-red-500",
      icon: CircleX,
      pill: "bg-red-100 text-red-500 border-red-200",
    },
    PARTIAL_REFUNDED: {
      label: "부분 환불됨",
      style: "text-red-500",
      icon: CircleX,
      pill: "bg-red-100 text-red-500 border-red-200",
    },
    REFUND_FAILED: {
      label: "환불실패",
      style: "text-red-500",
      icon: CircleX,
      pill: "bg-red-100 text-red-500 border-red-200",
    },
    REFUND_REQUESTED: {
      label: "환불요청중",
      style: "text-blue-500",
      icon: CircleDashedIcon,
      pill: "bg-blue-100 text-blue-500 border-blue-200",
    },
  };

  return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
}

// 결제 방법 정보를 반환하는 유틸리티 함수
export function getPaymentMethodInfo(method: string) {
  const methodMap = {
    CARD: { icon: CreditCard, label: "카드" },
    VIRTUAL_ACCOUNT: { icon: Wallet, label: "가상계좌" },
    TRANSFER: { icon: Banknote, label: "계좌이체" },
    EASY_PAY: { icon: CreditCard, label: "간편결제" },
    DIRECT_DEPOSIT: { icon: Banknote, label: "직접 계좌이체" },
  };

  return methodMap[method as keyof typeof methodMap] || methodMap.CARD;
}

// 결제 상태 정보를 반환하는 유틸리티 함수
export function getPaymentStatusInfo(status: string) {
  const statusMap = {
    DONE: { label: "완료", style: "bg-green-100 text-green-700" },
    CANCELED: { label: "취소", style: "bg-red-100 text-red-600" },
    PARTIAL_CANCELED: { label: "부분 취소", style: "bg-red-100 text-red-600" },
    WAITING_FOR_DEPOSIT: {
      label: "입금대기",
      style: "bg-blue-100 text-blue-600",
    },
    ABORTED: { label: "중단", style: "bg-gray-100 text-gray-600" },
  };

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: status,
      style: "bg-gray-100 text-gray-600",
    }
  );
}

// 환불 상태 정보를 반환하는 유틸리티 함수
export function getRefundStatusInfo(status: string) {
  const statusMap = {
    DONE: { label: "환불완료", style: "bg-green-100 text-green-700" },
    PROCESSING: { label: "환불처리중", style: "bg-blue-100 text-blue-600" },
    FAILED: { label: "환불실패", style: "bg-red-100 text-red-600" },
  };

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: status,
      style: "bg-gray-100 text-gray-600",
    }
  );
}

// 쿠폰 데이터를 파싱하는 유틸리티 함수
export function parseUsedCouponData(usedCoupon: any): UsedCouponData | null {
  if (!usedCoupon) return null;

  const couponData = usedCoupon as UsedCouponData;

  if (couponData && typeof couponData === "object" && "id" in couponData) {
    return {
      id: couponData.id,
      type: couponData.type || "fixed",
      amount: couponData.amount || 0,
    };
  }

  return null;
}

// 계좌번호 복사 기능을 처리하는 유틸리티 함수
export function copyAccountNumber(accountNumber: string) {
  navigator.clipboard.writeText(accountNumber);
  toast.success("계좌번호가 복사되었습니다.");
}
