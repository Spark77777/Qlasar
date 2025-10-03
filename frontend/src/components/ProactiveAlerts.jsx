export default function ProactiveAlerts() {
  const alerts = [
    { title: "AI in Healthcare", desc: "AI use in healthcare is growing with new diagnostic tools." },
    { title: "AI Trends", desc: "Generative AI is driving advancements in creativity." },
    { title: "Quantum Computing", desc: "Research is accelerating with new breakthroughs." },
  ];

  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg mb-4">Proactive Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div key={idx} className="p-3 border rounded shadow-sm hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium">{alert.title}</h3>
            <p className="text-sm text-gray-600">{alert.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
