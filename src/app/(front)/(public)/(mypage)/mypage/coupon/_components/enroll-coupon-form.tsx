"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(6, "쿠폰번호를 입력해주세요."),
});

export function EnrollCouponForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setIsLoading(true);
      await axios.post(`/api/coupons/enroll`, values);
      form.reset();
      toast.success("쿠폰 등록에 성공했어요!");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.response?.data || "쿠폰 등록에 실패했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-x-1"
      >
        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="쿠폰 코드를 입력하세요."
                  {...field}
                  className="bg-foreground/10 h-10"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={isLoading || isSubmitting || !isValid}
          className="h-10 border"
        >
          쿠폰 등록
        </Button>
      </form>
    </Form>
  );
}
