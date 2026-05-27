import { NextResponse } from "next/server";
import { syncCalendlyEventsAction } from "@/app/calendly/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = body?.events;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Payload inválido. Se requiere { events: [] }." },
        { status: 400 }
      );
    }

    const result = await syncCalendlyEventsAction(events);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

