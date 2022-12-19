import _ from "lodash";
import React, { useState } from "react";
import "./App.css";

type ElementProps = {
  id: string;
  hoveredElementId: string;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
};

function Element(props: ElementProps) {
  const isHovered = props.hoveredElementId === props.id;

  return (
    <div
      style={{ marginBottom: 8, backgroundColor: isHovered ? "#eee" : "" }}
      onMouseEnter={() => {
        props.onMouseEnter(props.id);
      }}
      onMouseLeave={() => {
        props.onMouseLeave(props.id);
      }}
    >
      div
    </div>
  );
}

const MemoedElement = React.memo(Element, (prevProps, nextProps) => {
  const { hoveredElementId: oldHoveredElementId, ...oldProps } = prevProps;
  const { hoveredElementId: newHoveredElementId, ...newProps } = nextProps;

  if (oldHoveredElementId === nextProps.id) {
    return false;
  }
  if (newHoveredElementId === nextProps.id) {
    return false;
  }
  return _.isEqual(oldProps, newProps);
});

function App() {
  const [hoveredElementId, setHoveredElementId] = useState("");

  const handleMouseEnter = (id: string) => {
    setHoveredElementId(id);
  };

  const handleMouseLeave = (id: string) => {
    if (id === hoveredElementId) {
      setHoveredElementId("");
    }
  };

  const elements = [];

  for (let i = 0; i < 500; i++) {
    elements.push(
      <MemoedElement
        key={i}
        id={String(i)}
        hoveredElementId={hoveredElementId}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  return <>{elements}</>;
}

export default App;
