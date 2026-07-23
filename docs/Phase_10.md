# Phase 10: Advanced Visualizations & Dashboard Polish (Detailed Implementation Guide)

## 1. Overview and Core Objectives
In the final phase, we bring the immense backend power we've built (AI extraction, Graph relationships, Vector search, and Predictive ML) to life on the screen. 

A policing dashboard must be highly responsive, data-dense but not overwhelming, and visually striking (premium dark theme, glassmorphism). We will use specialized React libraries to render the map, the network, and the charts.

The goals are:
1. Integrate interactive Geospatial maps (Leaflet).
2. Integrate the dynamic physics-based network graph (React Force Graph).
3. Integrate statistical charting (Recharts).
4. Perform final state management, error handling, and UI polishing.

---

## 2. Directory Structure & File Architecture
All work in this phase occurs in the frontend React application.

```text
Datathon/
└── frontend/
    └── src/
        ├── components/
        │   ├── Visuals/
        │   │   ├── MapView.tsx      # Leaflet integration
        │   │   ├── NetworkGraph.tsx # ForceGraph2D integration
        │   │   └── TrendChart.tsx   # Recharts integration
        │   └── UI/
        │       ├── Sidebar.tsx
        │       └── Loader.tsx       # Loading spinners/skeletons
        └── pages/
            └── Dashboard.tsx        # The main grid layout assembling components
```

---

## 3. Implementation Steps

### 3.1 Geospatial Mapping (`MapView.tsx`)
- Import `MapContainer`, `TileLayer`, and `Marker` from `react-leaflet`.
- Use a dark-mode tile layer (e.g., CartoDB Dark Matter) to fit the aesthetic.
- Fetch case data containing latitudes and longitudes from the backend.
- Render markers. For high density, implement a Heatmap layer (using `leaflet.heat` or clustering plugins) so the map shows red hotspots rather than thousands of overlapping pins.

### 3.2 Network Link Analysis (`NetworkGraph.tsx`)
- Import `ForceGraph2D` from `react-force-graph-2d`.
- Fetch the `nodes` and `links` JSON from your `/api/v1/graph/network` endpoint.
- Pass them as props: `<ForceGraph2D graphData={data} />`.
- **Interactivity:**
  - `nodeAutoColorBy="entity_type"`: Color suspects red, phones blue, vehicles green automatically.
  - `onNodeClick`: When an officer clicks a suspect node, slide out a side-panel displaying that suspect's profile and associated FIR numbers.

### 3.3 Predictive Charting (`TrendChart.tsx`)
- Import `LineChart`, `XAxis`, `YAxis`, `Tooltip` from `recharts`.
- Fetch the Prophet forecast data from `/api/v1/ml/forecast`.
- Plot the historical data as a solid line, and the forecasted `yhat` data as a dashed line. Include the confidence intervals (`yhat_lower`, `yhat_upper`) as a shaded `Area` behind the line.

### 3.4 Assembly and UI Polish
- **Layout:** Use Tailwind CSS Grid to assemble these components on `Dashboard.tsx`. Create a "Command Center" layout with the map taking center stage, the ticker feed on the right, and charts on the bottom.
- **Glassmorphism:** Apply Tailwind classes like `bg-gray-900/50 backdrop-blur-md border border-gray-700` to your cards to give them a modern, translucent, premium feel.
- **Loading States:** Wrap data-fetching components in skeletons or spinners. If the Neo4j graph takes 2 seconds to load, the user should see a pulsing "Analyzing Network..." overlay.
- **Global State:** Ensure Zustand is holding filters (e.g., if the user selects "Bangalore" in a global dropdown, the Map, Graph, and Charts should all re-fetch their data filtered by that district).

---

## 4. Key Considerations
- **Performance:** Rendering 5,000 nodes in ForceGraph or 10,000 pins in Leaflet will drop browser framerates. Always implement data caps or server-side clustering.
- **Responsiveness:** Ensure the dashboard flexes correctly on smaller laptop screens, even if it's primarily designed for large command-center monitors.

---

## 5. Definition of Done & Verification Strategy
You know Phase 10 (and the project) is complete when:
1. You can log into the dashboard and see a beautifully rendered dark-themed UI.
2. The map displays case locations correctly and pans smoothly.
3. The network graph is bouncy, draggable, and responds to clicks.
4. The Prophet forecasting charts render accurately.
5. You can upload a new CSV file, wait for Celery/LangGraph to finish, and watch the Map, Graph, and Charts dynamically update with the newly ingested intelligence.
