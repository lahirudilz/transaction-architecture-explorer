import React from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

export function RestEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  return (
    <BaseEdge
      path={edgePath}
      style={{ stroke: '#3b82f6', strokeWidth: 2, ...style }}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{ fontSize: 11, fontWeight: 600, fill: '#1e3a8a', ...labelStyle }}
      labelBgStyle={{ fill: '#ffffff', fillOpacity: 0.95, stroke: '#bfdbfe', strokeWidth: 1, ...labelBgStyle }}
      labelBgPadding={labelBgPadding || [6, 3]}
      labelBgBorderRadius={labelBgBorderRadius || 4}
    />
  );
}

export function KafkaEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  return (
    <BaseEdge
      path={edgePath}
      style={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3', ...style }}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{ fontSize: 10, fontWeight: 600, fill: '#92400e', ...labelStyle }}
      labelBgStyle={{ fill: '#fffbeb', fillOpacity: 0.95, stroke: '#fde68a', strokeWidth: 1, ...labelBgStyle }}
      labelBgPadding={labelBgPadding || [6, 3]}
      labelBgBorderRadius={labelBgBorderRadius || 4}
    />
  );
}

export function DatabaseEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  return (
    <BaseEdge
      path={edgePath}
      style={{ stroke: '#8b5cf6', strokeWidth: 2, ...style }}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{ fontSize: 10, fontWeight: 600, fill: '#5b21b6', ...labelStyle }}
      labelBgStyle={{ fill: '#f5f3ff', fillOpacity: 0.95, stroke: '#ddd6fe', strokeWidth: 1, ...labelBgStyle }}
      labelBgPadding={labelBgPadding || [6, 3]}
      labelBgBorderRadius={labelBgBorderRadius || 4}
    />
  );
}

export function DecisionEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  return (
    <BaseEdge
      path={edgePath}
      style={{ stroke: '#64748b', strokeWidth: 2, ...style }}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{ fontSize: 10, fontWeight: 600, fill: '#334155', ...labelStyle }}
      labelBgStyle={{ fill: '#f8fafc', fillOpacity: 0.95, stroke: '#cbd5e1', strokeWidth: 1, ...labelBgStyle }}
      labelBgPadding={labelBgPadding || [6, 3]}
      labelBgBorderRadius={labelBgBorderRadius || 4}
    />
  );
}

export function ErrorEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  return (
    <BaseEdge
      path={edgePath}
      style={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4', ...style }}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{ fontSize: 10, fontWeight: 600, fill: '#991b1b', ...labelStyle }}
      labelBgStyle={{ fill: '#fef2f2', fillOpacity: 0.95, stroke: '#fecaca', strokeWidth: 1, ...labelBgStyle }}
      labelBgPadding={labelBgPadding || [6, 3]}
      labelBgBorderRadius={labelBgBorderRadius || 4}
    />
  );
}

export const edgeTypes = {
  restEdge: RestEdge,
  kafkaEdge: KafkaEdge,
  databaseEdge: DatabaseEdge,
  decisionEdge: DecisionEdge,
  errorEdge: ErrorEdge,
};
