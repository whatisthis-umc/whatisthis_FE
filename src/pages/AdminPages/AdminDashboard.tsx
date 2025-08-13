// src/pages/AdminPages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import { getAdminDash, type AdminDashResult } from "../../api/adminDash";

function StatCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ml-[450px] mt-[20px] rounded-[24px] border border-[#E6E6E6] p-6 w-[320px] h-[170px] flex flex-col ">
      <div className="text-[20px] font-bold text-[#333333] leading-[150%] tracking-[-0.02em]">
        {title}
      </div>
      <div className="mt-2 h-[2px] w-full bg-[#333333]" /> 
      <div className="mt-5 flex flex-col gap-5 flex-grow">{children}</div>
    </div>
  );
}

function Row({ label, value, withDivider = false, }: { label: string; value: number | string; withDivider?: boolean; }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[18px] font-semibold text-[#333333] leading-[150%]">
        {label}
      </span>
      <span className="text-[18px] font-medium text-[#333333] leading-[150%]">
        {value}
      </span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminDash();
        setData(res);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      
      <div
  className="
    pt-6 pl-6
    grid gap-6
    w-fit                      /* 컨테이너를 내용 크기만큼 */
    [grid-template-columns:repeat(2,320px)]  /* 320px짜리 2칸 고정 */
  "
>
        <StatCard title="신고">
          <Row label="미처리" value={data?.reports.unprocessedCount ?? "-"} />
        </StatCard>

        <StatCard title="문의">
          <Row label="미답변" value={data?.inquiries.unansweredCount ?? "-"} />
        </StatCard>

        <StatCard title="사용자 현황">
          <div className="mt-[-20px] h-[2px] w-full bg-[#333333]" /> 
          <Row label="총 사용자 수" value={data?.userStats.totalUserCount ?? "-"} />
          <Row label="오늘 가입" value={data?.userStats.todaySignupCount ?? "-"} />
        </StatCard>

        <StatCard title="콘텐츠 통계">
          <div className="mt-[-20px] h-[2px] w-full bg-[#333333]" /> 
          <Row label="게시글" value={data?.contentStats.postCount ?? "-"} />
          <Row label="댓글" value={data?.contentStats.commentCount ?? "-"} />
        </StatCard>
      </div>
    </AdminLayout>
  );
}
