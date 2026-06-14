type props = {
  title: string;
  value: string | number;
};

export const AnalyticsCard = ({ title, value }: props) => {
  return (
    <div className="rounded-lg border bg-amber-300 p-6 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>

      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
};
