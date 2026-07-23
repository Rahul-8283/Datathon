# Product Requirements Document (PRD)
## AI-Driven Crime Analytics & Visualization Platform

### 1. Product Overview & Vision
**Product Name:** KSP Crime Intelligence & Analytical Platform
**Vision:** To transform static, fragmented, and siloed crime records maintained by the Karnataka State Police (KSP) and State Crime Records Bureau (SCRB) into a state-of-the-art, proactive Strategic Intelligence Hub.
**Goal:** Empower law enforcement with AI-driven analytics to identify emerging crime trends, map complex criminal syndicates, and transition from reactive policing to proactive, predictive crime prevention.

### 2. Target Audience
*   **Investigative Officers:** Require deep-dive analytics into specific cases, suspect associations, and Modus Operandi (MO) matching.
*   **Intelligence Analysts (SCRB):** Need state-wide and district-level spatiotemporal heatmaps, forecasting, and socioeconomic correlations.
*   **Police Leadership / DGP Level:** Need high-level executive dashboards showing crime rates, anomaly alerts, and resource allocation metrics.

### 3. Core Features & Requirements

#### 3.1 Multi-Agent Automated Data Ingestion
*   **Requirement:** The system must ingest raw, unstructured text (Police Diaries, FIRs) and structured data (CSV/Excel).
*   **Functionality:** Utilize a LangGraph-based AI pipeline to automatically extract entities (suspects, victims, locations, vehicles) and resolve duplicate entities across different case files.
*   **Benefit:** Eliminates manual data entry and bridges information silos.

#### 3.2 Geospatial & Spatiotemporal Visualization
*   **Requirement:** An interactive map interface for analyzing crime locations.
*   **Functionality:** 
    *   Choropleth mapping for district-level crime densities.
    *   Dynamic heatmaps filtering by time-of-day and day-of-week.
    *   Red-pulsing anomaly alerts for sudden spikes in local crime rates against historical averages.

#### 3.3 Criminological Link Analysis (Network Graph)
*   **Requirement:** Visualizing complex relationships between criminal entities.
*   **Functionality:** 
    *   Draggable, physics-based network graph displaying connections (e.g., co-conspirators, shared vehicles, communication).
    *   "Shortest Path" tool to instantly find the link between two suspects.
    *   Algorithmic identification of network "ring-leaders" (Centrality/PageRank).

#### 3.4 AI Predictive Forecasting & Behavioral Clustering
*   **Requirement:** Anticipating future crimes based on historical data.
*   **Functionality:** 
    *   12-month future crime volume forecasting per district (using time-series models).
    *   Anomaly detection to flag highly unusual crimes (potential serial offenders).
    *   Semantic search across Modus Operandi (MO) notes to cluster similar unsolved cases.

### 4. User Flow & Dashboard Interface
The web interface will feature a dark-themed, premium HUD console with the following tabs:
1.  **Command Center:** Live ticker, summary metrics, and active threat alerts.
2.  **Geospatial Analytics:** Full-screen Leaflet map with time-slider and demographic overlays.
3.  **Network Analysis:** Full-screen interactive entity relationship graph.
4.  **AI Predictions:** Charts for forecasting and MO cluster lists.
5.  **Case Ledger:** Searchable, filterable tabular view of all ingested records with a manual upload portal.

### 5. Success Metrics
*   **Ingestion Speed:** 90%+ reduction in time spent manually linking records.
*   **Accuracy:** High precision in entity extraction and deduplication.
*   **Uptime & Responsiveness:** Dashboard loads under 2 seconds, handling complex graph queries via Neo4j efficiently.
*   **Predictive Value:** Positive correlation between platform anomaly alerts and subsequent investigations.
