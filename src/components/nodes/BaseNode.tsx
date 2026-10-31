import React from 'react';
import { Handle, Position } from '@xyflow/react';

export interface BaseNodeData {
  label: string;
  description: string;
  nodeType: string;
  group: string;
  serviceId?: string;
  metadata: Record<string, string>;
  validationStatus: string;
  [key: string]: unknown;
}

interface BaseNodeProps {
  nodeType: string;
  typeLabel: string;
  icon: React.ReactNode;
  data: BaseNodeData;
  selected?: boolean;
  customClass?: string;
}

export function BaseNode({
  nodeType,
  typeLabel,
  icon,
  data,
  selected,
  customClass = '',
}: BaseNodeProps) {
  const metadataEntries = Object.entries(data.metadata || {});

  return (
    <div className={`arch-node ${nodeType} ${customClass} ${selected ? 'selected' : ''}`}>
      {/* ── Input Handles (Target) ── */}
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Right} id="target-right" />
      {/* Legacy alias support */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right-target" />

      {/* ── Output Handles (Source) ── */}
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Right} id="source-right" />
      {/* Legacy alias support */}
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="source" position={Position.Right} id="right" />

      {/* ── Top Category Bar ── */}
      <div className="arch-node-topbar">
        <span className="arch-node-type-label">{typeLabel}</span>
        <span className="arch-node-group-label">{data.group}</span>
      </div>

      {/* ── Body ── */}
      <div className="arch-node-body">
        <div className="arch-node-title-row">
          <div className="arch-node-icon-box">{icon}</div>
          <div className="arch-node-name">{data.label}</div>
        </div>

        {data.description && (
          <div className="arch-node-desc-text">{data.description}</div>
        )}

        {/* ── Metadata Badges ── */}
        {metadataEntries.length > 0 && (
          <div className="arch-node-tags-row">
            {metadataEntries.map(([k, v]) => (
              <div key={k} className="arch-node-badge-item" title={`${k}: ${v}`}>
                <span className="badge-key">{k}:</span>
                <span className="badge-value">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
