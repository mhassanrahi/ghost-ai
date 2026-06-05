import type { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas"
import { NODE_SHAPES, NODE_COLORS } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function n(
  id: string,
  label: string,
  shape: NodeShape,
  colorIndex: number,
  x: number,
  y: number,
): CanvasNode {
  const dims = NODE_SHAPES[shape]
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, shape, color: NODE_COLORS[colorIndex].fill },
    width: dims.width,
    height: dims.height,
  }
}

function e(id: string, source: string, target: string, label?: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: label ? { label } : {},
  }
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description:
    "API Gateway routes traffic to isolated services, each backed by a dedicated database and connected via a shared message bus.",
  nodes: [
    n("ms-client",   "Client",        "pill",      1, 0,   80),
    n("ms-gw",       "API Gateway",   "rectangle", 0, 220, 80),
    n("ms-auth",     "Auth Service",  "rectangle", 2, 440, 0),
    n("ms-user",     "User Service",  "pill",      6, 440, 80),
    n("ms-order",    "Order Service", "pill",      3, 440, 180),
    n("ms-db-user",  "Users DB",      "cylinder",  7, 660, 40),
    n("ms-db-order", "Orders DB",     "cylinder",  7, 660, 180),
  ],
  edges: [
    e("ms-e1", "ms-client", "ms-gw"),
    e("ms-e2", "ms-gw",     "ms-auth"),
    e("ms-e3", "ms-gw",     "ms-user"),
    e("ms-e4", "ms-gw",     "ms-order"),
    e("ms-e5", "ms-user",   "ms-db-user"),
    e("ms-e6", "ms-order",  "ms-db-order"),
  ],
}

const cicd: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description:
    "End-to-end delivery from source commit through build, test, containerisation, and staged deployment to production.",
  nodes: [
    n("ci-dev",      "Developer",  "circle",    1, 0,    60),
    n("ci-repo",     "Git Repo",   "cylinder",  0, 160,  60),
    n("ci-server",   "CI Server",  "rectangle", 2, 330,  60),
    n("ci-tests",    "Tests",      "rectangle", 3, 510,  0),
    n("ci-build",    "Build",      "rectangle", 6, 510,  120),
    n("ci-registry", "Registry",   "cylinder",  7, 680,  120),
    n("ci-staging",  "Staging",    "pill",      3, 840,  60),
    n("ci-prod",     "Production", "pill",      4, 1010, 60),
  ],
  edges: [
    e("ci-e1", "ci-dev",      "ci-repo"),
    e("ci-e2", "ci-repo",     "ci-server"),
    e("ci-e3", "ci-server",   "ci-tests"),
    e("ci-e4", "ci-server",   "ci-build"),
    e("ci-e5", "ci-build",    "ci-registry"),
    e("ci-e6", "ci-registry", "ci-staging"),
    e("ci-e7", "ci-staging",  "ci-prod"),
  ],
}

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "Producers publish events to a central bus. Independent consumers handle emails, push notifications, analytics, and error queues.",
  nodes: [
    n("ev-pa",  "Producer A", "rectangle", 1, 0,   0),
    n("ev-pb",  "Producer B", "rectangle", 1, 0,   150),
    n("ev-bus", "Event Bus",  "hexagon",   2, 240, 60),
    n("ev-ca",  "Consumer A", "rectangle", 6, 480, 0),
    n("ev-cb",  "Consumer B", "rectangle", 6, 480, 80),
    n("ev-cc",  "Consumer C", "rectangle", 6, 480, 160),
    n("ev-db",  "Data Store", "cylinder",  7, 680, 80),
  ],
  edges: [
    e("ev-e1", "ev-pa",  "ev-bus"),
    e("ev-e2", "ev-pb",  "ev-bus"),
    e("ev-e3", "ev-bus", "ev-ca"),
    e("ev-e4", "ev-bus", "ev-cb"),
    e("ev-e5", "ev-bus", "ev-cc"),
    e("ev-e6", "ev-ca",  "ev-db"),
    e("ev-e7", "ev-cb",  "ev-db"),
    e("ev-e8", "ev-cc",  "ev-db"),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven]
