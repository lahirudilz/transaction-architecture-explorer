import React from 'react';
import { Server, Database, Radio, Globe, ExternalLink, ShieldCheck, ArrowRight, Code } from 'lucide-react';
import { services } from '@/data/services';

export function MicroservicesPage() {
  return (
    <div className="page-container app-content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="validation-badge confirmed">Microservice Registry</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Fintech Core</span>
          </div>
          <h1 className="page-title">Microservices Catalog</h1>
          <p className="page-subtitle">
            Generic microservices participating in customer transaction processing and ledger operations.
          </p>
        </div>
      </div>

      <div className="card-grid">
        {services.map((svc) => (
          <div key={svc.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#f0f9ff',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Server size={16} />
                </div>
                <div>
                  <h3 className="card-title" style={{ fontSize: '14px' }}>{svc.name}</h3>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>{svc.id}</span>
                </div>
              </div>
              <span className={`validation-badge ${svc.validationStatus}`} style={{ fontSize: '9px' }}>
                {svc.validationStatus === 'confirmed' ? 'Confirmed' : 'Needs Validation'}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '14px', lineHeight: 1.4 }}>
              {svc.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', marginTop: 'auto' }}>
              <div className="details-field">
                <span className="details-field-label">Business Responsibility</span>
                <span className="details-field-value" style={{ fontSize: '11px' }}>
                  {svc.businessResponsibility}
                </span>
              </div>

              <div className="details-field">
                <span className="details-field-label">Exposed APIs</span>
                {svc.apisExposed.length > 0 ? (
                  svc.apisExposed.map((api) => (
                    <span key={api.id} className="details-field-value mono">
                      {api.method} {api.endpoint}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>None (Internal event/orchestration)</span>
                )}
              </div>

              <div className="details-field">
                <span className="details-field-label">Kafka Messaging</span>
                <div className="details-tag-list">
                  {svc.kafkaTopicsProduced.map((t, idx) => (
                    <span key={idx} className="details-tag" style={{ background: '#fffbeb', color: '#b45309' }}>
                      Pub: {t}
                    </span>
                  ))}
                  {svc.kafkaTopicsConsumed.map((t, idx) => (
                    <span key={idx} className="details-tag" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      Sub: {t}
                    </span>
                  ))}
                  {svc.kafkaTopicsProduced.length === 0 && svc.kafkaTopicsConsumed.length === 0 && (
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No Kafka topics</span>
                  )}
                </div>
              </div>

              <div className="details-field">
                <span className="details-field-label">Databases</span>
                {svc.databaseInteractions.map((db, idx) => (
                  <span key={idx} className="details-field-value mono" style={{ fontSize: '10px' }}>
                    {db}
                  </span>
                ))}
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
                <span className="details-link" style={{ fontSize: '11px' }}>
                  <ExternalLink size={11} />
                  <span>Diagram Ref</span>
                </span>
                <span className="details-link" style={{ fontSize: '11px' }}>
                  <Code size={11} />
                  <span>Repository</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
