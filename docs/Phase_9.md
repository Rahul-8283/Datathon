# Phase 9: Advanced Frontend Visualizations (Geospatial & Network)

## Objective
Build the highly interactive visual components in the React frontend to consume the complex data from the backend APIs.

## Key Tasks
1. **Network Link Analysis (React Force Graph 2D):**
   - Fetch data from `/api/graph/network`.
   - Implement the `ForceGraph2D` component to render nodes (suspects/phones) and edges.
   - Add interaction: Hover effects, clicking a node to view profile details, and dragging physics.
2. **Geospatial Mapping (Leaflet):**
   - Integrate `react-leaflet`.
   - Plot crime incidents as map markers or heatmaps based on latitude/longitude.
   - Implement a time-slider component to dynamically filter the map data (spatiotemporal analysis).
3. **Predictive Charts (Recharts):**
   - Build line charts and bar graphs to display the Prophet forecasting data.

## Deliverables
- The core visual heavy-lifters of the application are integrated and rendering real backend data.
