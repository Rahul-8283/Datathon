from langgraph.graph import StateGraph, END
try:
    from services.agent.state import AgentState
    from services.agent.nodes import extraction_node, resolution_node, mo_summary_node
except ImportError:
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from services.agent.state import AgentState
    from services.agent.nodes import extraction_node, resolution_node, mo_summary_node

# Initialize the state graph
workflow = StateGraph(AgentState)

# Add nodes to the graph
workflow.add_node("extractor", extraction_node)
workflow.add_node("resolver", resolution_node)
workflow.add_node("mo_summarizer", mo_summary_node)

# Define the flow (edges)
workflow.set_entry_point("extractor")
workflow.add_edge("extractor", "resolver")
workflow.add_edge("resolver", "mo_summarizer")
workflow.add_edge("mo_summarizer", END)

# Compile the graph into an executable application
app = workflow.compile()
