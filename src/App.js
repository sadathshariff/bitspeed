import "./App.css";
import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";

import "reactflow/dist/style.css";

const NodePanel = () => {
  const addNode = (event, data) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(data));
  };

  return (
    <div className="settings-panel">
      <div
        className="node"
        draggable
        onDragStart={(event) => addNode(event, { label: "Text Node" })}
      >
        Text Node
      </div>
    </div>
  );
};

const initialNodes = [
  { id: "1", position: { x: 100, y: 250 }, data: { label: "Send Message" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const [editedText, setEditedText] = useState("");
  const yPos = useRef(0);
  const handleTextChange = (event) => {
    setEditedText(event.target.value);
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.target.getBoundingClientRect();
      const xPositon = event.clientX - reactFlowBounds.left;
      const yPositon = event.clientY - reactFlowBounds.top;
      addNode(xPositon, yPositon);
    },
    [nodes]
  );

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const addNode = (x, y) => {
    yPos.current = 0;
    const newNodeId = `${nodes.length + 1}`;
    const newNode = {
      id: newNodeId,
      position: { x, y },
      data: { label: "New Text Node" },
      style: { width: 150 },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const handleSave = () => {
    if (isEditing && selectedNode) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, label: editedText } }
            : node
        )
      );
      setIsEditing(false);
    } else {
      const nodesWithoutInitial = nodes.filter(
        (node) => node.id !== initialNodes[0].id
      );
      const nodesWithEmptyTargets = nodesWithoutInitial.filter(
        (node) => !edges.find((edge) => edge.target === node.id)
      );

      if (
        nodesWithEmptyTargets.length > 1 ||
        (nodesWithEmptyTargets.length === 1 && nodes.length > 1)
      ) {
        alert("Error: Cannot Save flow");
      }
    }
  };

  return (
    <div className="App">
      <nav>
        <button onClick={handleSave}>Save Changes</button>
      </nav>
      <div className="container">
        <div
          className="container_chatflow"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(event, node) => {
              setIsEditing(true);
              setSelectedNode(node);
              setEditedText(node?.data?.label);
            }}
          >
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>

        <div className="node-panel">
          <h2>Side pannel</h2>

          {isEditing ? (
            <div className="settings-panel">
              {/* Settings panel for selected node */}
              <h2>Edit Node Text</h2>
              <input
                type="text"
                value={editedText}
                onChange={handleTextChange}
              />
            </div>
          ) : (
            <>
              <NodePanel />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
