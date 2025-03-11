export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 p-3 border rounded-lg shadow-md">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {entry.name === "revenue" ? "Revenue: ₹" : `${entry.name}: `}
            {entry.name === "revenue" 
              ? entry.value.toLocaleString()
              : entry.name === "avgDuration"
                ? `${Math.round(entry.value)} mins`
                : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};