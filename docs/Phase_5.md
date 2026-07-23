# Phase 5: Extraction Agents & LangGraph Pipeline (Detailed Implementation Guide)

## 1. Overview and Core Objectives
In Phase 4, we built the tools for the AI to "think" (LLM clients and prompts). In Phase 5, we build the "workflow" using **LangGraph**. 

Processing a complex police case file requires multiple steps: extracting raw entities, deduplicating them (e.g., realizing "J. Doe" and "John Doe" in the same file are the same person), and summarizing the Modus Operandi. LangGraph allows us to build this as a state machine where different "agents" (nodes) perform specific tasks and pass the evolving data state to the next node.

The goals are:
1. Define the global State that flows through the graph.
2. Build the individual Node functions.
3. Compile the graph into an executable application.

---

## 2. Directory Structure & File Architecture

```text
Datathon/
└── backend/
    └── services/
        └── agent/
            ├── state.py         # Defines the TypedDict for Graph State
            ├── nodes.py         # The actual python functions for each agent
            └── graph.py         # Compiles the StateGraph and edges
```

---

## 3. Implementation Steps

### 3.1 Defining the Graph State (`agent/state.py`)
LangGraph requires a state object that is passed from node to node.
- Use Python's `TypedDict` from the `typing` module.
- Define `class AgentState(TypedDict):`
  - `raw_text: str` (The input case file).
  - `extracted_data: DocumentExtraction` (The Pydantic object from Phase 4).
  - `errors: list[str]` (To catch issues during processing).
  - `is_completed: bool`

### 3.2 Building the Nodes (`agent/nodes.py`)
Nodes are standard Python functions that receive the `AgentState`, perform an action, and return a dictionary containing the specific state keys they wish to update.

- **Node 1: `extraction_node(state: AgentState)`**
  - Reads `state["raw_text"]`.
  - Invokes the LLM chain built in Phase 4 using the `EXTRACTOR_SYSTEM_PROMPT`.
  - Returns `{"extracted_data": llm_response}`.

- **Node 2: `resolution_node(state: AgentState)`**
  - Reads `state["extracted_data"]`.
  - This is an advanced node that can use the LLM (or pure Python logic) to look for duplicates in the entities list (e.g., merging phone numbers attached to the same name).
  - Returns the cleaned `{"extracted_data": cleaned_data}`.

- **Node 3: `mo_summary_node(state: AgentState)`**
  - Generates a concise 2-sentence summary of the Modus Operandi (how the crime was done).
  - Appends this to the state.

### 3.3 Compiling the Graph (`agent/graph.py`)
- Import `StateGraph` and `END` from `langgraph.graph`.
- Initialize `workflow = StateGraph(AgentState)`.
- Add your nodes:
  - `workflow.add_node("extractor", extraction_node)`
  - `workflow.add_node("resolver", resolution_node)`
  - `workflow.add_node("mo_summarizer", mo_summary_node)`
- Define the edges (the flow):
  - `workflow.set_entry_point("extractor")`
  - `workflow.add_edge("extractor", "resolver")`
  - `workflow.add_edge("resolver", "mo_summarizer")`
  - `workflow.add_edge("mo_summarizer", END)`
- Compile it: `app = workflow.compile()`.

### 3.4 Integration Testing
- Write a quick `test_graph.py` script.
- Execute `app.invoke({"raw_text": "YOUR_FAKE_POLICE_REPORT_HERE"})`.
- Print the final resulting state. You should see the raw text flawlessly transformed into structured JSON, passed through 3 distinct AI steps.

---

## 4. Key Considerations
- **Conditional Edges:** While our current flow is linear, LangGraph supports conditional edges. For instance, if `extraction_node` fails due to hallucination, a conditional edge could route it back to the `extractor` node with an error message to "try again" before eventually giving up. Consider adding this robustness later.
- **Observability:** LangGraph integrates natively with LangSmith. Consider setting `LANGCHAIN_TRACING_V2=true` in your `.env` to visually trace the AI's thought process on the LangSmith dashboard.

---

## 5. Definition of Done & Verification Strategy
You know Phase 5 is complete when:
1. The `workflow.compile()` runs without type errors.
2. A raw string of text passed into the graph entry point travels through all defined nodes.
3. The final output state contains a fully populated, deduplicated, and summarized `DocumentExtraction` Pydantic object ready to be sent to our databases.
