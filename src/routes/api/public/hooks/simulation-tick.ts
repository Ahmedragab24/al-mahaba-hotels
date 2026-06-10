import { createFileRoute } from "@tanstack/react-router";
import { runSimulationTick } from "@/lib/simulation-engine.server";

export const Route = createFileRoute("/api/public/hooks/simulation-tick")({
  server: {
    handlers: {
      POST: async () => {
        const result = await runSimulationTick();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
      GET: async () => {
        const result = await runSimulationTick();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
