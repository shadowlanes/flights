import { useParams } from "react-router";

export default function FlightDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
        Flight Details
      </h1>
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Flight detail view for {id} coming soon
        </p>
      </div>
    </div>
  );
}
