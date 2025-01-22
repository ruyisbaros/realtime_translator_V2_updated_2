from langgraph.graph import Graph
from langgraph.prebuilt import ToolNode


# Define transcription graph
def build_transcription_graph(llm):
    graph = Graph()

    # Input Node (Receives Audio)
    input_node = graph.create_node(name="audio_input")

    # LLM Node for Transcription
    transcribe_node = graph.create_node(
        name="transcription",
        node_type=ToolNode,
        config={
            "llm": llm,
            "input_key": "audio",  # Key for audio input
            "output_key": "text",  # Key for transcription output
        }
    )

    # Connect Input to LLM
    graph.connect(input_node, transcribe_node)

    return graph
