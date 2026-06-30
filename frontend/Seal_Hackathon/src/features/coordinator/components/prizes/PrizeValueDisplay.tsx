type PrizeValueDisplayProps = {
  value?: number;
  currency?: string;
};

export const PrizeValueDisplay = ({ value, currency }: PrizeValueDisplayProps) => {
  if (value === undefined || value === null || value <= 0) {
    return <span className="text-gray-400 italic text-sm">No value</span>;
  }
  
  return (
    <span className="font-semibold text-green-700">
      {value.toLocaleString()} {currency}
    </span>
  );
};
