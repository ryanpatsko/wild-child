import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  bridalContentSignature,
  createDefaultBridalContent,
  loadBridalContent,
  sanitizeBridalContentForSave,
} from '../../content/bridalContent';
import { saveBridalContent } from '../../lib/cmsApi';
import { getStoredSessionToken } from '../../lib/adminAuth';

const BRIDAL_PAGES = ['overview', 'services', 'pittsburgh', 'atlanta'];

const PAGE_LABELS = {
  overview: 'Overview',
  services: 'Services',
  pittsburgh: 'Pittsburgh',
  atlanta: 'Atlanta',
};

function SaveFeedback() {
  return (
    <span className="admin-save-feedback" role="status" aria-live="polite">
      <svg
        className="admin-save-check"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Saved
    </span>
  );
}

function SubTabs({ active, onSelect }) {
  return (
    <div className="admin-bridal-subtabs" role="tablist" aria-label="Bridal CMS sections">
      {BRIDAL_PAGES.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`admin-bridal-subtab ${active === id ? 'admin-bridal-subtab-active' : ''}`}
          onClick={() => onSelect(id)}
        >
          {PAGE_LABELS[id]}
        </button>
      ))}
    </div>
  );
}

export default function BridalEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const bridalPageRaw = searchParams.get('bridalPage');
  const bridalPage = BRIDAL_PAGES.includes(bridalPageRaw) ? bridalPageRaw : 'overview';

  function selectBridalPage(id) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', 'bridal');
    next.set('bridalPage', id);
    router.replace(`${pathname}?${next.toString()}`);
  }

  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [savedVersion, setSavedVersion] = useState(1);
  const [draft, setDraft] = useState(() => createDefaultBridalContent());
  const [baselineSig, setBaselineSig] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentSig = useMemo(() => bridalContentSignature(draft), [draft]);
  const isDirty = useMemo(() => baselineSig !== null && currentSig !== baselineSig, [currentSig, baselineSig]);

  useEffect(() => {
    if (isDirty) setSaveSucceeded(false);
  }, [isDirty]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await loadBridalContent();
        if (cancelled) return;
        setSavedVersion(data.version);
        setDraft(data);
        setBaselineSig(bridalContentSignature(data));
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        const def = createDefaultBridalContent();
        setSavedVersion(def.version);
        setDraft(def);
        setBaselineSig(bridalContentSignature(def));
        setLoadError(
          e instanceof Error
            ? `${e.message} Using default copy until bridal-content.json is in S3 or the URL is correct.`
            : 'Could not load from S3. Using default copy.',
        );
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setSaveError(null);
    setSaveSucceeded(false);
    const token = getStoredSessionToken();
    if (!token) {
      setSaveError('Not signed in.');
      return;
    }
    const nextVersion = savedVersion + 1;
    const doc = sanitizeBridalContentForSave({ ...draft, version: nextVersion });
    setSaving(true);
    try {
      const result = await saveBridalContent(token, doc);
      if (result.ok) {
        setSavedVersion(nextVersion);
        setDraft(doc);
        setBaselineSig(bridalContentSignature(doc));
        setSaveSucceeded(true);
      } else {
        setSaveError(result.message);
      }
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading bridal content…
      </p>
    );
  }

  const ov = draft.overview;
  const sv = draft.services;
  const pt = draft.pittsburgh;
  const at = draft.atlanta;

  return (
    <form className="admin-bridal-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">Bridal</h3>
      <p className="admin-muted">Edit all content on the /bridal tab here</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <SubTabs active={bridalPage} onSelect={selectBridalPage} />

      {bridalPage === 'overview' ? (
        <div className="admin-bridal-panel">
          <h4 className="admin-subheading">Overview (/bridal)</h4>
          <label className="admin-label" htmlFor="be-ov-doctitle">
            Browser tab title
          </label>
          <input
            id="be-ov-doctitle"
            className="admin-input admin-input-full"
            value={ov.documentTitle}
            onChange={(e) =>
              setDraft((d) => ({ ...d, overview: { ...d.overview, documentTitle: e.target.value } }))
            }
            maxLength={500}
          />
          <label className="admin-label" htmlFor="be-ov-meta">
            Meta description
          </label>
          <textarea
            id="be-ov-meta"
            className="admin-textarea"
            rows={3}
            value={ov.metaDescription}
            onChange={(e) =>
              setDraft((d) => ({ ...d, overview: { ...d.overview, metaDescription: e.target.value } }))
            }
            maxLength={2000}
          />
          <label className="admin-label" htmlFor="be-ov-h1">
            Page header (H1)
          </label>
          <input
            id="be-ov-h1"
            className="admin-input admin-input-full"
            value={ov.pageHeader}
            onChange={(e) =>
              setDraft((d) => ({ ...d, overview: { ...d.overview, pageHeader: e.target.value } }))
            }
            maxLength={400}
          />
          <label className="admin-label" htmlFor="be-ov-pct">
            Package CTA — title
          </label>
          <input
            id="be-ov-pct"
            className="admin-input admin-input-full"
            value={ov.pricingCtaTitle}
            onChange={(e) =>
              setDraft((d) => ({ ...d, overview: { ...d.overview, pricingCtaTitle: e.target.value } }))
            }
            maxLength={400}
          />
          <label className="admin-label" htmlFor="be-ov-pcs">
            Package CTA — subtitle
          </label>
          <textarea
            id="be-ov-pcs"
            className="admin-textarea"
            rows={2}
            value={ov.pricingCtaSub}
            onChange={(e) =>
              setDraft((d) => ({ ...d, overview: { ...d.overview, pricingCtaSub: e.target.value } }))
            }
            maxLength={12000}
          />
          <label className="admin-label" htmlFor="be-ov-btnp">
            Pittsburgh button label
          </label>
          <input
            id="be-ov-btnp"
            className="admin-input admin-input-full"
            value={ov.pittsburghButtonLabel}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                overview: { ...d.overview, pittsburghButtonLabel: e.target.value },
              }))
            }
            maxLength={80}
          />
          <label className="admin-label" htmlFor="be-ov-btna">
            Atlanta button label
          </label>
          <input
            id="be-ov-btna"
            className="admin-input admin-input-full"
            value={ov.atlantaButtonLabel}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                overview: { ...d.overview, atlantaButtonLabel: e.target.value },
              }))
            }
            maxLength={80}
          />
          <h4 className="admin-subheading">Lead paragraphs</h4>
          {ov.leadParagraphs.map((para, i) => (
            <div key={i} className="admin-about-item">
              <div className="admin-about-item-head">
                <span className="admin-about-item-label">Paragraph {i + 1}</span>
                {ov.leadParagraphs.length > 1 ? (
                  <button
                    type="button"
                    className="admin-text-btn"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        overview: {
                          ...d.overview,
                          leadParagraphs: d.overview.leadParagraphs.filter((_, j) => j !== i),
                        },
                      }))
                    }
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <textarea
                className="admin-textarea"
                rows={4}
                value={para}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    overview: {
                      ...d.overview,
                      leadParagraphs: d.overview.leadParagraphs.map((p, j) => (j === i ? v : p)),
                    },
                  }));
                }}
                maxLength={12000}
              />
            </div>
          ))}
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                overview: {
                  ...d.overview,
                  leadParagraphs: [...d.overview.leadParagraphs, ''],
                },
              }))
            }
          >
            Add paragraph
          </button>
        </div>
      ) : null}

      {bridalPage === 'services' ? (
        <div className="admin-bridal-panel">
          <h4 className="admin-subheading">Services (/bridal-services)</h4>
          <label className="admin-label">Page header</label>
          <input
            className="admin-input admin-input-full"
            value={sv.pageHeader}
            onChange={(e) =>
              setDraft((d) => ({ ...d, services: { ...d.services, pageHeader: e.target.value } }))
            }
            maxLength={400}
          />
          <label className="admin-label">Package CTA title</label>
          <input
            className="admin-input admin-input-full"
            value={sv.pricingCtaTitle}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pricingCtaTitle: e.target.value },
              }))
            }
            maxLength={400}
          />
          <label className="admin-label">Package CTA subtitle</label>
          <textarea
            className="admin-textarea"
            rows={2}
            value={sv.pricingCtaSub}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pricingCtaSub: e.target.value },
              }))
            }
            maxLength={12000}
          />
          <label className="admin-label">Pittsburgh button</label>
          <input
            className="admin-input admin-input-full"
            value={sv.pittsburghButtonLabel}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pittsburghButtonLabel: e.target.value },
              }))
            }
            maxLength={80}
          />
          <label className="admin-label">Atlanta button</label>
          <input
            className="admin-input admin-input-full"
            value={sv.atlantaButtonLabel}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, atlantaButtonLabel: e.target.value },
              }))
            }
            maxLength={80}
          />
          <label className="admin-label">Intro paragraph</label>
          <textarea
            className="admin-textarea"
            rows={3}
            value={sv.introText}
            onChange={(e) =>
              setDraft((d) => ({ ...d, services: { ...d.services, introText: e.target.value } }))
            }
            maxLength={12000}
          />
          <h4 className="admin-subheading">Content sections</h4>
          {sv.sections.map((sec, si) => (
            <div key={si} className="admin-about-item">
              <div className="admin-about-item-head">
                <span className="admin-about-item-label">Section {si + 1}</span>
                {sv.sections.length > 1 ? (
                  <button
                    type="button"
                    className="admin-text-btn"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        services: {
                          ...d.services,
                          sections: d.services.sections.filter((_, j) => j !== si),
                        },
                      }))
                    }
                  >
                    Remove section
                  </button>
                ) : null}
              </div>
              <input
                className="admin-input admin-input-full"
                placeholder="Section title"
                value={sec.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    services: {
                      ...d.services,
                      sections: d.services.sections.map((s, j) =>
                        j === si ? { ...s, title: v } : s,
                      ),
                    },
                  }));
                }}
                maxLength={400}
              />
              {sec.paragraphs.map((p, pi) => (
                <div key={pi} style={{ marginTop: '0.5rem' }}>
                  <label className="admin-label visually-hidden">Paragraph {pi + 1}</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={p}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDraft((d) => ({
                        ...d,
                        services: {
                          ...d.services,
                          sections: d.services.sections.map((s, j) =>
                            j === si
                              ? {
                                  ...s,
                                  paragraphs: s.paragraphs.map((x, k) => (k === pi ? v : x)),
                                }
                              : s,
                          ),
                        },
                      }));
                    }}
                    maxLength={12000}
                  />
                  {sec.paragraphs.length > 1 ? (
                    <button
                      type="button"
                      className="admin-text-btn"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          services: {
                            ...d.services,
                            sections: d.services.sections.map((s, j) =>
                              j === si
                                ? {
                                    ...s,
                                    paragraphs: s.paragraphs.filter((_, k) => k !== pi),
                                  }
                                : s,
                            ),
                          },
                        }))
                      }
                    >
                      Remove paragraph
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                className="admin-secondary-btn"
                style={{ marginTop: '0.5rem' }}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    services: {
                      ...d.services,
                      sections: d.services.sections.map((s, j) =>
                        j === si ? { ...s, paragraphs: [...s.paragraphs, ''] } : s,
                      ),
                    },
                  }))
                }
              >
                Add paragraph
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                services: {
                  ...d.services,
                  sections: [...d.services.sections, { title: '', paragraphs: [''] }],
                },
              }))
            }
          >
            Add section
          </button>
          <h4 className="admin-subheading">Footer CTA</h4>
          <input
            className="admin-input admin-input-full"
            placeholder="Title"
            value={sv.cta.title}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, cta: { ...d.services.cta, title: e.target.value } },
              }))
            }
            maxLength={300}
          />
          <input
            className="admin-input admin-input-full"
            placeholder="Subtitle"
            value={sv.cta.subtitle}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, cta: { ...d.services.cta, subtitle: e.target.value } },
              }))
            }
            maxLength={500}
          />
          <input
            className="admin-input admin-input-full"
            placeholder="Button"
            value={sv.cta.buttonText}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, cta: { ...d.services.cta, buttonText: e.target.value } },
              }))
            }
            maxLength={120}
          />
        </div>
      ) : null}

      {(bridalPage === 'pittsburgh' || bridalPage === 'atlanta') && (
        <RegionalBridalPanel
          regionKey={bridalPage}
          data={bridalPage === 'pittsburgh' ? pt : at}
          setDraft={setDraft}
        />
      )}

      {saveError ? (
        <p className="admin-error" role="alert">
          {saveError}
        </p>
      ) : null}
      <div className="admin-save-row">
        <button className="admin-submit" type="submit" disabled={saving || !isDirty}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saveSucceeded ? <SaveFeedback /> : null}
      </div>
    </form>
  );
}

function RegionalBridalPanel({ regionKey, data, setDraft }) {
  const label = regionKey === 'pittsburgh' ? 'Pittsburgh' : 'Atlanta';
  const path =
    regionKey === 'pittsburgh'
      ? '/bridal-hair-makeup-pittsburgh'
      : '/bridal-hair-makeup-atlanta-new-orleans';

  function patchRegion(next) {
    setDraft((d) => ({ ...d, [regionKey]: next }));
  }

  return (
    <div className="admin-bridal-panel">
      <h4 className="admin-subheading">
        {label} ({path})
      </h4>
      <label className="admin-label">Browser tab title</label>
      <input
        className="admin-input admin-input-full"
        value={data.documentTitle}
        onChange={(e) => patchRegion({ ...data, documentTitle: e.target.value })}
        maxLength={500}
      />
      <label className="admin-label">Meta description</label>
      <textarea
        className="admin-textarea"
        rows={3}
        value={data.metaDescription}
        onChange={(e) => patchRegion({ ...data, metaDescription: e.target.value })}
        maxLength={2000}
      />
      <label className="admin-label">Page header</label>
      <input
        className="admin-input admin-input-full"
        value={data.pageHeader}
        onChange={(e) => patchRegion({ ...data, pageHeader: e.target.value })}
        maxLength={400}
      />
      <label className="admin-label">Intro — before link</label>
      <input
        className="admin-input admin-input-full"
        value={data.introBeforeLink}
        onChange={(e) => patchRegion({ ...data, introBeforeLink: e.target.value })}
        maxLength={2000}
      />
      <label className="admin-label">Link text (services breakdown)</label>
      <input
        className="admin-input admin-input-full"
        value={data.servicesLinkText}
        onChange={(e) => patchRegion({ ...data, servicesLinkText: e.target.value })}
        maxLength={400}
      />
      <label className="admin-label">Intro — after link</label>
      <input
        className="admin-input admin-input-full"
        value={data.introAfterLink}
        onChange={(e) => patchRegion({ ...data, introAfterLink: e.target.value })}
        maxLength={2000}
      />

      <h4 className="admin-subheading">Packages</h4>
      {data.packages.map((pkg, pi) => (
        <div key={pi} className="admin-about-item">
          <div className="admin-about-item-head">
            <span className="admin-about-item-label">Package {pi + 1}</span>
            {data.packages.length > 1 ? (
              <button
                type="button"
                className="admin-text-btn"
                onClick={() =>
                  patchRegion({
                    ...data,
                    packages: data.packages.filter((_, j) => j !== pi),
                  })
                }
              >
                Remove
              </button>
            ) : null}
          </div>
          <input
            className="admin-input admin-input-full"
            placeholder="Title"
            value={pkg.title}
            onChange={(e) => {
              const v = e.target.value;
              patchRegion({
                ...data,
                packages: data.packages.map((p, j) => (j === pi ? { ...p, title: v } : p)),
              });
            }}
            maxLength={300}
          />
          <input
            className="admin-input admin-input-full"
            placeholder="Price line"
            value={pkg.price}
            onChange={(e) => {
              const v = e.target.value;
              patchRegion({
                ...data,
                packages: data.packages.map((p, j) => (j === pi ? { ...p, price: v } : p)),
              });
            }}
            maxLength={120}
          />
          <label className="admin-label">Bullets (one per line; optional if using detail only)</label>
          <textarea
            className="admin-textarea"
            rows={6}
            value={(pkg.items || []).join('\n')}
            onChange={(e) => {
              const items = e.target.value.split('\n');
              patchRegion({
                ...data,
                packages: data.packages.map((p, j) => (j === pi ? { ...p, items } : p)),
              });
            }}
            maxLength={50000}
          />
          <label className="admin-label">Detail text (e.g. flower girl; optional)</label>
          <textarea
            className="admin-textarea"
            rows={2}
            value={pkg.detailText || ''}
            onChange={(e) => {
              const v = e.target.value;
              patchRegion({
                ...data,
                packages: data.packages.map((p, j) =>
                  j === pi ? { ...p, detailText: v } : p,
                ),
              });
            }}
            maxLength={2000}
          />
        </div>
      ))}
      {data.packages.length < 15 ? (
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() =>
            patchRegion({
              ...data,
              packages: [...data.packages, { title: '', price: '', items: [], detailText: '' }],
            })
          }
        >
          Add package
        </button>
      ) : null}

      <h4 className="admin-subheading">Additional investments</h4>
      <input
        className="admin-input admin-input-full"
        placeholder="Section title"
        value={data.additionalSectionTitle}
        onChange={(e) => patchRegion({ ...data, additionalSectionTitle: e.target.value })}
        maxLength={400}
      />
      <label className="admin-label">Bullets (one per line)</label>
      <textarea
        className="admin-textarea"
        rows={6}
        value={data.additionalBullets.join('\n')}
        onChange={(e) => {
          const additionalBullets = e.target.value.split('\n');
          patchRegion({ ...data, additionalBullets });
        }}
        maxLength={20000}
      />

      <h4 className="admin-subheading">Footer CTA</h4>
      <input
        className="admin-input admin-input-full"
        value={data.cta.title}
        onChange={(e) =>
          patchRegion({ ...data, cta: { ...data.cta, title: e.target.value } })
        }
        maxLength={300}
      />
      <input
        className="admin-input admin-input-full"
        value={data.cta.subtitle}
        onChange={(e) =>
          patchRegion({ ...data, cta: { ...data.cta, subtitle: e.target.value } })
        }
        maxLength={500}
      />
      <input
        className="admin-input admin-input-full"
        value={data.cta.buttonText}
        onChange={(e) =>
          patchRegion({ ...data, cta: { ...data.cta, buttonText: e.target.value } })
        }
        maxLength={120}
      />
    </div>
  );
}
